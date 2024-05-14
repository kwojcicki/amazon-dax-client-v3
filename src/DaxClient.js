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

const RefreshingCache = require('./RefreshingCache');
const SimpleCache = require('./SimpleCache');
const Operations = require('../generated-src/Operations');
const CacheType = require('./Cache').CacheType;

const CACHE_SIZE = 250;
const KEY_CACHE_TTL_MILLIS = 60000;

class DaxClient {
  constructor(pool, region, exceptionListener, requestTimeout) {
    this._exceptionListener = exceptionListener;

    let keyCache = new RefreshingCache(CACHE_SIZE, {
      fetch: (tableName) => {
        return this._defineKeySchema(tableName);
      },
    }, KEY_CACHE_TTL_MILLIS);

    let attrListCache = new SimpleCache(CACHE_SIZE, (attributeListId) => {
      return this._defineAttributeList(attributeListId);
    });

    let attrListIdCache = new SimpleCache(CACHE_SIZE, (attributeNames) => {
      return this._defineAttributeListId(attributeNames);
    }, CacheType.StringListCache);

    this.operations = new Operations(keyCache, attrListCache, attrListIdCache, pool, requestTimeout);

    this._tubePool = pool;
    this._keyCache = keyCache;
    this._attrListCache = attrListCache;
  }

  shutdown() {
    if(this._tubePool) {
      this._tubePool.close();
    }
  }

  _defineKeySchema(tableName) {
    return this.operations.defineKeySchema_N742646399_1(tableName);
  }

  _defineAttributeList(attributeListId) {
    // attrListId 1 is defined to be the empty list of names
    if(attributeListId == 1) {
      return Promise.resolve([]);
    }

    return this.operations.defineAttributeList_670678385_1(attributeListId);
  }

  _defineAttributeListId(attributeNames) {
    // An empty attrList has a defined value of 1
    if(attributeNames.length === 0) {
      return Promise.resolve(1);
    }

    return this.operations.defineAttributeListId_N1230579644_1(attributeNames);
  }

  endpoints() {
    return this.operations.endpoints_455855874_1();
  }

  batchGetItem(request) {
    return this.operations.batchGetItem_N697851100_1(request);
  }

  batchWriteItem(request) {
    return this.operations.batchWriteItem_116217951_1(request);
  }

  getItem(request) {
    return this.operations.getItem_263244906_1(request);
  }

  putItem(request) {
    return this.operations.putItem_N2106490455_1(request);
  }

  deleteItem(request) {
    return this.operations.deleteItem_1013539361_1(request);
  }

  updateItem(request) {
    return this.operations.updateItem_1425579023_1(request);
  }

  query(request) {
    return this.operations.query_N931250863_1(request);
  }

  scan(request) {
    return this.operations.scan_N1875390620_1(request);
  }

  transactGetItems(request) {
    return this.operations.transactGetItems_1866287579_1(request);
  }

  transactWriteItems(request) {
    return this.operations.transactWriteItems_N1160037738_1(request);
  }
}

module.exports = DaxClient;
