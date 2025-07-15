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

class ControllablePromise {
  constructor(timeout, timeoutError) {
    this._done = false;
    this._promise = new Promise((resolve, reject) => {
      if(timeout > 0) { // if timeout less or equal to 0, it means no timeout.
        this._to = setTimeout(() => {
          this._done = true;
          return reject(timeoutError);
        }, timeout);
      }
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  isDone() {
    return this._done;
  }

  then(f) {
    return this._promise.then(f);
  }

  catch(f) {
    return this._promise.catch(f);
  }

  resolve(args) {
    if(this._to) {
      clearTimeout(this._to);
    }
    this._done = true;
    return this._resolve(args);
  }

  reject(err) {
    if(this._to) {
      clearTimeout(this._to);
    }
    this._done = true;
    return this._reject(err);
  }
}

module.exports = ControllablePromise;
