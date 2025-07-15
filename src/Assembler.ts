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
import { BigDecimal } from './BigDecimal';
import BigNumber from 'bignumber.js';
import { CborDecoder } from './CborDecoder';
import { CborSkipper, skipCbor } from './CborSkipper';
import * as CborTypes from './CborTypes';
import * as Constants from './Constants';
import { DaxCborDecoder } from './DaxCborDecoder';
import * as DaxCborTypes from './DaxCborTypes';
import { DaxClientError } from './DaxClientError';
import { DaxErrorCode } from './DaxErrorCode';
import { DaxServiceError } from './DaxServiceError';
import { ItemBuilder } from './ItemBuilder';
import { LexDecimal } from './LexDecimal';
import { ByteStreamBuffer as StreamBuffer } from './ByteStreamBuffer';
import { Buffer } from 'buffer';

const SUCCESS = CborTypes.TYPE_ARRAY + 0;

export class Assembler {
  _request: any;
  _keySchema: any;
  _buffer: any;
  dec: DaxCborDecoder;
  constructor(request, buffer) {
    this._request = request;
    this._keySchema = request ? this._request._keySchema : null;

    this._buffer = buffer || new StreamBuffer();
    this._buffer.reset();
  }

  feed(data) {
    this._buffer.write(data);

    const valueCount = skipCbor(this._buffer.buf, this._buffer._pos, this._buffer._end);
    if (valueCount === null || valueCount < 1) {
      // Need at least 1 value to determine whether response is error or success
      return;
    }

    if (this._buffer.buf[this._buffer._pos] === SUCCESS) {
      // If first value indicates success, then we'll need additional value(s) for the response
      // payload
      if (valueCount >= 1 + this._expectedResponseValues()) {
        this.dec = new DaxCborDecoder(this._buffer.readSlice());
        this.dec._consume(1); // advance past the SUCCESS we saw
        return this._assembleResult();
      }
    } else {
      // DaxServer always sends 3 items in case of exception
      // [responseCodes, errorMessage and DDB error details]
      if (valueCount >= 3) {
        this.dec = new DaxCborDecoder(this._buffer.readSlice());
        throw this._assembleError();
      }
    }
  }

  /**
   * Number of response values expected for a successful response, not counting the first value that
   * marks the response as a success. May be overridden to implement non-standard logic.
   */
  _expectedResponseValues() {
    return 1;
  }

  /**
   * This can be overridden in a CustomAssembler to implement non-standard logic.
   */
  _assembleResult() {
    return this._decodeNormalOperation();
  }

  _assembleError() {
    let codeSeq = this.dec.decodeObject();
    let errMsg = this.dec.decodeString();

    let requestId;
    let errorCode;
    let statusCode = -1;
    let cancellationReasons;
    if (!this.dec.tryDecodeNull()) {
      let length = this.dec.decodeArrayLength();
      requestId = this.dec.decodeObject();
      errorCode = this.dec.decodeObject();
      statusCode = this.dec.decodeObject();
      if (length === 4) {
        cancellationReasons = [];
        let cancellationReasonsLength = this.dec.decodeArrayLength() / 3;
        for (let i = 0; i < cancellationReasonsLength; ++i) {
          let cancellationReasonCode = this.dec.decodeObject();
          let cancellationReasonMsg = this.dec.decodeObject();
          let cancellationReasonItem = null;
          if (!this.dec.tryDecodeNull()) {
            // @ts-ignore
            cancellationReasonItem = Assembler._decodeStreamItem(this.dec.decodeCbor());
            // @ts-ignore
            if (cancellationReasonItem._attrListId) {
              // @ts-ignore
              cancellationReasonItem = Object.assign(cancellationReasonItem, this._request._keysPerRequest[i]);
            }
          }
          cancellationReasons.push({
            Item: cancellationReasonItem,
            Code: cancellationReasonCode,
            Message: cancellationReasonMsg,
          });
        }
      }
    }

    return new DaxServiceError(errMsg, errorCode, undefined, requestId, statusCode, codeSeq, cancellationReasons);
  }

  _decodeNormalOperation() {
    let result = {};
    if (this.dec.tryDecodeNull()) {
      return result;
    }

    this.dec.processMap(() => {
      let param = this.dec.decodeInt();
      this._decodeResponseItem(param, result);
    });

    /**
     * Ideally, this would go into `scan_N1875390620_1` in `generated-src/Operations.js`
     * Dax doesn't return ConsumedCapacity if the request has been a cache hit, but does return it if it was a cache miss.
     * If a user has requested for ConsumedCapacity, and our result doesn't provide one, then we default to 0.
     * It follows similar logic as: https://code.amazon.com/packages/DaxJavaClient/blobs/919d32616b8971c4bf2930aa322aa39a2b38ac13/--/src/com/amazon/dax/client/dynamodbv2/DaxClient.java#L772
     */
    // @ts-ignore
    if (this._request.ReturnConsumedCapacity != null && this._request.ReturnConsumedCapacity !== 'NONE' && result.ConsumedCapacity == null) {

      // @ts-ignore
      result.ConsumedCapacity = {
        TableName: this._request.TableName,
        CapacityUnits: 0,
      };
    }
    return result;
  }

  _decodeResponseItem(param, result) {
    switch (param) {
      case Constants.DaxResponseParam.Item:
        this._decodeItem(result);
        break;

      case Constants.DaxResponseParam.ConsumedCapacity:
        this._decodeConsumedCapacity(result);
        break;

      case Constants.DaxResponseParam.Attributes:
        this._decodeAttributes(result);
        break;

      case Constants.DaxResponseParam.ItemCollectionMetrics:
        this._decodeItemCollectionMetrics(result);
        break;

      case Constants.DaxResponseParam.Items:
        this._decodeItems(result);
        break;

      case Constants.DaxResponseParam.Count:
        this._decodeCount(result);
        break;

      case Constants.DaxResponseParam.LastEvaluatedKey:
        this._decodeLastEvaluatedKey(result);
        break;

      case Constants.DaxResponseParam.ScannedCount:
        this._decodeScannedCount(result);
        break;

      default:
        throw new DaxClientError('Unknown response field ' + param, DaxErrorCode.MalformedResult);
    }
  }

  _decodeItem(result) {
    let projOrdinals = this._request._projectionOrdinals;

    result.Item = this._decodeItemInternalHelper(projOrdinals);
  }

  _decodeConsumedCapacity(result) {
    if (this.dec.tryDecodeNull()) {
      return;
    }

    let consumedCapacity = Assembler._decodeConsumedCapacityData(this.dec.decodeCbor());
    if (this._request.ReturnConsumedCapacity && this._request.ReturnConsumedCapacity !== 'NONE') {
      result.ConsumedCapacity = consumedCapacity;
    }
  }

  static _decodeConsumedCapacityData(dec) {
    let consumedCapacity = {};
    // @ts-ignore
    consumedCapacity.TableName = dec.decodeString();
    // @ts-ignore
    consumedCapacity.CapacityUnits = dec.decodeNumber();
    if (!dec.tryDecodeNull()) {
      // @ts-ignore
      consumedCapacity.Table = {
        CapacityUnits: dec.decodeNumber(),
      };
    }

    if (!dec.tryDecodeNull()) {
      // @ts-ignore
      consumedCapacity.GlobalSecondaryIndexes = Assembler._decodeIndexConsumedCapacity(dec);
    }

    if (!dec.tryDecodeNull()) {
      // @ts-ignore
      consumedCapacity.LocalSecondaryIndexes = Assembler._decodeIndexConsumedCapacity(dec);
    }

    return consumedCapacity;
  }

  static _decodeIndexConsumedCapacity(dec) {
    let indexConsumedCapacity = dec.buildMap(() => {
      let indexName = dec.decodeString();
      let units = dec.decodeNumber();

      return [indexName, { CapacityUnits: units }];
    });

    return indexConsumedCapacity;
  }

  _decodeAttributes(result) {
    let returnValues = this._request.ReturnValues;
    let isProjection = returnValues && (returnValues === 'UPDATED_NEW' || returnValues === 'UPDATED_OLD');

    let item;
    if (isProjection) {
      item = Assembler._decodeStreamItemProjection(this.dec.decodeCbor());
    } else {
      item = Assembler._decodeStreamItem(this.dec.decodeCbor());
      this._reinsertKey(item);
    }

    result.Attributes = item;
  }

  _decodeItemCollectionMetrics(result) {
    if (this.dec.tryDecodeNull()) {
      return;
    }

    result.ItemCollectionMetrics = Assembler._decodeItemCollectionMetricsData(this.dec.decodeCbor(), this._keySchema);
  }

  static _decodeItemCollectionMetricsData(dec, keySchema) {
    let keyAV = Assembler._decodeAttributeValue(dec);
    let sizeLower = dec.decodeFloat();
    let sizeUpper = dec.decodeFloat();

    let itemCollectionMetrics = {
      ItemCollectionKey: { [keySchema[0].AttributeName]: keyAV },
      SizeEstimateRangeGB: [sizeLower, sizeUpper],
    };

    return itemCollectionMetrics;
  }

  _decodeItems(result) {
    let projOrdinals = this._request._projectionOrdinals;
    result.Items = this.dec.buildArray(() => this._decodeItemInternalHelper(projOrdinals));
  }

  _decodeCount(result) {
    result.Count = this.dec.decodeInt();
  }

  _decodeScannedCount(result) {
    result.ScannedCount = this.dec.decodeInt();
  }

  _decodeLastEvaluatedKey(result) {
    let lastEvalKey;
    if (this._request.hasOwnProperty('IndexName')) {
      lastEvalKey = Assembler._decodeCompoundKey(this.dec.decodeCbor());
    } else {
      lastEvalKey = Assembler._decodeKeyBytes(this.dec, this._keySchema);
    }

    result.LastEvaluatedKey = lastEvalKey;
  }

  _decodeItemInternalHelper(projOrdinals) {
    let item = Assembler._decodeItemInternal(this.dec, this._keySchema, projOrdinals) || {};
    return this._reinsertKey(item);
  }

  _reinsertKey(item) {
    // Handle GetItem, UpdateItem, DeleteItem
    if (this._request.Key && !this._request._projectionOrdinals) {
      Object.assign(item, this._request.Key); // The key attributes are only added if it's NOT a projection
      return item;
    }

    // Handle PutItem
    if (this._request.Item) {
      for (let keyAttr of this._keySchema) {
        if (!(keyAttr.AttributeName in this._request.Item)) {
          throw new DaxClientError(`Request Item is missing key attribute "${keyAttr.AttributeName}".`,
            DaxErrorCode.MalformedResult);
        }

        item[keyAttr.AttributeName] = this._request.Item[keyAttr.AttributeName];
      }
    }

    return item;
  }

  static _decodeItemInternal(dec, keySchema, projOrdinals) {
    if (dec.tryDecodeNull()) {
      return null;
    }

    let t = dec.peek();
    let item;
    switch (CborTypes.majorType(t)) {
      case CborTypes.TYPE_MAP:
        item = Assembler._decodeProjection(dec, projOrdinals);
        break;

      case CborTypes.TYPE_BYTES:
        item = Assembler._decodeStreamItem(dec.decodeCbor());
        break;

      case CborTypes.TYPE_ARRAY:
        item = Assembler._decodeScanResult(dec, keySchema);
        break;

      default:
        throw new DaxClientError('Unknown Item type: ' + t, DaxErrorCode.MalformedResult);
    }

    return item;
  }

  static _decodeProjection(dec, projOrdinals) {
    let builder = new ItemBuilder();
    dec.processMap(() => {
      let ordinal = dec.decodeInt();
      let path = projOrdinals[ordinal];
      let av = Assembler._decodeAttributeValue(dec);
      builder.with(path, av);
    });

    return builder.toItem();
  }

  static _decodeStreamItem(dec) {
    let attrListId = dec.decodeInt();
    let anonAttrValues = Assembler._decodeAnonymousStreamedValues(dec);

    return {
      _attrListId: attrListId,
      _anonymousAttributeValues: anonAttrValues,
    };
  }

  static _decodeStreamItemProjection(dec) {
    // only a partial item is present that will be reconstructed during
    // de-anonymization, when the attrList is available
    // so for now, store the attributes in a map indexed by the ordinal

    let attrListId = dec.decodeInt();
    let anonAttrValues = [];
    dec.processMap(() => {
      let ordinal = dec.decodeInt();
      // @ts-ignore
      anonAttrValues[ordinal] = Assembler._decodeAttributeValue(dec);
    });

    // If there are no values (which happens when UPDATED_OLD/NEW have no changes)
    // Pretend that there is no attrListId
    // This will result in an empty Attributes list, which is not what DDB proper does
    // It returns the changed attributes, even if the attributes didn't actually change
    if (anonAttrValues.length > 0) {
      return {
        _attrListId: attrListId,
        _anonymousAttributeValues: anonAttrValues,
      };
    } else {
      return {};
    }
  }

  static _decodeScanResult(dec, keySchema) {
    let size = dec.decodeArrayLength();
    if (size != 2) {
      // @ts-ignore
      throw new DaxClientError('Invalid scan item length {} (expected 2)'.format(size), DaxErrorCode.MalformedResult);
    }

    let item = {};
    // Array item 1 -> key
    let key = Assembler._decodeKeyBytes(dec, keySchema);
    item = Object.assign(item, key);

    // Array item 2 -> value
    let value = Assembler._decodeScanValue(dec);
    item = Object.assign(item, value);

    return item;
  }

  static _decodeScanValue(dec) {
    return Assembler._decodeStreamItem(dec.decodeCbor());
  }

  static _decodeAnonymousStreamedValues(dec) {
    // There is no delimiter on the item attributes; the AVs are concatenated
    // and must be read until there is no more data.
    let values = [];
    while (true) {
      let av;
      try {
        av = Assembler._decodeAttributeValue(dec);
      } catch (e) {
        if (e instanceof CborDecoder.NeedMoreData) {
          break;
        } else {
          throw e;
        }
      }

      // @ts-ignore
      values.push(av);
    }

    return values;
  }

  static _decodeAttributeValue(dec) {
    let t = dec.peek();
    let mt = CborTypes.majorType(t);
    switch (mt) {
      case CborTypes.TYPE_ARRAY:
        return { L: dec.buildArray(() => Assembler._decodeAttributeValue(dec)) };

      case CborTypes.TYPE_MAP:
        return { M: dec.buildMap(() => [dec.decodeString(), Assembler._decodeAttributeValue(dec)]) };

      default: {
        let v = dec.decodeObject();
        if (v === null) {
          return { NULL: true };
        }

        if (v === true || v === false) {
          return { BOOL: v };
        }

        let tv = typeof (v);
        switch (tv) {
          case 'number':
            return { N: v.toString() };

          case 'string':
            return { S: v };

          default:
            if (v instanceof String) {
              return { S: v };
            } else if (v instanceof Buffer) {
              return { B: v };
            } else if (v instanceof Number || v instanceof BigNumber || v instanceof BigDecimal) {
              return { N: v.toString() };
            } else if (v instanceof Array) {
              return { L: v };
            } else if (v instanceof DaxCborTypes._DdbSet) {
              return v.toAV();
            } else {
              throw new DaxClientError('Unknown type: ' + (tv === 'object' ? v.constructor.name : tv), DaxErrorCode.MalformedResult);
            }
        }
      }
    }
  }

  static _decodeCompoundKey(dec) {
    // Compund keys ignore the key schema and simply encode what is given
    // Used for indexed Scan/Query

    let key = {};
    dec.processMap(() => {
      let name = dec.decodeString();
      let value = Assembler._decodeAttributeValue(dec);
      key[name] = value;
    });

    return key;
  }

  static _decodeKeyBytes(dec, keySchema) {
    let key = {};
    let hashAttr = keySchema[0];
    let hashAttrType = hashAttr['AttributeType'];
    let hashAttrName = hashAttr['AttributeName'];

    if (keySchema.length == 1) {
      let value;
      switch (hashAttrType) {
        case 'S':
          value = dec.decodeBytes().toString('utf8');
          break;

        case 'N':
          value = dec.decodeCbor().decodeNumber().toString();
          break;

        case 'B':
          value = dec.decodeBytes();
          break;

        default:
          throw new DaxClientError('Hash key must be S, B or N, got ' + hashAttrType, DaxErrorCode.MalformedResult);
      }

      key[hashAttrName] = { [hashAttrType]: value };
    } else if (keySchema.length == 2) {
      let keyDec = dec.decodeCbor();
      let hashValue;
      switch (hashAttrType) {
        case 'S':
          hashValue = keyDec.decodeString();
          break;

        case 'N':
          hashValue = keyDec.decodeNumber().toString();
          break;

        case 'B':
          hashValue = keyDec.decodeBytes();
          break;

        default:
          throw new DaxClientError('Hash key must be S, B or N, got ' + hashAttrType, DaxErrorCode.MalformedResult);
      }

      key[hashAttrName] = { [hashAttrType]: hashValue };

      let rangeAttr = keySchema[1];
      let rangeAttrType = rangeAttr['AttributeType'];
      let rangeAttrName = rangeAttr['AttributeName'];

      let rangeValue;
      switch (rangeAttrType) {
        case 'S':
          rangeValue = keyDec.drainAsString('utf8');
          break;

        case 'N':
          let ref = [];
          let used = LexDecimal.decode(keyDec.buffer, keyDec.start, ref);
          keyDec._consume(used);
          // @ts-ignore
          rangeValue = ref[0].toString();
          break;

        case 'B':
          rangeValue = keyDec.drain();
          break;

        default:
          throw new DaxClientError('Range key must be S, B or N, got ' + rangeAttrType, DaxErrorCode.MalformedResult);
      }

      key[rangeAttrName] = { [rangeAttrType]: rangeValue };
    } else {
      throw new DaxClientError(
        `Key schema must be of length 1 or 2; got ${keySchema.length} (${keySchema})`,
        DaxErrorCode.MalformedResult);
    }

    return key;
  }

  // Reads consumed capacity, recursively converting keys from enum values
  // to names.
  static _decodeConsumedCapacityExtended(dec) {
    if (dec.tryDecodeNull()) {
      return null;
    }

    function _decodeConsumedCapacityEntry() {
      let k;
      // If the key is a string, it must be an index name. Every other key
      // is an unsigned int.
      if (CborTypes.majorType(dec.peek()) === CborTypes.TYPE_UTF) {
        k = dec.decodeString();
      } else {
        let enumVal = dec.decodeInt();
        k = Constants.ConsumedCapacityValues[enumVal];
        if (k === undefined) {
          throw new DaxClientError('Invalid consumed capacity key: ' + k, DaxErrorCode.Decoder);
        }
      }
      let v;
      if (CborTypes.majorType(dec.peek()) === CborTypes.TYPE_MAP) {
        v = dec.buildMap(_decodeConsumedCapacityEntry);
      } else {
        v = dec.decodeObject();
      }
      return [k, v];
    }

    return dec.buildMap(_decodeConsumedCapacityEntry);
  }
}
