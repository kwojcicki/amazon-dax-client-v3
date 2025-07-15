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
const BigInteger = require('bignumber.js');
const BigDecimal = require('./BigDecimal');
/** Byte to use for undefined, low ordering */
const NULL_BYTE_LOW = 0;

/** Byte to use for undefined, high ordering */
const NULL_BYTE_HIGH = 0xff;

class LexDecimal {
  static compareUnsigned(a, b) {
    return LexDecimal._compareUnsigned(a, 0, a.length, b, 0, b.length);
  }

  static _compareUnsigned(a, aoff, alen, b, boff, blen) {
    let minLen = Math.min(alen, blen);
    for(let i=0; i<minLen; i++) {
      let ab = a[aoff + i];
      let bb = b[boff + i];
      if(ab != bb) {
        return (ab & 0xff) - (bb & 0xff);
      }
    }
    return alen - blen;
  }

  static encode(value, xorMask) {
    if(xorMask === undefined) {
      xorMask = 0;
    }
    if(value === undefined) {
      return Buffer.from([NULL_BYTE_HIGH ^ xorMask]);
    }
    // throw new Error('NULL big decimal is not valid key value');
    let encoded;
    if(value.unscaledValue.isZero()) {
      // Value is zero.
      encoded = Buffer.from([0x80 ^ xorMask]);
      return encoded;
    }

    encoded = Buffer.alloc(LexDecimal._estimateLength(value));

    let offset = LexDecimal._encode(value, encoded, 0, xorMask);
    if(offset == encoded.length) {
      return encoded;
    }
    return encoded.slice(0, offset);
  }

  static _estimateLength(value) {
    // Exactly predicting encoding length is hard, so overestimate to be safe.

    // Calculate number of base-1000 digits, rounded up. Add two more digits to account for
    // the terminator and a rare extra digit.
    // const unscaledValue = value.mul(new BigNumber(10).pow(value.decimalPlaces()));
    // let digits = 2 + Math.ceil(Math.log(unscaledValue.abs()) / Math.log(1000));
    let digits = 2 + Math.ceil((value.unscaledValue.e + 1) / 3);

    // Calculate the number of bytes required to encode the base-1000 digits, at 10 bits
    // per digit. Add 5 for the maximum header length, and add 7 for round-up behavior when
    // dividing by 8.
    return (5 + (((digits * 10) + 7) >> 3));
  }

  static _encode(value, dst, dstOffset, xorMask) {
    // Do the header.
    if(xorMask === undefined) {
      xorMask = 0;
    }

    let unscaledValue = value.unscaledValue;
    let precision = unscaledValue.e + 1;
    let exponent = precision - value.scale;

    if(unscaledValue.isNeg()) {
      if(exponent >= -0x3e && exponent < 0x3e) {
        dst[dstOffset++] = ((0x3f - exponent) ^ xorMask);
      } else {
        if(exponent < 0) {
          dst[dstOffset] = (0x7e ^ xorMask);
        } else {
          dst[dstOffset] = (1 ^ xorMask);
        }
        dst.writeInt32BE(exponent ^ xorMask ^ 0x7fffffff, dstOffset + 1);
        dstOffset += 5;
      }
    } else {
      if(exponent >= -0x3e && exponent < 0x3e) {
        dst[dstOffset++] = ((exponent + 0xc0) ^ xorMask);
      } else {
        if(exponent < 0) {
          dst[dstOffset] = (0x81 ^ xorMask);
        } else {
          dst[dstOffset] = (0xfe ^ xorMask);
        }
        dst.writeInt32BE(exponent ^ xorMask ^ 0x80000000, dstOffset + 1);
        dstOffset += 5;
      }
    }

    // Ensure a non-fractional amount of base-1000 digits.
    let terminator;
    switch(precision % 3) {
      case 0: default:
        terminator = 2;
        break;
      case 1:
        terminator = 0;
        unscaledValue = unscaledValue.mul(100);
        break;
      case 2:
        terminator = 1;
        unscaledValue = unscaledValue.mul(10);
        break;
    }

    // 10 bits per base-1000 digit and 1 extra terminator digit. Digit values 0..999 are
    // encoded as 12..1011. Digit values 0..11 and 1012..1023 are used for terminators.

    let digitAdjust;
    if(!unscaledValue.isNeg()) {
      digitAdjust = 12;
    } else {
      digitAdjust = 999 + 12;
      terminator = 1023 - terminator;
    }

    let pos = Math.floor(Math.ceil((unscaledValue.e + 1) / Math.log(2) / 3 * Math.log(1000) + 9) / 10) + 1;
    let digits = [];
    digits[--pos] = terminator;

    while(!unscaledValue.isZero()) {
      let divrem = [unscaledValue.divToInt(1000), unscaledValue.mod(1000)];

      if(--pos < 0) {
        // Handle rare case when an extra digit is required.
        digits.unshift(0);
        pos = 0;
      }

      digits[pos] = divrem[1].toNumber() + digitAdjust;

      unscaledValue = divrem[0];
    }

    // Now encode digits in proper order, 10 bits per digit. 1024 possible
    // values per 10 bits, and so base 1000 is quite efficient.

    let accum = 0;
    let bits = 0;
    for(let i=0; i<digits.length; i++) {
      accum = (accum << 10) | digits[i];
      bits += 10;
      do {
        dst[dstOffset++] = ((accum >> (bits -= 8)) ^ xorMask);
      } while(bits >= 8);
    }

    if(bits != 0) {
      dst[dstOffset++] = ((accum << (8 - bits)) ^ xorMask);
    }

    return dstOffset;
  }

  static decode(src, srcOffset, valueRef, xorMask) {
    if(xorMask === undefined) {
      xorMask = 0;
    }
    const originalOffset = srcOffset;
    let unscaledValue;
    let scale;

    let header = (src[srcOffset] ^ xorMask) & 0xff;

    let digitAdjust;
    let exponent;

    switch(header) {
      case (NULL_BYTE_HIGH & 0xff):
      case (NULL_BYTE_LOW & 0xff):
        valueRef[0] = undefined;
        return 1;

      case 0x7f: case 0x80:
        valueRef[0] = new BigDecimal('0');
        return 1;

      case 1: case 0x7e:
        digitAdjust = 999 + 12;
        exponent = src.readInt32BE(srcOffset + 1) ^ xorMask ^ 0x7fffffff;
        srcOffset += 5;
        break;

      case 0x81: case 0xfe:
        digitAdjust = 12;
        exponent = src.readInt32BE(srcOffset + 1) ^ xorMask ^ 0x80000000;
        srcOffset += 5;
        break;

      default:
        exponent = (src[srcOffset++] ^ xorMask) & 0xff;
        if(exponent >= 0x82) {
          digitAdjust = 12;
          exponent -= 0xc0;
        } else {
          digitAdjust = 999 + 12;
          exponent = 0x3f - exponent;
        }
        break;
    }

    // Significand is base 1000 encoded, 10 bits per digit.

    unscaledValue = undefined;
    let precision = 0;

    let accum = 0;
    let bits = 0;
    let lastDigit = undefined;

    loop: while(true) {
      accum = (accum << 8) | ((src[srcOffset++] ^ xorMask) & 0xff);
      bits += 8;
      if(bits >= 10) {
        let digit = (accum >> (bits - 10)) & 0x3ff;

        switch(digit) {
          case 0:
          case 1023:
            lastDigit = lastDigit.divToInt(100);
            if(unscaledValue === undefined) {
              unscaledValue = lastDigit;
            } else {
              unscaledValue = unscaledValue.mul(10).add(lastDigit);
            }
            precision += 1;
            break loop;
          case 1:
          case 1022:
            lastDigit = lastDigit.divToInt(10);
            if(unscaledValue === undefined) {
              unscaledValue = lastDigit;
            } else {
              unscaledValue = unscaledValue.mul(100).add(lastDigit);
            }
            precision += 2;
            break loop;
          case 2:
          case 1021:
            if(unscaledValue === undefined) {
              unscaledValue = lastDigit;
            } else {
              unscaledValue = unscaledValue.mul(1000).add(lastDigit);
            }
            precision += 3;
            break loop;

          default:
            if(unscaledValue === undefined) {
              if((unscaledValue = lastDigit) !== undefined) {
                precision += 3;
              }
            } else {
              unscaledValue = unscaledValue.mul(1000).add(lastDigit);
              precision += 3;
            }
            bits -= 10;
            lastDigit = new BigInteger(digit - digitAdjust);
        }
      }
    }

    scale = precision - exponent;
    valueRef[0] = new BigDecimal(unscaledValue, scale);
    return srcOffset - originalOffset;
  }
}

module.exports = LexDecimal;
