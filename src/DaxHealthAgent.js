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
const EventEmitter = require('events');

const MaxListenersPerEvent = 1000000;

class DaxHealthAgent extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(MaxListenersPerEvent);
  }

  resolveEvent(event, args) {
    this.emit(event, args);
  }

  getRecoveryPromise(event, timeout) {
    return new Promise((resolve, reject) => {
      const to = setTimeout(() => {
        this.removeListener(event, cb);
        return reject();
      }, timeout);
      const cb = (data) => {
        clearTimeout(to);
        return resolve(data);
      };
      this.once(event, cb);
    });
  }
}

module.exports = DaxHealthAgent;
