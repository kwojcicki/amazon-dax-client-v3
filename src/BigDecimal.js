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
const BigNumber = require('bignumber.js');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');
const TEN = new BigNumber(10);
const ONE_TENTH = new BigNumber(0.1);
const EXPREP_DEFAULT = 6;

class BigDecimal {
  constructor(obj, scale) {
    this._EXPREP = EXPREP_DEFAULT;
    if(obj instanceof BigNumber) {
      this.unscaledValue = obj;
      this.scale = parseInt(scale);
      return;
    } else if(typeof obj !== 'string') {
      throw new DaxClientError('should be initialized by either string or unscaledValue and scale', DaxErrorCode.IllegalArgument);
    }
    let str = obj;
    let exppoint = str.length;
    let decimalpoint = undefined;
    for(let i = 0; i < str.length; ++i) {
      if(str[i] === '.') {
        decimalpoint = i;
      } else if(str[i] === 'e' || str[i] === 'E') {
        exppoint = i;
      }
    }
    let escale = 0;
    if(decimalpoint === undefined) { // no decimal point
      decimalpoint = exppoint;
      this.scale = 0;
    } else {
      this.scale = exppoint - decimalpoint - 1;
    }
    if(exppoint !== str.length) {
      escale = parseInt(str.slice(exppoint + 1, str.length));
    }
    // at this step scale will always be non-negative
    // this.unscaledValue = new BigInteger(str.slice(0, exppoint)).pow(this.scale);
    this.unscaledValue = new BigNumber(str.slice(0, decimalpoint) + str.slice(decimalpoint + 1, exppoint));
    this.scale -= escale;
  }

  config(obj) {
    if(!obj['EXPREP']) {
      this._EXPREP = obj['EXPREP'];
    }
  }

  toString() {
    if(this.unscaledValue.equals(0)) {
      return '0';
    }

    // get plain string of unscaledValue
    let str = this.unscaledValue.toPrecision(this.unscaledValue.e + 1);
    if(this.scale === 0) {
      return str;
    }
    let sign = ''; // sign
    if(str[0] === '-') {
      sign = '-';
      str = str.slice(1);
    }
    if(this.scale < 0) { // add positive "E" afterwards
      let afterDecimal = '.' + str.slice(1);
      if(afterDecimal === '.') {
        afterDecimal = '';
      }
      return sign + str[0] + afterDecimal + `E${str.length - this.scale - 1}`;
    } else if(this.scale < str.length) {
      // put decimal point somewhere in between
      let afterDecimal = '.' + str.slice(str.length - this.scale);
      if(afterDecimal === '.') {
        afterDecimal = '';
      }
      return sign + str.slice(0, str.length - this.scale) + afterDecimal;
    } else {
      // put decimal point in front of, which means add 'E' back
      let escale = str.length - this.scale - 1;
      if(-escale <= this._EXPREP) {
        // use decimal instead of scientific representation
        return sign + this._precedingZeros(-escale) + str;
      } else {
        let afterDecimal = '.' + str.slice(1);
        if(afterDecimal === '.') {
          afterDecimal = '';
        }
        afterDecimal += `E${escale}`;
        return sign + str[0] + afterDecimal;
      }
    }
  }

  toJSON() {
    return this.toString();
  }

  equals(obj) { // equal means not only value but also precision is the same
    if(!(obj instanceof BigDecimal)) {
      return false;
    }
    if(this.unscaledValue.isZero()) {
      return obj.unscaledValue.isZero();
    }
    return this.unscaledValue.equals(obj.unscaledValue) && this.scale === obj.scale;
  }

  // in the future, we need to use our own BigInteger, then this function need
  // to be uncomment again, to compare BigDecimal
  // _getIntAndDec() {
  //   let int, dec
  //   if (this.scale <= 0) {
  //     int = this.unscaledValue.pow(-this.scale).toStringAbs()
  //     dec = '0'
  //   } else {
  //     let as = this.unscaledValue.toStringAbs()
  //     if (as.length > this.scale) {
  //       int = as.slice(0, as.length - this.scale)
  //       dec = as.slice(as.length - this.scale)
  //     } else {
  //       int = '0'
  //       dec = '0'.repeat(this.scale - as.length) + as
  //     }
  //   }
  //   return [int, dec]
  // }

  // comparedTo(obj) {
  //   if (this.unscaledValue.isNeg() !== obj.unscaledValue.isNeg()) {
  //     if (this.unscaledValue.isNeg()) return -1
  //     else return 1
  //   }
  //   let [ai, ad] = this._getIntAndDec()
  //   let [bi, bd] = obj._getIntAndDec()
  //   let intbigger = ((ai.length === bi.length) ? ai.localeCompare(bi) : (ai.length - bi.length))
  //   if (intbigger === 0) {
  //     let decbigger = ad.localeCompare(bd)
  //     return (this.unscaledValue.isNeg() ? -decbigger : decbigger)
  //   } else
  //     return (this.unscaledValue.isNeg() ? -intbigger : intbigger)
  // }

  comparedTo(obj) {
    let a = this.scale < 0 ?
      this.unscaledValue.mul(TEN.pow(-this.scale)) :
      this.unscaledValue.mul(ONE_TENTH.pow(this.scale));

    let b = obj.scale < 0 ?
      obj.unscaledValue.mul(TEN.pow(-obj.scale)) :
      obj.unscaledValue.mul(ONE_TENTH.pow(obj.scale));

    return a.comparedTo(b);
  }

  _precedingZeros(n) {
    let str = '0.';
    for(let i = 1; i < n; ++i) {
      str += '0';
    }
    return str;
  }
}

module.exports = BigDecimal;
