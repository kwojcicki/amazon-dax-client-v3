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

class CacheFactory {
  static create(CacheType, size) {
    if(!CacheType) {
      throw new Error('not support Cache type');
    }
    return new CacheType();
  }
}

class Cache {
  // plain object cache
  constructor(size) {
    this._size = size;
    this._cache = {};
  }

  get(key) {
    return this._cache[key];
  }

  put(key, val) {
    let old = this._cache[key];
    this._cache[key] = val;
    return old;
  }

  remove(key) {
    delete this._cache[key];
  }
}

class StringListCache {
// internal storage structure { _hash: [ [key, value], ...] }
// when insert an string-list key into JS object, it will automatically
// convert into string seperated by comma e.g. ['1', '2'] => '1,2'
// to solve the conflicts we have to store its real value
// For performance, arrays are compared as if they are sorted
  constructor(size) {
    this._size = size;
    this._cache = {};
  }

  _hash(key) {
    return key.toString();
  }

  get(key) {
    let keyValuePairs = this._cache[this._hash(key)];
    if(!keyValuePairs) {
      return null;
    }
    // compare real key
    for(let keyValuePair of keyValuePairs) {
      let storedKey = keyValuePair[0];
      if(Util.sortedArrayEquals(key, storedKey)) {
      // if we agree on sort first then check cache, we can use in order compare, which will save a lot
        return keyValuePair[1];
      }
    }
    // pairs is empty array
    return null;
  }

  put(key, val) {
    let old = this.get(key);
    let hashedKey = this._hash(key);
    if(!this._cache[hashedKey]) {
      this._cache[hashedKey] = [];
    }
    let keyValuePairs = this._cache[hashedKey];
    if(old !== null && old !== undefined) {
      for(let pair of keyValuePairs) {
        if(Util.sortedArrayEquals(pair[0], key)) {
          pair[1] = val;
          return old;
        }
      }
    }
    keyValuePairs.push([key, val]);
    return old;
  }

  remove(key) {
    let hashKey = this._hash(key);
    let keyValuePairs = this._cache[hashKey];
    if(keyValuePairs) {
      for(let i = 0; i < keyValuePairs.length; ++i) {
        let pair = keyValuePairs[i];
        if(Util.sortedArrayEquals(pair[0], key)) {
          // delete this entry
          this._cache[hashKey].splice(i, 1);
          return;
        }
      }
    }
  }
}

const CacheType = {
  Cache: Cache,
  StringListCache: StringListCache,
};

module.exports = {
  Cache: Cache,
  StringListCache: StringListCache,
  CacheType: CacheType,
  CacheFactory: CacheFactory,
};
