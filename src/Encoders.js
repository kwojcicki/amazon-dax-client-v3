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
const AttributeValueEncoder = require('./AttributeValueEncoder');
const CborSExprGenerator = require('./CborSExprGenerator').CborSExprGenerator;
const Constants = require('./Constants');
const DocumentPath = require('./DocumentPath');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

module.exports = class Encoders {
  constructor(encoder, keySchema, attrNames, attrListId) {
    this._encoder = encoder;
    this._keySchema = keySchema;
    this._attrNames = attrNames;
    this._attrListId = attrListId;
  }

  encodeTableName(tableName) {
    return this._encoder.encodeBinary(Buffer.from(tableName, 'utf8'));
  }

  encodeKey(keyItem) {
    return Encoders.encodeKey(keyItem, this._keySchema, this._encoder);
  }

  encodeCompoundKey(key) {
    return Encoders.encodeCompoundKey(key, this._encoder);
  }

  static encodeCompoundKey(key, cbor) {
    // Compund keys ignore the key schema and simply encode what is given
    // Used for indexed Scan/Query

    let buffer = new StreamBuffer();

    buffer.write(cbor.encodeMapStreamHeader());

    for(let attrName in key) {
      if(Object.prototype.hasOwnProperty.call(key, attrName)) {
        buffer.write(cbor.encodeString(attrName));
        buffer.write(AttributeValueEncoder.encodeAttributeValue(key[attrName]));
      }
    }

    buffer.write(cbor.encodeStreamBreak());

    return cbor.encodeBinary(buffer.read());
  }

  encodeValues(item) {
    if(this._attrNames && this._attrNames.length > 0) {
      return Encoders.encodeValuesWithNames(item, this._attrNames, this._attrListId, this._encoder);
    } else {
      return Encoders.encodeValuesWithKeys(item, this._keySchema, this._attrListId, this._encoder);
    }
  }

  static encodeExpressions(request) {
    let eAttrNames = request.ExpressionAttributeNames;
    let eAttrVals = request.ExpressionAttributeValues;

    AttributeValueEncoder.checkValidExprParamNames(eAttrNames ? eAttrNames : {}, eAttrVals ? eAttrVals : {});

    return CborSExprGenerator.encodeExpressions(
      request.ConditionExpression,
      request.KeyConditionExpression,
      request.FilterExpression,
      request.UpdateExpression,
      request.ProjectionExpression,
      eAttrNames, eAttrVals);
  }

  static encodeExpressionAndKwargs(request, cbor, methodId, buffer) {
    if(!buffer) {
      buffer = new StreamBuffer();
    }
    buffer.write(cbor.encodeMapStreamHeader());
    if(request.ReturnConsumedCapacity && request.ReturnConsumedCapacity !== 'NONE') {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ReturnConsumedCapacity));
      buffer.write(cbor.encodeInt(Constants.ReturnConsumedCapacityValues[request.ReturnConsumedCapacity.toUpperCase()]));
    }

    if(request.ReturnItemCollectionMetrics && request.ReturnItemCollectionMetrics !== 'NONE') {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ReturnItemCollectionMetrics));
      buffer.write(cbor.encodeInt(Constants.ReturnItemCollectionMetricsValue[request.ReturnItemCollectionMetrics.toUpperCase()]));
    }

    if(request.ReturnValues && request.ReturnValues !== 'NONE') {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ReturnValues));
      buffer.write(cbor.encodeInt(Constants.ReturnValues[request.ReturnValues.toUpperCase()]));
    }

    if(request.ConsistentRead !== undefined && request.ConsistentRead !== null) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ConsistentRead));
      // Server side query/scan accept CR as int while get accept bool.
      // It's a hack now till we fix server side to allow both int and bool.
      if(methodId === Constants.DaxMethodIds.query || methodId === Constants.DaxMethodIds.scan) {
        buffer.write(cbor.encodeInt(request.ConsistentRead ? 1 : 0));
      } else {
        buffer.write(cbor.encodeBoolean(request.ConsistentRead));
      }
    }

    // txn
    if(request.ClientRequestToken) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ClientRequestToken));
      buffer.write(cbor.encodeString(request.ClientRequestToken));
    }

    // query
    if(request.ScanIndexForward !== undefined && request.ScanIndexForward !== null) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ScanIndexForward));
      buffer.write(cbor.encodeInt(request.ScanIndexForward ? 1 : 0));
    }

    // scan
    if(request.TotalSegments !== undefined && request.TotalSegments !== null) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.TotalSegments));
      buffer.write(cbor.encodeInt(request.TotalSegments));
    }

    if(request.Segment !== undefined && request.Segment !== null) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.Segment));
      buffer.write(cbor.encodeInt(request.Segment));
    }

    // query & scan
    if(request.IndexName) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.IndexName));
      buffer.write(cbor.encodeBinary(request.IndexName));
    }

    if(request.Select) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.Select));
      buffer.write(cbor.encodeInt(Constants.SelectValues[request.Select.toUpperCase()]));
    }

    if(request.Limit !== undefined && request.Limit !== null) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.Limit));
      buffer.write(cbor.encodeInt(request.Limit));
    }

    if(request.ExclusiveStartKey) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ExclusiveStartKey));
      // No cbor for map so use custom cbor
      buffer.write(Encoders.encode_ExclusiveStartKey(cbor, request.ExclusiveStartKey, request._keySchema, request.IndexName));
    }

    // expressions
    let expressions = Encoders.encodeExpressions(request);

    if(request.ConditionExpression) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ConditionExpression));
      buffer.write(cbor.encodeBinary(expressions.Condition));
    }

    if(request.FilterExpression) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.FilterExpression));
      buffer.write(cbor.encodeBinary(expressions.Filter));
    }

    if(request.UpdateExpression) {
      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.UpdateExpression));
      buffer.write(cbor.encodeBinary(expressions.Update));
    }

    if(request.ProjectionExpression) {
      let projectionOrdinals = [];
      Encoders._prepareProjection(request.ProjectionExpression, request.ExpressionAttributeNames, projectionOrdinals);
      request._projectionOrdinals = projectionOrdinals;

      buffer.write(cbor.encodeInt(Constants.DaxDataRequestParam.ProjectionExpression));
      buffer.write(cbor.encodeBinary(expressions.Projection));
    }

    let keyCondBytes = request.KeyConditionExpression ?
      cbor.encodeBinary(expressions.KeyCondition) :
      null;

    buffer.write(cbor.encodeStreamBreak());

    return {
      kwargs: buffer.read(),
      keyCondBytes: keyCondBytes,
    };
  }

  static encodeKey(keyItem, keySchema, encoder) {
    if(!keyItem) {
      throw new DaxClientError('Value null at \'keyItem\' failed to satisfy constraint: Member must not be null', DaxErrorCode.Validation, false);
    }

    // Extract only the key portion from the given object
    let key = {};
    for(let keyFragment of keySchema) {
      if(keyFragment.AttributeName in keyItem) {
        key[keyFragment.AttributeName] = keyItem[keyFragment.AttributeName];
      }
    }

    let itemSize = Object.keys(key).length;
    if(itemSize != keySchema.length) {
      throw new DaxClientError(
        'The number of conditions on the keys is invalid (got ' + itemSize + ', expected ' + keySchema.length + ')',
        DaxErrorCode.Validation, false);
    }

    return encoder.encodeBinary(AttributeValueEncoder.encodeKey(key, keySchema));
  }

  static encodeValuesWithNames(item, attrNames, attrListId, encoder) {
    return encoder.encodeBinary(AttributeValueEncoder.encodeAttributes(item, attrNames, attrListId));
  }

  static encodeValuesWithKeys(item, keySchema, attrListId, encoder) {
    let attrNames = AttributeValueEncoder.getCanonicalAttributeList(item, keySchema);
    return encoder.encodeBinary(AttributeValueEncoder.encodeAttributes(item, attrNames, attrListId));
  }

  static _encodeProjection(projExp, eAttrStrs) {
    if(!projExp) { // null, undefined, length 0
      return null;
    }
    // If names are null pass in empty map
    eAttrStrs = (eAttrStrs ? eAttrStrs : {});
    AttributeValueEncoder.checkValidExprParamNames(eAttrStrs, null);

    // If values are null pass in empty map
    return CborSExprGenerator.encodeProjectionExpression(projExp, eAttrStrs);
  }

  static _prepareProjection(expression, attributeNames, ords) {
    if(!expression) {
      return;
    }
    let projectionTerms = expression.split(',');
    for(let i = 0; i < projectionTerms.length; ++i) {
      ords[i] = DocumentPath.from(projectionTerms[i].trim(), attributeNames);
    }
  }

  static encode_ExclusiveStartKey(cbor, exclusiveStartKey, keySchema, isIndex) {
    if(isIndex) {
      return Encoders.encodeCompoundKey(exclusiveStartKey, cbor);
    } else {
      return Encoders.encodeKey(exclusiveStartKey, keySchema, cbor);
    }
  }

  encode_ExclusiveStartKey(request) {
    return Encoders.encode_ExclusiveStartKey(this._encoder, request.ExclusiveStartKey, this._keySchema, request.indexName);
  }
};
