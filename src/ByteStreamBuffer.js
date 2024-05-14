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

const DEFAULT_INIT_SIZE = 1024;
class ByteStreamBuffer {
  constructor(size) {
    this._pos = 0;
    this._end = 0;
    this.buf = Buffer.alloc(size || DEFAULT_INIT_SIZE);
  }

  write(data, length) {
    // length writing only support for buffer target
    if(!length && length !== 0) {
      length = data.length;
    }

    if(typeof data === 'string') {
      this._ensureSpaces(length * 4); // each utf8 character will be converted at most 4 bytes
      this._end += this.buf.write(data, this._end, 'utf8');
    } else if(Buffer.isBuffer(data)) {
      this._ensureSpaces(length);
      this._end += data.copy(this.buf, this._end, 0, length);
    } else {
      throw new TypeError('buf.write() only support Buffer/string');
    }
  }

  _ensureSpaces(size) {
    if(size + this._end > this.buf.length) {
      let needSize = size + this._end - this._pos;

      let destBuf = this.buf;
      if(needSize > this.buf.length) {
        // Only grow the buffer if necessary
        let enlargeSize = this.buf.length;
        while(enlargeSize < needSize) {
          enlargeSize <<= 1;
        }

        destBuf = Buffer.alloc(enlargeSize);
      }

      // copy is well-defined even if source and target are the same buffer
      let newend = this.buf.copy(destBuf, 0, this._pos, this._end);
      this.buf = destBuf;
      this._pos = 0;
      this._end = newend;
    }
  }

  read(num) {
    let resultSlice = this.readSlice(num);
    if(!resultSlice) {
      return resultSlice;
    }

    // copy to a result buffer
    // because of buffer reuse, a slice may get overwritten and cause
    // hard-to-find bugs (ask me how I know...)
    return Buffer.from(resultSlice);
  }

  readAsString(num, encoding) {
    return this.readSlice(num).toString(encoding || 'utf8');
  }

  readSlice(num) {
    num = num || this.length;

    if(num < 0) {
      throw new Error('num must be greater than 0');
    } else {
      let result = this.buf.slice(this._pos, this._pos + num);
      this._pos += result.length;
      return result;
    }
  }

  reset() {
    this._pos = 0;
    this._end = 0;
  }

  get length() {
    return this._end - this._pos;
  }
}

module.exports = ByteStreamBuffer;
