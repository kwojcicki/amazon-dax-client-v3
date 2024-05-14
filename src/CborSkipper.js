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

const CborTypes = require('./CborTypes');
const SHIFT32 = Math.pow(2, 32);
const {NeedMoreData} = require('./CborDecoder');

/** Skip over CBOR while validating structure.
 *
 * This will check if the CBOR in a buffer is correct and complete by reading each CBOR token
 * and advancing the appropriate number of bytes.
 *
 * @returns the number of complete items skipped over, or `null` if the end of the skipped
 *          region occurs in the middle of a CBOR value
 */
exports.skipCbor = function skipCbor(data, start, end) {
  try {
    return SKIPPER.reset(data, start, end).skip();
  } catch(e) {
    if(e instanceof NeedMoreData) {
      return null;
    } else {
      throw e;
    }
  }
};

class CborSkipper {
  reset(data, start, end) {
    this.buffer = data;
    this.offset = start || 0;
    this.end = end === undefined ? data.length : end;

    return this;
  }

  /**
   * Skips over as many CBOR values as possible, until the end is reached.
   *
   * @returns the number of complete items skipped over
   * @throws NeedMoreData if the end of the skipped region occurs in the middle of a CBOR value
   */
  skip() {
    let count = 0;
    while(this.offset < this.end) {
      let t = this.nextType();
      this.skipItem(t);
      ++count;
    }
    this._ensureAvailable(0);
    return count;
  }

  nextType() {
    this._ensureAvailable(1);
    return this.buffer[this.offset++];
  }

  skipItem(t) {
    let mt = CborTypes.majorType(t);
    switch(mt) {
      case CborTypes.TYPE_POSINT:
      case CborTypes.TYPE_NEGINT:
        this.skipInt(t);
        break;

      case CborTypes.TYPE_BYTES:
      case CborTypes.TYPE_UTF:
        this.skipByteString(t);
        break;

      case CborTypes.TYPE_ARRAY:
        this.skipArray(t);
        break;

      case CborTypes.TYPE_MAP:
        this.skipMap(t);
        break;

      case CborTypes.TYPE_TAG:
        this.skipTag(t);
        this.skipItem(this.nextType()); // skip the tagged item as well
        break;

      case CborTypes.TYPE_SIMPLE:
        this.skipSimple(t);
        break;

      default:
        throw new Error('Unexpected major type ' + mt);
    }
  }

  skipInt(t) {
    let size = CborTypes.minorType(t);
    switch(size) {
      case CborTypes.SIZE_8:
        this.offset += 1;
        break;

      case CborTypes.SIZE_16:
        this.offset += 2;
        break;

      case CborTypes.SIZE_32:
        this.offset += 4;
        break;

      case CborTypes.SIZE_64:
        this.offset += 8;
        break;

      default:
        if(size < CborTypes.SIZE_8) {
          // no need to advance
          return;
        } else {
          throw new Error('Unexpected size for integer');
        }
    }
  }

  skipByteString(t) {
    let size = this.readLength(t);
    if(size != -1) {
      this.offset += size;
    } else {
      while(t != CborTypes.TYPE_BREAK) {
        t = this.nextType();
        this.skipItem(t);
      }
    }
  }

  skipArray(t) {
    let size = this.readLength(t);
    if(size != -1) {
      for(let i = 0; i < size; i++) {
        this.skipItem(this.nextType());
      }
    } else {
      while(t != CborTypes.TYPE_BREAK) {
        t = this.nextType();
        this.skipItem(t);
      }
    }
  }

  skipMap(t) {
    let size = this.readLength(t);
    if(size != -1) {
      for(let i = 0; i < size; i++) {
        this.skipItem(this.nextType()); // key
        this.skipItem(this.nextType()); // value
      }
    } else {
      while(true) {
        t = this.nextType();
        if(t == CborTypes.TYPE_BREAK) {
          break;
        }
        this.skipItem(t); // key
        this.skipItem(this.nextType()); // value
      }
    }
  }

  skipTag(t) {
    this.skipInt(t);
  }

  skipSimple(t) {
    switch(t) {
      case CborTypes.TYPE_BREAK:
      case CborTypes.TYPE_NULL:
      case CborTypes.TYPE_UNDEFINED:
      case CborTypes.TYPE_TRUE:
      case CborTypes.TYPE_FALSE:
        // nothing to advance
        break;

      case CborTypes.TYPE_FLOAT_16:
        this.offset += 2;
        break;

      case CborTypes.TYPE_FLOAT_32:
        this.offset += 4;
        break;

      case CborTypes.TYPE_FLOAT_64:
        this.offset += 8;
        break;

      case CborTypes.TYPE_SIMPLE_8:
        this.offset += 1;
        break;

      default:
        throw new Error('Unexpected simple type ' + t);
    }
  }

  readLength(t) {
    let size = CborTypes.minorType(t);
    let result;
    switch(size) {
      case CborTypes.SIZE_8:
        this._ensureAvailable(1);
        result = this.buffer[this.offset++];
        break;

      case CborTypes.SIZE_16:
        this._ensureAvailable(2);
        result = this.buffer.readUInt16BE(this.offset);
        this.offset += 2;
        break;

      case CborTypes.SIZE_32:
        this._ensureAvailable(4);
        result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        break;

      case CborTypes.SIZE_64:
        this._ensureAvailable(8);
        let f = buf.readUInt32BE(this.offset);
        let g = buf.readUInt32BE(this.offset);
        result = (f * SHIFT32) + g;
        this.offset += 8;
        break;

      case CborTypes.SIZE_STREAM:
        result = -1;
        break;

      default:
        if(size < CborTypes.SIZE_8) {
          result = size;
        } else {
          throw new Error('Unexpected size for integer: ' + size);
        }
    }

    return result;
  }

  _ensureAvailable(n) {
    if(this.offset + n > this.end) {
      throw new NeedMoreData();
    }
  }
}

const SKIPPER = new CborSkipper();
