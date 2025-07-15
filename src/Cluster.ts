/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not
 * use this file except in compliance with the License. A copy of the License
 * is located at
 *
 *    http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
'use strict';
const SessionVersion = require('./SessionVersion');
const Backend = require('./Backend');
const Router = require('./Router');
const DaxHealthAgent = require('./DaxHealthAgent');
const Source = require('./Source');
const SocketTubePool = require('./Tube').SocketTubePool;
const ClientTube = require('./Tube').ClientTube;
const Connector = require('./Tube').Connector;
const Util = require('./Util');
const { ENCRYPTED_SCHEME } = require('./Util');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

const IDLE_CONNECTION_REAP_DELAY_MS = 5000;
const ClusterHealthyEvent = 'health';
const ROUTE_UPDATE_EVENT = 'Routes Update';
const LEADER_ROUTE_UPDATE_EVENT = 'Routes of Leader Update';

// adapted from https://github.com/aws/aws-sdk-js/blob/880e811e857c34e4ad983c37837767cd5eddb98f/lib/credentials.js
class StaticCredentialProvider {
  constructor() {
    this.expired = false;
    this.expireTime = null;
    this.refreshCallbacks = [];
  }

  resolvePromise() {
    const outerThis = this;
    var EXPIRATION_MS = 3e5;
    if (!this.accessKeyId || (this.expiration && this.expiration.getTime() - Date.now() < EXPIRATION_MS)) return this.creds().then((creds) => {
      // if (this.expiration && this.expiration.getTime() - Date.now() < EXPIRATION_MS) console.log("refreshing creds");
      this.accessKeyId = creds.accessKeyId;
      this.secretAccessKey = creds.secretAccessKey;
      this.sessionToken = creds.sessionToken;
      this.expiration = creds.expiration;
      return outerThis;
    });

    return Promise.resolve(this);
  }
}

class Cluster {
  constructor(config, daxManufacturer, source) {
    // config, just put it here, will delete unused part
    this._maxPendingConnectsPerHost = config.maxPendingConnectsPerHost ? config.maxPendingConnectsPerHost : 10;
    // Using a relatively high default interval (4 seconds, a little less
    // than the leader timeout) for automatic background updates of the
    // cluster state. This prevents connection churn in the steady-state
    // for stable healthy clusters. Using too short of an interval ends up
    // being a scalability issue as it leaves many connections in TIME_WAIT
    // on the nodes as the number of clients increases.
    this._clusterUpdateThreshold = config.clusterUpdateThreshold || 125;
    this._clusterUpdateInterval = config.clusterUpdateInterval || 4000;
    this._connectTimeout = config.connectTimeout || 10000; // set timeout longer than JAVA client to avoid too many timeout caused by en/decoding inefficiency.
    this._requestTimeout = config.requestTimeout || 60000;
    this._healthCheckInterval = config.healthCheckInterval || 5000;
    this._healthCheckTimeout = config.healthCheckTimeout || 1000;
    this._maxRetryDelay = config.maxRetryDelay || 7000;
    this._threadKeepAlive = config.threadKeepAlive || 10000;
    this._skipHostnameVerification = config.skipHostnameVerification != null ? config.skipHostnameVerification : false;
    if (config.credentials) {
      this._credProvider = new StaticCredentialProvider(config.credentials);
    } else {
      throw new Error("Expecting DAX to use static credentials");
    }
    this._region = config.region || this._resolveRegion(); // FIXME default region
    this._seeds = config.endpoints ? Util.parseHostPorts(config.endpoints) : (config.endpoint ? Util.parseHostPorts(config.endpoint) : null);
    const containsSeed = this._seeds != null && this._seeds.length > 0; // This exists because many unit tests don't enumerate seeds.
    const endpointScheme = containsSeed ? this._seeds[0].scheme : null;
    this._isEncrypted = endpointScheme == ENCRYPTED_SCHEME;
    this._endpointHost = containsSeed ? this._seeds[0].host : null;
    this._manufacturer = daxManufacturer;
    this._closed = false;
    this._source = source ? source : Source.autoconf(this, this._seeds);
    this._alive = new Set();
    this._daxHealthAgent = new DaxHealthAgent();
    this._pools = new Set();
    this._backends = {};
    this._startupComplete = false;
  }

  _resolveRegion() { // read user's env, should add EC2 metadata in the future
    return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || process.env.AMAZON_REGION || 'us-east-1';
  }

  startup() {
    if (this._closed) {
      throw new Error('Cluster closed');
    }

    if (!this._source) {
      this._source = Source.autoconf(this, this._seeds);
    }

    // Setup cluster refresh job before trying
    // to bootstrap cluster in case the refresh() call fails.
    let refreshIntervalMs = this._clusterUpdateInterval;
    this._refreshJob = setInterval(() => {
      if (!this._closed) {
        this.refresh(true, (err) => {
          if (err) { // FIXME this err not need to throw error or pass out, just handle at here
            console.error('caught exception during cluster refresh:', err);
            console.error(err.stack);
          }
        });
      }
    }, refreshIntervalMs);
    this._refreshJob.unref(); // unref to let Lambda finish

    this.refresh(false, (err) => {
      if (err) {
        // maybe change it to logging
        console.error(err);
      }
    });
  }

  startupComplete() {
    return this._startupComplete;
  }

  newClient(host, port, session, tube, el) {
    let pool = new SocketTubePool(host, port, this._credProvider, this._region, IDLE_CONNECTION_REAP_DELAY_MS, this._connectTimeout, tube, this._seeds, this._skipHostnameVerification);

    // Register pool for periodic idle connection reaping.
    this._pools.add(pool);
    return this._manufacturer.createDaxClient(pool, this._region, el);
  }

  leaderClient(prev) {
    let routes = this._routes;
    if (!routes) {
      throw new DaxClientError('No endpoints available', DaxErrorCode.NoRoute, true);
    }

    return routes.nextLeader(prev);
  }

  readClient(prev) {
    let routes = this._routes;
    if (!routes) {
      // return null
      throw new DaxClientError('No endpoints available', DaxErrorCode.NoRoute, true);
    }
    return routes.nextAny(prev);
  }

  close() {
    if (this._closed) {
      return;
    }
    this._closed = true;
    if (this._refreshJob) {
      clearInterval(this._refreshJob);
    }
    if (this._reapJob) {
      clearInterval(this._reapJob);
    }

    Object.keys(this._backends).forEach((key) => {
      this._backends[key].close();
    });

    this._pools.clear();
    this._backends = {};
    this._alive.clear();
    this._routes = null;
  }

  refresh(forced, callback) {
    let now = Date.now();
    if (this._closed || (now - this._lastUpdate < this._clusterUpdateThreshold && !forced) || !this._source) {
      return;
    }
    this._lastUpdate = now;
    this._source.refresh((err) => {
      this._startupComplete = true;
      callback(err);
    });
  }

  update(cfg) {
    if (cfg && cfg.length > 0) {
      this._cfg = cfg;
      this._updateEndpoints();
    }
  }

  unregisterAndClose(client) {
    this._pools.delete(client._tubePool);
    client.shutdown();
  }

  _updateEndpoints() {
    let se = this._cfg;
    let backends = this._backends;

    let rebuild = false;
    let newBackends = this._expand(se);

    Object.keys(newBackends).forEach((key) => {
      let be = backends[key];
      let newbe = newBackends[key];
      if (be) {
        // update existing backends. node may have changed role or other
        // metadata affecting routing.
        rebuild |= be.update(newbe);
        return;
      }
      // set initial session
      newbe.session = SessionVersion.create();
      // add new backend destination.
      backends[key] = newbe;
      // start health checks.
      this._connect(newbe);
    });

    if (rebuild) {
      this._rebuildRoutes();
    }

    // clear out removed backends.
    Object.keys(backends).forEach((key) => {
      if (!newBackends[key]) {
        // backend no longer exists in the new configuration.
        // remove and close it.
        let old = backends[key];
        delete backends[key];
        old.close();
      }
    });

    // Refresh completed successfully.
    // We are using Endpoints API call for health check.
    // Signal all threads waiting for cluster to be healthy.
    for (let ep of se) {
      if (ep.role == 1) { // leader
        this._leaderSessionId = ep.leaderSessionId;
        // mClusterHealthy.signalAll();
        // trigger TODO
        this._daxHealthAgent.resolveEvent(ClusterHealthyEvent);
        break;
      }
    }
  }

  // only for test
  _waitForRoutes(minumum, leadersMin) {
    let maxPollingCount = 10;
    let pollingCount = 0;
    let pollingInterval = this._requestTimeout / maxPollingCount;
    let routes;
    let p = new Promise((resolve, reject) => {
      let waitjob = setInterval(() => {
        if ((routes = this._routes) && routes.size() >= minumum && routes.leadersCount() >= leadersMin) {
          clearInterval(waitjob);
          return resolve();
        }

        if (++pollingCount >= maxPollingCount) {
          clearInterval(waitjob);
          return reject(new Error('failed to wait for routes'));
        }
      }, pollingInterval);
    });
    return p;
  }

  _waitForBackend(be, aliveOrDead) { // true is waitForAlive, false is waitForDead
    return new Promise((resolve, reject) => {
      let maxPolling = 10;
      let polling = 0;

      let pollJob = setInterval(() => {
        if (this._alive.has(be) ^ aliveOrDead) {
          if (++polling >= maxPolling) {
            clearInterval(pollJob);
            return reject(new Error('max polling exceed'));
          }
        } else {
          clearInterval(pollJob);
          return resolve();
        }
      }, 100);
    });
  }

  waitForRoutesRebuilt(isLeader) {
    let eventToListen = isLeader ? LEADER_ROUTE_UPDATE_EVENT : ROUTE_UPDATE_EVENT;

    return this._daxHealthAgent.getRecoveryPromise(eventToListen, this._maxRetryDelay).catch(() => {
      return Promise.reject(new DaxClientError('fail to wait for routes rebuild', DaxErrorCode.NoRoute));
    });
  }

  waitForRecovery(leaderSessionId, time) {
    if (time <= 0) {
      return Promise.resolve();
    }

    // Quick check before blocking on health lock.
    if (this._leaderSessionId != leaderSessionId) {
      // Endpoints updated.
      return Promise.resolve();
    }

    return this._daxHealthAgent.getRecoveryPromise(ClusterHealthyEvent, time).catch(() => {
      return Promise.reject(new DaxClientError('fail to wait for cluster recovery', DaxErrorCode.NoRoute));
    });
  }

  _connect(be) {
    if (be.connect) {
      throw new Error('backend already been connected');
    }

    let healthCheck = () => {
      let startTime = Date.now();
      let session = be.session;
      let connector = new Connector(this._isEncrypted, be.addr, be.port, this._skipHostnameVerification, this._endpointHost);
      const tube = new ClientTube(connector.connect(() => {
        be._PingLatency = Date.now() - startTime;
        this._onHealthCheck(be, session, tube);
      }), session, this._credProvider, this._region);
      tube.socket.on('error', (err) => {
        this._onHealthCheck(be, session, tube, err);
      });
    };
    be.connect = setInterval(healthCheck, this._healthCheckInterval);
    be.connect.unref();
    healthCheck();
  }

  _onHealthCheck(be, session, tube, e) {
    let current = this._backends[be.addr + ':' + be.port];
    if (this._closed || current !== be) {
      // stale notification. backend no longer exists in the current known set.
      // close the backend and created tube.
      be.close();
      if (tube) {
        tube.close();
      }
      return;
    }

    // try and allow the tube to be used to bootstrap the pool for this backend.
    let closeTube = true;
    try {
      if (session != be.session) {
        // check was initiated during previous session. don't change
        // any health status. allow check to be scheduled again with
        // the new version to make the determination.
        return;
      }

      if (e && be.healthy) {
        // remove backend from active set.
        be.healthy = false;
        be.down();
      } else if (!e && !be.healthy && !be.closed) {
        // add backend to active set.
        try {
          // build new client, giving it the tube established
          // for this health check.
          be.errorCount = 0;
          be.healthy = true;
          be.up(this.newClient(be.addr, be.port, session, tube, be));

          closeTube = false;
        } catch (ie) {
          be.healthy = false;
          be.down();
          throw new Error('client creation failed for backend: ' + be +
            ' exception = ' + ie);
        }
      } else if (!e) {
        // host is healthy, reset the error counts from piling up and prevent host from going down unnecessarily.
        be.errorCount = 0;
      }
    } finally {
      if (closeTube && tube) {
        tube.close();
      }
    }
  }

  _rebuildRoutes() {
    let bes = this._alive;
    let sz = bes.size;
    if (sz === 0) {
      this._routes = null;
      return;
    }

    let ldr = 0;
    let cs = [];
    bes.forEach((be) => {
      if (be.leader()) {
        cs[ldr++] = be.client;
      } else {
        cs[--sz] = be.client;
      }
    });

    this._routes = new Router(cs, ldr);
    this._daxHealthAgent.resolveEvent(ROUTE_UPDATE_EVENT);
    if (ldr > 0) {
      this._daxHealthAgent.resolveEvent(LEADER_ROUTE_UPDATE_EVENT);
    }
  }

  addRoute(be) {
    if (!this._alive.has(be)) { // Set is reference check, can be used here
      this._alive.add(be);
      this._rebuildRoutes();
    }
  }

  removeRoute(be) {
    if (this._alive.has(be)) {
      this._alive.delete(be);
      this._rebuildRoutes();
    }
  }

  _expand(se) {
    let backends = {};
    for (let ep of se) {
      let be = new Backend(this, ep, this._maxPendingConnectsPerHost);
      backends[be.addr + ':' + be.port] = be;
    }
    return backends;
  }
}

module.exports = Cluster;
