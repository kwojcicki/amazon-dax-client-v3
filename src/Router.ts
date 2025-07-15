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

/**
 * Randomized router over an array of entries.
 */
class Router {
  constructor(values, leaderCnt) {
    if(!values) {
      throw new DaxClientError('routes must not be null', DaxErrorCode.IllegalArgument, false);
    }
    if(leaderCnt > values.length) {
      throw new DaxClientError('leader count must be <= routes', DaxErrorCode.IllegalArgument, false);
    }

    this._values = values;
    this._leaderCnt = leaderCnt;
  }

  /**
   * Returns the next leader entry that is not the given prev value if one such entry is available.
   * If there is only one entry and that is equals to prev, return a different non-leader entry, otherwise prev is returned.
   * Returns null if nothing is available.
   */
  nextLeader(prev) {
    let next = this._next(prev, this._leaderCnt);
    if(!next || next === prev) {
      return this.nextAny(prev);
    }
    return next;
  }

  /**
   * Returns any entry that is not the given prev value, if any such entry is available.
   * If there is only one entry and that is equals to prev, prev is returned.
   * Returns null if nothing is available.
   */
  nextAny(prev) {
    return this._next(prev, this._values.length);
  }

  _next(prev, len) {
    if(len === 0) {
      return null;
    }
    if(len === 1) {
      return this._values[0];
    }
    let idx = Math.floor(Math.random() * len);
    if(this._values[idx] === prev) {
      if(++idx >= len) {
        idx -= len;
      }
    }

    return this._values[idx];
  }

  size() {
    return this._values.length;
  }

  leadersCount() {
    return this._leaderCnt;
  }
}

module.exports = Router;
