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
const StreamBuffer = require('./ByteStreamBuffer');
const CborTypes = require('./CborTypes');
const BigNumber = require('bignumber.js');
const BigDecimal = require('./BigDecimal');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

const SHIFT32 = Math.pow(2, 32);
const STRING_STREAM_HEADER = Buffer.from([CborTypes.TYPE_UTF_STREAM]);
const BYTES_STREAM_HEADER = Buffer.from([CborTypes.TYPE_BYTES_STREAM]);
const ARRAY_STREAM_HEADER = Buffer.from([CborTypes.TYPE_ARRAY_STREAM]);
const MAP_STREAM_HEADER = Buffer.from([CborTypes.TYPE_MAP_STREAM]);
const STREAM_BREAK = Buffer.from([CborTypes.TYPE_BREAK]);

// these buf are pre allocate to avoid multiple mem allocation, and it will only used and finish using inside function call.
const buf_1 = Buffer.allocUnsafe(1);
const buf_2 = Buffer.allocUnsafe(2);
const buf_4 = Buffer.allocUnsafe(4);
const buf_8 = Buffer.allocUnsafe(8);
const buf_1024 = Buffer.alloc(1024);

class CborEncoder {
// the encode method can be modified as static function in the future
// when find a good way to handle storage issue
// Cbor package won't support direct Map, List, Object encoding but offer
// header encoding method for flexibility
  constructor() {
    this._mInOut = new StreamBuffer();
  }

  read() {
    return this._mInOut.read();
  }

  _write(data, length) {
    // length write only support for buffer
    if(typeof data === 'number') {
      this._writeUInt8(data);
    } else {
      if(length !== null && length !== undefined) {
        this._mInOut.write(data, length);
      } else {
        this._mInOut.write(data);
      }
    }
  }

  _writeString(str) {
    if(str.length <= 256) {
      // if str can fit into the pre-allocate buffer, then use it.
      let length = buf_1024.write(str, 0, 'utf8');
      this._writeType(CborTypes.TYPE_UTF, length);
      this._write(buf_1024, length);
    } else {
      let buf = Buffer.from(str, 'utf8');
      this._writeType(CborTypes.TYPE_UTF, buf.length);
      this._write(buf);
    }
  }

  encodeString(str) {
    if(typeof str !== 'string') {
      throw new DaxClientError(`unsupported type to encode for string: ${typeof str}`, DaxErrorCode.Encoder);
    }
    this._writeString(str);
    return this._mInOut.read();
  }

  _writeBinary(obj) {
    if(!(obj instanceof Buffer)) {
      obj = Buffer.from(obj);
    } // convert into a Buffer then write, it's safer
    // since conversion from str to buf may lead to length change, and after all
    // it's buffer in the wire
    this._writeType(CborTypes.TYPE_BYTES, obj.length);
    this._write(obj);
  }

  encodeBinary(str) {
    if(typeof str !== 'string' && !(str instanceof Buffer)) {
      throw new DaxClientError(`unsupported type to encode for Binary: ${typeof str}`, DaxErrorCode.Encoder);
    }
    this._writeBinary(str);
    return this._mInOut.read();
  }

  _writeBoolean(b) {
    this._write(b ? CborTypes.TYPE_TRUE : CborTypes.TYPE_FALSE);
  }

  encodeBoolean(b) {
    if(typeof b !== 'boolean') {
      throw new DaxClientError('unsupported type to encode for Boolean', DaxErrorCode.Encoder);
    }
    this._writeBoolean(b);
    return this._mInOut.read();
  }

  _writeNull() {
    this._write(CborTypes.TYPE_NULL);
  }

  encodeNull() {
    this._writeNull();
    return this._mInOut.read();
  }

  _writeInt(str) {
    if(typeof str === 'number') {
      let num = str;
      if(num >= 0) {
        this._writeType(CborTypes.TYPE_POSINT, num);
      } else {
        this._writeType(CborTypes.TYPE_NEGINT, -num - 1);
      }
    } else if((str instanceof BigNumber) || (typeof str === 'string' && str.length > 0)) {
      let num = new BigNumber(str);
      if(num.gte(0)) {
        this._writeType(CborTypes.TYPE_POSINT, num.toNumber());
      } else {
        this._writeType(CborTypes.TYPE_NEGINT, num.neg().sub(1).toNumber());
      }
    } else {
      throw new DaxClientError('not supported type for Int: ' + typeof(str) + ' ' + str, DaxErrorCode.Encoder);
    }
  }

  encodeInt(str) {
    this._writeInt(str);
    return this._mInOut.read();
  }

  _writeFloat(str) {
    let f = parseFloat(str);

    this._writeUInt8(CborTypes.TYPE_FLOAT_64);
    this._writeDoubleBE(f);
  }

  encodeFloat(str) {
    this._writeFloat(str);
    return this._mInOut.read();
  }

  _writeBigInt(str) {
    if(str === '-0') {
      str = '0';
    }
    let bi = str instanceof BigNumber ? str : new BigNumber(str);
    let tag = CborTypes.TAG_POSBIGINT;
    if(bi.isNeg()) {
      bi = bi.neg().sub(1);
      tag = CborTypes.TAG_NEGBIGINT;
    }
    let hexstr = bi.toString(16);
    if(hexstr.length % 2) {
      hexstr = '0' + hexstr;
    }

    const buf = Buffer.from(hexstr, 'hex');
    this._writeTag(tag);
    this._writeBinary(buf);
  }

  encodeBigInt(str) {
    this._writeBigInt(str);
    return this._mInOut.read();
  }

  _writeBigDecimal(str) {
    let bd = new BigDecimal(str);
    this._writeTag(CborTypes.TAG_DECIMAL);
    this._writeType(CborTypes.TYPE_ARRAY, 2);
    this._writeInt(-bd.scale + '');
    if(bd.unscaledValue.abs().comparedTo(Number.MAX_SAFE_INTEGER) <= 0) {
      this._writeInt(bd.unscaledValue.toString());
    } else {
      this._writeBigInt(bd.unscaledValue.toString());
    }
  }

  encodeBigDecimal(str) {
    this._writeBigDecimal(str);
    return this._mInOut.read();
  }

  _writeNumber(str) {
    if(typeof str !== 'string') {
      throw new DaxClientError('Numbers must be passed as strings, got ' + typeof(str), DaxErrorCode.Encoder);
    }

    if(isNaN(str)) {
      throw new DaxClientError('NaN is not a supported number', DaxErrorCode.IllegalArgument);
    } else if(!isFinite(str)) {
      throw new DaxClientError('Infinity is not a supported number', DaxErrorCode.IllegalArgument);
    } else if(this._isDecimal(str)) {
      if(this._tryWriteFloat(str)) {
        // already written for float
      } else {
        this._writeBigDecimal(str);
      }
    } else {
      let num = new BigNumber(str);
      if(num.lte(Number.MAX_SAFE_INTEGER) && num.gte(Number.MIN_SAFE_INTEGER)) {
        this._writeInt(num);
      } else {
        this._writeBigInt(num);
      }
    }
  }

  encodeNumber(str) {
    this._writeNumber(str);
    return this._mInOut.read();
  }

  encodeArrayHeader(numElems) {
    return this.encodeType(CborTypes.TYPE_ARRAY, numElems);
  }

  _writeMapHeader(numPairs) {
    return this._writeType(CborTypes.TYPE_MAP, numPairs);
  }

  encodeMapHeader(numPairs) {
    return this.encodeType(CborTypes.TYPE_MAP, numPairs);
  }

  encodeTag(tagType) {
    return this.encodeType(CborTypes.TYPE_TAG, tagType);
  }

  _writeTag(tag) {
    this._writeType(CborTypes.TYPE_TAG, tag);
  }

  encodeStringStreamHeader() {
    return STRING_STREAM_HEADER;
  }

  encodeBytesStreamHeader() {
    return BYTES_STREAM_HEADER;
  }

  encodeArrayStreamHeader() {
    return ARRAY_STREAM_HEADER;
  }

  encodeMapStreamHeader() {
    return MAP_STREAM_HEADER;
  }

  encodeStreamBreak() {
    return STREAM_BREAK;
  }

  _writeArray(items) {
    this._writeType(CborTypes.TYPE_ARRAY, items.length);
    for(let item of items) {
      if(typeof item !== 'string') {
        // the only arrays used by DAX are string arrays
        throw new DaxClientError('Arrays can only contain strings', DaxErrorCode.Encoder);
      }

      this._writeString(item);
    }
  }

  encodeArray(items) {
    this._writeArray(items);
    return this._mInOut.read();
  }

  encodeType(majorType, val) {
    this._writeType(majorType, val);
    return this._mInOut.read();
  }

  _writeType(majorType, val) {
    if(val instanceof Buffer) {
      let ai;
      switch(val.length) {
        case 1:
          ai = CborTypes.SIZE_8;
          break;
        case 2:
          ai = CborTypes.SIZE_16;
          break;
        case 4:
          ai = CborTypes.SIZE_32;
          break;
        case 8:
          ai = CborTypes.SIZE_64;
          break;
        default:
          throw new DaxClientError('wrong buffer size', DaxErrorCode.Encoder);
      }
      this._writeUInt8(majorType | ai);
      this._write(val);
    } else if(typeof val === 'number') {
      switch(false) {
        case !(val < 24):
          this._writeUInt8(majorType | val);
          break;
        case !(val <= 0xff):
          this._writeUInt8(majorType | CborTypes.SIZE_8);
          this._writeUInt8(val);
          break;
        case !(val <= 0xffff):
          this._writeUInt8(majorType | CborTypes.SIZE_16);
          this._writeUInt16BE(val);
          break;
        case !(val <= 0xffffffff):
          this._writeUInt8(majorType | CborTypes.SIZE_32);
          this._writeUInt32BE(val);
          break;
        case !(val <= Number.MAX_SAFE_INTEGER):
          this._writeUInt8(majorType | CborTypes.SIZE_64);
          this._writeUInt32BE(Math.floor(val / SHIFT32));
          this._writeUInt32BE(val % SHIFT32);
          break;
        default:
          throw new DaxClientError('Unsafe number for writeType', DaxErrorCode.Encoder);
      }
    } else {
      throw new DaxClientError('wrong type for writeType val', DaxErrorCode.Encoder);
    }
  }

  _writeUInt8(val) {
    buf_1.writeUInt8(val);
    this._mInOut.write(buf_1);
  }

  _writeUInt16BE(val) {
    buf_2.writeUInt16BE(val);
    this._mInOut.write(buf_2);
  }

  _writeUInt32BE(val) {
    buf_4.writeUInt32BE(val);
    this._mInOut.write(buf_4);
  }

  _writeDoubleBE(val) {
    buf_8.writeDoubleBE(val);
    this._mInOut.write(buf_8);
  }

  _isDecimal(str) {
    for(let i = 0; i < str.length; i++) {
      let c = str[i];
      if(c == '.' || c == 'e' || c == 'E') {
        return true;
      }
    }
    return false;
  }

  // this function not only check whether is float or not, but also if it's float,
  // then directly use converted buf write into result buf, to save unecessary conversion.
  _tryWriteFloat(str) {
    buf_8.writeDoubleBE(str);
    if((buf_8.readDoubleBE() + '') === str) {
      this._writeUInt8(CborTypes.TYPE_FLOAT_64);
      this._mInOut.write(buf_8);
      return true;
    } else {
      return false;
    }
  }
}

module.exports = CborEncoder;
