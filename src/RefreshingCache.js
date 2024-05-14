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
const SimpleCache = require('./SimpleCache');

class RefreshingCache extends SimpleCache {
  constructor(size, fetcher, timeToLiveMills) {
    super(size, (key) => {
      return fetcher.fetch(key).then((val) => {
        return Promise.resolve([val, Date.now()]);
      });
    });
    this._mTimeToLive = timeToLiveMills;
  }

  get(key) {
    return super.get(key).then((innerValue) => {
      if(innerValue === null || (innerValue[1] + this._mTimeToLive < Date.now())) {
        // console.log('expire:', Date.now())
        super.remove(key);
        return super.get(key).then((innerValue) => {
          return Promise.resolve(!innerValue ? null : innerValue[0]);
        });
      } else {
        // console.log('valid:', Date.now())
        return Promise.resolve(!innerValue ? null : innerValue[0]);
      }
    });
  }

  put(key, value) {
    let newInnerValue = [value, Date.now()];
    let oldInnerValue = super.put(key, newInnerValue);
    return (!oldInnerValue ? null : oldInnerValue[0]);
  }
}

module.exports = RefreshingCache;
