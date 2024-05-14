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
const dns = require('dns');
const net = require('net');
const Util = require('./Util');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

class Source {
  static autoconf(cluster, seeds) {
    if(!seeds || !seeds.length) {
      throw new DaxClientError('no configuration seed hosts provided', DaxErrorCode.IllegalArgument, false);
    }
    return new AutoconfSource(cluster, seeds);
  }
}

class AutoconfSource {
  constructor(cluster, seeds) {
    this._cluster = cluster;
    this._seeds = seeds;
  }

  refresh(callback) {
    this._pullWithRetry(this._seeds, (err, cfg) => {
      if(err) {
        callback(err);
      } else {
        this._checkConfig(cfg);
        callback();
      }
    });
  }

  _checkConfig(newCfg) {
    let existing = this._services;
    let latest = newCfg;
    // update only if configuration has changed.
    if(existing && Util.arrayEquals(existing, latest)) {
      return;
    }

    this._services = latest;
    this._cluster.update(latest);
  }

  _resolveAddr(dests, index, callback) {
    if(index >= dests.length) {
      return callback(new DaxClientError('not able to resolve address: ' + JSON.stringify(dests), DaxErrorCode.NoRoute));
    }

    let dest = dests[index];
    if(net.isIP(dest.host) !== 0) {
      return process.nextTick(() => {
        this._pull([dest.host], dest.port, (err, newCfg) => {
          if(err) {
            this._resolveAddr(dests, index + 1, callback);
          } else {
            callback(null, newCfg);
          }
        });
      });
    } else {
      // console.log(`Resolving ${dest.host}...`);
      dns.resolve(dest.host, (err, addrs) => {
        if(err) {
          console.error(`Failed to resolve ${dest.host}:`, err);
          this._resolveAddr(dests, index + 1, callback);
        } else {
          this._pull(addrs, dest.port, (err, newCfg) => {
            if(err) {
              console.error(`Failed to pull from ${dest.host} (${addrs}):`, err);
              this._resolveAddr(dests, index + 1, callback);
            } else {
              return callback(null, newCfg);
            }
          });
        }
      });
    }
  }

  _pull(addrs, port, callback) {
    if(addrs.length > 1) {
      // randomize multiple addresses; in-place fischer-yates shuffle.
      for(let j = addrs.length - 1; j > 0; --j) {
        let k = Math.round(Math.random() * j);
        let tmp = addrs[k];
        addrs[k] = addrs[j];
        addrs[j] = tmp;
      }
    }

    // Sequentially iterate through all nodes. Any of them succeed will return new
    // endpoints config.
    let refreshEndpoints = Promise.reject();
    for(let ia of addrs) {
      refreshEndpoints = refreshEndpoints.catch(() => {
        return this._pullFrom(ia, port).then((newCfg) => {
          if(newCfg && newCfg.length) {
            return callback(null, newCfg);
          } else {
            throw new Error('not able to find configuration');
          }
        });
      });
    }

    return refreshEndpoints.catch((err) => {
      return callback(err);
    });
  }

  _pullWithRetry(dests, callback) {
    // one retry
    this._resolveAddr(dests, 0, (err, cfg) => {
      if(err) {
        // give one more try for each endpoint
        this._resolveAddr(dests, 0, (err, cfg) => {
          if(err) {
            callback(err);
          } else {
            callback(null, cfg);
          }
        });
      } else {
        callback(null, cfg);
      }
    });
  }

  _pullFrom(host, port) {
    let client;
    try {
      // assume Async Error thrown by "newClient()" will be suppressed inside
      client = this._cluster.newClient(host, port);
      return client.endpoints().then((cfg) => {
        this._cluster.unregisterAndClose(client);
        return cfg;
      }).catch((err) => {
        this._cluster.unregisterAndClose(client);
        throw err;
      });
    } catch(err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Source;
