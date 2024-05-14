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
const Util = require('./Util');
const SessionVersion = require('./SessionVersion');
const MIN_ERROR_COUNT_FOR_UNHEALTHY = 5;

/** A backend service destination. */
class Backend {
  constructor(cluster, serviceEndpoint, maxPendingConnectionPerHost) {
    this.errorCount = 0;
    this._cluster = cluster;
    this._config = serviceEndpoint;
    this.addr = (serviceEndpoint.address ? serviceEndpoint.address : serviceEndpoint.hostname);
    this.port = serviceEndpoint.port;
    /* TODO Not sure if this is the best policy, as a high  maxPendingConnectionPerHost will defeat the purpose of
        this change to bring down the bad hosts before the health checks could happen.*/
    this._errorCountForUnhealthy = Math.max(maxPendingConnectionPerHost / 2, MIN_ERROR_COUNT_FOR_UNHEALTHY);
  }

  /**
   * Updates the backend to match the given configuration,
   * returning true if there were changes.
   */
  update(newBe) {
    if(!Util.objEqual(this._config, newBe._config)) {
      this._config = newBe._config;
      return true;
    }
    return false;
  }

  close() {
    if(this.closed) {
      return;
    }
    this.closed = true;
    this.session = SessionVersion.create();
    this.healthy = false;

    let dial = this.connect; // health check job. set by Cluster.
    if(dial) {
      clearInterval(dial);
    }

    this.down();
  }

  /**
   * Activates this backend, adding it to the active cluster set,
   * using the supplied client for access.
   */
  up(client) {
    if(!this.active && !this.closed) {
      this.active = true;
      this.client = client;
    }
    this._cluster.addRoute(this);
  }

  /**
   * Deactivates this backend, removing it from the active cluster set,
   * and shutting down its client.
   */
  down() {
    if(!this.active) {
      return;
    }

    this._cluster.removeRoute(this);
    this.active = false;
    if(this.client) {
      this._cluster.unregisterAndClose(this.client);
      this.client = null;
    }
  }

  leader() { // 1 is leader, 2 is replica
    return this._config.role == 1;
  }

  onIoException() {
    if(this.active) {
      if(++this.errorCount > this._errorCountForUnhealthy) {
        this.healthy = false;
        this.down();
      }
    }
  }
}

module.exports = Backend;
