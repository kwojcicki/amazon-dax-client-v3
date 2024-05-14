/* eslint max-len: ["off"] no-unused-vars: ["off"] padded-blocks: ["off"] */
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

const Constants = require('../src/Constants');
const Encoders = require('../src/Encoders');


exports.write_authorizeConnection_1489122155_1 = function(accessKeyId, signature, stringToSign, sessionToken, userAgent, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(1489122155));
    tube.write(tube.cbor.encodeString(accessKeyId));

    tube.write(tube.cbor.encodeString(signature));

    tube.write(tube.cbor.encodeBinary(stringToSign));

    tube.write(sessionToken === null ? tube.cbor.encodeNull() : tube.cbor.encodeString(sessionToken));

    tube.write(userAgent === null ? tube.cbor.encodeNull() : tube.cbor.encodeString(userAgent));

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_defineAttributeList_670678385_1 = function(attributeListId, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(670678385));
    tube.write(tube.cbor.encodeInt(attributeListId));

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_defineAttributeListId_N1230579644_1 = function(attributeNames, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(-1230579644));
    tube.write(tube.cbor.encodeArray(attributeNames));

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_defineKeySchema_N742646399_1 = function(tableName, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(-742646399));
    tube.write(tube.cbor.encodeBinary(tableName));

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_deleteItem_1013539361_1 = function(request, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor, request._keySchema);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(1013539361));
    tube.write(encoder.encodeTableName(request.TableName));

    tube.write(encoder.encodeKey(request.Key));

    let hasKwargs = request.ReturnValues || request.ReturnConsumedCapacity || request.ReturnItemCollectionMetrics || request.ConditionExpression || request.ExpressionAttributeNames || request.ExpressionAttributeValues;
    if(hasKwargs) {
    // This operation has expressions, so deal with those together
      tube.write(Encoders.encodeExpressionAndKwargs(request, tube.cbor, 1013539361).kwargs);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_endpoints_455855874_1 = function(tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(455855874));
    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_getItem_263244906_1 = function(request, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor, request._keySchema);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(263244906));
    tube.write(encoder.encodeTableName(request.TableName));

    tube.write(encoder.encodeKey(request.Key));

    let hasKwargs = request.ConsistentRead || request.ReturnConsumedCapacity || request.ProjectionExpression || request.ExpressionAttributeNames;
    if(hasKwargs) {
    // This operation has expressions, so deal with those together
      tube.write(Encoders.encodeExpressionAndKwargs(request, tube.cbor, 263244906).kwargs);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_putItem_N2106490455_1 = function(request, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor, request._keySchema, request._attrNames, request._attrListId);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(-2106490455));
    tube.write(encoder.encodeTableName(request.TableName));

    tube.write(encoder.encodeKey(request.Item));

    tube.write(encoder.encodeValues(request.Item));

    let hasKwargs = request.ReturnValues || request.ReturnConsumedCapacity || request.ReturnItemCollectionMetrics || request.ConditionExpression || request.ExpressionAttributeNames || request.ExpressionAttributeValues;
    if(hasKwargs) {
    // This operation has expressions, so deal with those together
      tube.write(Encoders.encodeExpressionAndKwargs(request, tube.cbor, -2106490455).kwargs);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_query_N931250863_1 = function(request, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor, request._keySchema);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(-931250863));
    tube.write(encoder.encodeTableName(request.TableName));

    let exprResult = Encoders.encodeExpressionAndKwargs(request, tube.cbor, -931250863);
    if(exprResult.keyCondBytes !== null) {
      tube.write(exprResult.keyCondBytes);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    let hasKwargs = request.IndexName || request.Select || request.Limit || request.ConsistentRead || request.ScanIndexForward || request.ExclusiveStartKey || request.ReturnConsumedCapacity || request.ProjectionExpression || request.FilterExpression || request.ExpressionAttributeNames || request.ExpressionAttributeValues;
    if(hasKwargs) {
    // This operation has expressions, so deal with those together
    // For Query, the expressions are already eval'd for KeyCondExpr
      tube.write(exprResult.kwargs);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_scan_N1875390620_1 = function(request, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor, request._keySchema);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(-1875390620));
    tube.write(encoder.encodeTableName(request.TableName));

    let hasKwargs = request.IndexName || request.Limit || request.Select || request.ExclusiveStartKey || request.ReturnConsumedCapacity || request.TotalSegments || request.Segment || request.ProjectionExpression || request.FilterExpression || request.ExpressionAttributeNames || request.ExpressionAttributeValues || request.ConsistentRead;
    if(hasKwargs) {
    // This operation has expressions, so deal with those together
      tube.write(Encoders.encodeExpressionAndKwargs(request, tube.cbor, -1875390620).kwargs);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

exports.write_updateItem_1425579023_1 = function(request, tube) {
  return Promise.resolve().then(() => {
    let encoder = new Encoders(tube.cbor, request._keySchema);

    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(1425579023));
    tube.write(encoder.encodeTableName(request.TableName));

    tube.write(encoder.encodeKey(request.Key));

    let hasKwargs = request.ReturnValues || request.ReturnConsumedCapacity || request.ReturnItemCollectionMetrics || request.UpdateExpression || request.ConditionExpression || request.ExpressionAttributeNames || request.ExpressionAttributeValues;
    if(hasKwargs) {
    // This operation has expressions, so deal with those together
      tube.write(Encoders.encodeExpressionAndKwargs(request, tube.cbor, 1425579023).kwargs);
    } else {
      tube.write(tube.cbor.encodeNull());
    }

    tube.flush();
  }).catch((err) => {
    tube.close();
    // For IO exception, make it retryable.
    if(err && err.code === 'EPIPE') {
      throw new DaxClientError(err.message, DaxErrorCode.Connection, true);
    }
    throw err;
  });
};

