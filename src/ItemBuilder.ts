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
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

class ItemBuilder {
  constructor() {
    this._item = {};
  }

  toItem() {
    ItemBuilder._cleanup(this._item);
    return this._item.M;
  }

  with(path, av) {
    let p = this._item;
    let prev;
    for(let loc of path) {
      switch(typeof loc) {
        case 'string':
          if(!p.M) {
            p.M = {};
          }
          if(!p.M[loc]) {
            p.M[loc] = {};
          }
          prev = p;
          p = p.M[loc];
          break;
        case 'number':
          if(!Array.isArray(p.L)) {
            p.L = [];
          }
          if(!p.L[loc]) {
            p.L[loc] = {};
          }
          prev = p;
          p = p.L[loc];
          break;
        default:
          throw new DaxClientError('shouldn\'t be here', DaxErrorCode.MalformedResult);
      }
    }
    let lastchild = path[path.length-1];
    let lasttype = (typeof lastchild === 'string' ? 'M' : 'L');
    prev[lasttype][lastchild] = av;
    return this;
  }

  /** Remove any missing elements from arrays.
   *
   * Given
   *   { a: { b: [4, 5, 6] } }
   *
   * For a proj. expression 'a.b[2], a.b[0]' the expected result is:
   *
   *  { a: { b: [4, 6] } }
   *
   *  That is, document order is preserved, but not the exact location.
   *  The ItemBuilder inserts in the exact location, and then the cleanup
   *  step removes any empty elements.
   *
   */
  static _cleanup(item) {
    // ignore primitive types
    if(typeof item !== 'object') {
      return;
    }

    for(let x in item) {
      if(x === 'L') {
        // filter ignores missing elements, so just copy everything else
        item.L = item.L.filter(() => true);
        for(let y in item.L) {
          if(Object.prototype.hasOwnProperty.call(item.L, y)) {
            ItemBuilder._cleanup(y);
          }
        }
      } else {
        ItemBuilder._cleanup(item[x]);
      }
    }
  }
}

module.exports = ItemBuilder;
