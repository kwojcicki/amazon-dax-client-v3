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

const CacheType = require('./Cache').CacheType;
const CacheFactory = require('./Cache').CacheFactory;

class SimpleCache {
  constructor(size, fetch, type) {
    if(!type) { // default choose obj literal Cache
      type = CacheType.Cache;
    }
    this._size = size;
    this._fetch = fetch;
    this._cache = CacheFactory.create(type, size);
    this._reqOnFly = {};
  }

  get(key) {
    let value = this._cache.get(key);
    if(value !== null && value !== undefined) {
      // already have at local
      return Promise.resolve(value);
    } else {
      if(!this._reqOnFly[key]) {
        // no request on fly
        let p = this._fetch(key).then((val) => {
          this._cache.put(key, val);
          delete this._reqOnFly[key];
          return Promise.resolve(val);
        }).catch((err) => {
          delete this._reqOnFly[key];
          throw err;
        });
        this._reqOnFly[key] = p;
        return p;
      } else {
        // request on fly
        return this._reqOnFly[key];
      }
    }
  }

  contain(key) {
    let value = this._cache.get(key);
    if(value !== null && value !== undefined) {
      return value;
    } else {
      return false;
    }
  }

  put(key, value) {
    return this._cache.put(key, value);
  }

  remove(key) {
    this._cache.remove(key);
  }
}

module.exports = SimpleCache;
