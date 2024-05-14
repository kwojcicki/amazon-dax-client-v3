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
const CborEncoder = require('./CborEncoder');
const DaxCborTypes = require('./DaxCborTypes');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');
const LexDecimal = require('./LexDecimal');
const BigDecimal = require('./BigDecimal');

module.exports = class AttributeValueEncoder {
  static encodeKey(item, keySchema) {
    let keybuffer = new StreamBuffer();
    let encoder = new CborEncoder();
    if(!item) {
      throw new DaxClientError('Cannot have null item', DaxErrorCode.Validation, false);
    }

    let ad = keySchema[0];
    let av = item[ad.AttributeName];
    if(!av) {
      throw new DaxClientError('One of the required keys was not given a value', DaxErrorCode.Validation, false);
    }

    let obj;
    obj = av[ad.AttributeType];
    if(obj == null) {
      throw new DaxClientError('One of the required keys was not given a value', DaxErrorCode.Validation, false);
    }
    if(keySchema.length === 2) {
      switch(ad.AttributeType) {
        case 'S':
          keybuffer.write(encoder.encodeString(obj));
          break;
        case 'B':
          keybuffer.write(encoder.encodeBinary(obj));
          break;
        case 'N':
          keybuffer.write(encoder.encodeNumber(obj));
          break;
        default:
          throw new DaxClientError('Unsupported KeyType encountered in Hash Attribute: ' + JSON.stringify(ad), DaxErrorCode.Validation, false);
      }

      ad = keySchema[1];
      av = item[ad.AttributeName];
      if(!av) {
        throw new DaxClientError('One of the required keys was not given a value', DaxErrorCode.Validation, false);
      }
      obj = av[ad.AttributeType];
      if(obj == null) {
        throw new DaxClientError('One of the required keys was not given a value', DaxErrorCode.Validation, false);
      }
      switch(ad.AttributeType) {
        case 'S':
          keybuffer.write(Buffer.from(obj, 'utf8'));
          break;
        case 'B':
          keybuffer.write(Buffer.from(obj));
          break;
        case 'N':
          keybuffer.write(LexDecimal.encode(new BigDecimal(obj)));
          break;
        default:
          throw new DaxClientError('Unsupported KeyType encountered in Range Attribute: ' + ad, DaxErrorCode.Validation, false);
      }
    } else {
      switch(ad.AttributeType) {
        case 'S':
          keybuffer.write(Buffer.from(obj, 'utf8'));
          break;
        case 'B':
          keybuffer.write(Buffer.from(obj));
          break;
        case 'N':
          keybuffer.write(encoder.encodeNumber(obj));
          break;
        default:
          throw new DaxClientError('Unsupported KeyType encountered in Hash Attribute: ' + ad, DaxErrorCode.Validation, false);
      }
    }
    return keybuffer.read();
  }

  static checkValidExprParamNames(eAttrNames, eAttrVals) {
    if(eAttrVals) {
      AttributeValueEncoder.checkExprParams(Object.keys(eAttrVals), true);
    }
    if(eAttrNames) {
      AttributeValueEncoder.checkExprParams(Object.keys(eAttrNames), false);
    }
  }

  static checkExprParams(keyNames, isExprAttrVals) {
    let c;
    let i;
    let prefix = (isExprAttrVals ? ':' : '#');

    if(keyNames) {
      for(let s of keyNames) {
        i = 0;

        valid: {
          if(s.length > 1 && s[i++] === prefix) {
            for(; i < s.length; i++) {
              c = s[i];
              // FIXME: Ensure underscore valid character (bozek@ filed feedback on documentation)
              if((c < 'A' || c > 'Z') && (c < 'a' || c > 'z') && (c < '0' || c > '9') && c != '_') {
                break valid;
              }
            }
            continue;
          }
        }
        if(isExprAttrVals) {
          throw new DaxClientError('ExpressionAttributeValues contains invalid key: "' + s + '"', DaxErrorCode.Validation, false);
        } else {
          throw new DaxClientError('ExpressionAttributeNames contains invalid key: "' + s + '"', DaxErrorCode.Validation, false);
        }
      }
    }
  }

  static encodeAttributes(item, attrNames, attrListId) {
    let buffer = new StreamBuffer();
    let encoder = new CborEncoder();

    buffer.write(encoder.encodeInt(attrListId));
    for(let attr of attrNames) {
      let av = item[attr];
      AttributeValueEncoder._encodeAttributeValueInternal(av, buffer, encoder);
    }

    return buffer.read();
  }

  static getCanonicalAttributeList(item, keySchema) {
    const keyNames = keySchema.map((k) => k.AttributeName);
    let attrs = [];
    for(let attr in item) {
      if(keyNames.indexOf(attr) >= 0) {
        continue;
      } else {
        attrs.push(attr);
      }
    }

    attrs.sort();
    return attrs;
  }

  static encodeAttributeValue(av) {
    let buffer = new StreamBuffer();
    let encoder = new CborEncoder();
    AttributeValueEncoder._encodeAttributeValueInternal(av, buffer, encoder);
    return buffer.read();
  }

  static _encodeAttributeValueInternal(av, buffer, encoder) {
    let type = Object.keys(av)[0];
    let val = av[type];
    switch(type) {
      case 'S':
        buffer.write(encoder.encodeString(val));
        break;
      case 'N':
        buffer.write(encoder.encodeNumber(val));
        break;
      case 'B':
        buffer.write(encoder.encodeBinary(val));
        break;
      case 'SS':
        if(val.length === 0) {
          throw new DaxClientError('Supplied AttributeValue is empty, must contain exactly one of the supported datatypes', DaxErrorCode.Validation, false);
        }
        buffer.write(encoder.encodeTag(DaxCborTypes.TAG_DDB_STRING_SET));
        buffer.write(encoder.encodeArrayHeader(val.length));
        for(let str of val) {
          buffer.write(encoder.encodeString(str));
        }
        break;
      case 'NS':
        if(val.length === 0) {
          throw new DaxClientError('Supplied AttributeValue is empty, must contain exactly one of the supported datatypes', DaxErrorCode.Validation, false);
        }
        buffer.write(encoder.encodeTag(DaxCborTypes.TAG_DDB_NUMBER_SET));
        buffer.write(encoder.encodeArrayHeader(val.length));
        for(let str of val) {
          buffer.write(encoder.encodeNumber(str));
        }
        break;
      case 'BS':
        if(val.length === 0) {
          throw new DaxClientError('Supplied AttributeValue is empty, must contain exactly one of the supported datatypes', DaxErrorCode.Validation, false);
        }
        buffer.write(encoder.encodeTag(DaxCborTypes.TAG_DDB_BINARY_SET));
        buffer.write(encoder.encodeArrayHeader(val.length));
        for(let str of val) {
          buffer.write(encoder.encodeBinary(str));
        }
        break;
      case 'M':
        buffer.write(encoder.encodeMapHeader(Object.keys(val).length));
        Object.keys(val).forEach((key) => {
          buffer.write(encoder.encodeString(key));
          buffer.write(AttributeValueEncoder.encodeAttributeValue(val[key]));
        });
        break;
      case 'L':
        buffer.write(encoder.encodeArrayHeader(val.length));
        val.forEach((obj) => {
          buffer.write(AttributeValueEncoder.encodeAttributeValue(obj));
        });
        break;
      case 'NULL':
        buffer.write(encoder.encodeNull());
        break;
      case 'BOOL':
        buffer.write(encoder.encodeBoolean(val));
        break;
      default:
        throw new DaxClientError('Supplied AttributeValue is empty, must contain exactly one of the supported datatypes:', type, DaxErrorCode.Validation, false);
    }
  }
};

