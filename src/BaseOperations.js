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
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');
const StreamBuffer = require('./ByteStreamBuffer');
const CborEncoder = require('./CborEncoder');
const Encoder = require('./Encoders');
const AttributeValueEncoder = require('./AttributeValueEncoder');
const Constants = require('./Constants');
const Util = require('./Util');
const DaxServiceError = require('./DaxServiceError');
const Tube = require('./Tube');
const DaxMethodIds = require('./Constants').DaxMethodIds;
const Operation = require('./Constants').Operation;
const ReturnValueOnConditionCheckFailure = require('./Constants').ReturnValueOnConditionCheckFailure;
const RequestValidator = require('./RequestValidator');
const UUID = require('uuid');

const MAX_WRITE_BATCH_SIZE = 25;
const MAX_READ_BATCH_SIZE = 100;
const BATCH_WRITE_MAX_ITEM_SIZE = 409600;

module.exports = class BaseOperations {
  constructor(keyCache, attrListCache, attrListIdCache, tubePool, requestTimeout) {
    this.tubePool = tubePool;

    this.keyCache = keyCache;
    this.attrListCache = attrListCache;
    this.attrListIdCache = attrListIdCache;
    this.caches = {
      attrListCache: this.attrListCache,
      attrListIdCache: this.attrListIdCache,
      keyCache: this.keyCache,
    };

    this._requestTimeout = requestTimeout || 0;
  }

  _getReturnHandler(tube, assembler, name) {
    let endListener;
    return new Promise((resolve, reject) => {
      // Listen on end event to avoid the situation that server close
      // the connection but client is still waiting for an response
      // till timeout.
      endListener = () => {
        return reject(new DaxClientError('Connection is closed by server', DaxErrorCode.Connection, true));
      };
      tube.socket.on('end', endListener);

      tube.socket.on('data', (data) => {
        let result;
        try {
          // Pass data to the assembler
          result = assembler.feed(data);
        } catch(err) {
          // Catch & reject any errors, including those returned from the server
          if(err._tubeInvalid) {
            tube.invalidateAuth();
          }

          if(!(err instanceof DaxServiceError)) {
            // On non-DAX errors, reset the pool
            this.tubePool.reset(tube);
          } else {
            // On DAX errors, the tube is still usable
            this.tubePool.recycle(tube);

            if(err.cancellationReasons) { // For TransactionCanceledException, we also need to deanonymize items.
              let deanonymizePromiseList = [];
              for(let cancellationReason of err.cancellationReasons) {
                if(cancellationReason.Item) {
                  deanonymizePromiseList.push(
                    BaseOperations._resolveItemAttributeValues(this.attrListCache, cancellationReason.Item)
                  );
                }
              }
              return Promise.all(deanonymizePromiseList).then(() => {
                return reject(err);
              });
            }
          }
          return reject(err);
        }

        if(result) {
          // If the response is complete, resolve immediately
          return resolve(result);
        }

        // Otherwise, the assembler needs more data, so wait for it
      });

      tube.socket.on('error', (err) => {
        // On socket errors, reset the pool
        this.tubePool.reset(tube);

        return reject(new DaxClientError(err.message, DaxErrorCode.Connection, true));
      });

      let timeout = this._requestTimeout; // capture the timeout in case it changes
      tube.setTimeout(timeout, () => {
        // Either the network is down or the node is stuck. Either way, the pool can be reset.
        this.tubePool.reset(tube);
        return reject(new Tube.TimeoutError(timeout));
      });
    }).then((result) => {
      // Remove end listener
      if(endListener) {
        tube.socket.removeListener('end', endListener);
      }
      this.tubePool.recycle(tube);
      return this._resolveAttributeValues(result);
    }).catch((err) => {
      // Remove end listener
      if(endListener) {
        tube.socket.removeListener('end', endListener);
      }
      throw err;
    });
  }

  reauth(tube) {
    return tube.reauth().catch((err) => {
      // need to reset connection to prevent leak.
      // https://issues.amazon.com/issues/DAX-3535
      this.tubePool.reset(tube);
      throw err;
    });
  }

  _resolveAttributeValues(response) {
    let deanonymizePromiseList = [];

    // getItem
    if(response.Item) {
      deanonymizePromiseList.push(
        BaseOperations._resolveItemAttributeValues(this.attrListCache, response.Item)
      );
    }

    // deleteItem, putItem
    if(response.Attributes) {
      deanonymizePromiseList.push(
        BaseOperations._resolveItemAttributeValues(this.attrListCache, response.Attributes)
      );
    }

    // query, scan
    if(response.Items) {
      for(let item of response.Items) {
        deanonymizePromiseList.push(
          BaseOperations._resolveItemAttributeValues(this.attrListCache, item)
        );
      }
    }

    // batchGetItem and transactGetItems
    if(response.Responses) {
      if(Array.isArray(response.Responses)) {
        // transactGetItems (list of items)
        for(let item of response.Responses) {
          deanonymizePromiseList.push(
            BaseOperations._resolveItemAttributeValues(this.attrListCache, item.Item));
        }
      } else {
        // batchGetItem (map of table names to items)
        for(let tableName in response.Responses) {
          if(response.Responses.hasOwnProperty(tableName)) {
            let tableResults = response.Responses[tableName];
            for(let item of tableResults) {
              deanonymizePromiseList.push(
                BaseOperations._resolveItemAttributeValues(this.attrListCache, item)
              );
            }
          }
        }
      }
    }

    // batchWriteItem
    if(response.UnprocessedItems) {
      for(let tableName in response.UnprocessedItems) {
        if(response.UnprocessedItems.hasOwnProperty(tableName)) {
          let unprocessedRequests = response.UnprocessedItems[tableName];
          for(let unprocessedRequest of unprocessedRequests) {
            for(let i = 0; i < unprocessedRequest.length; i++) {
              let writeType = unprocessedRequest[i][0];
              let writeRequest = unprocessedRequest[i][0];
              if(writeType === 'PutRequest' && writeRequest.Item) {
                deanonymizePromiseList.push(
                  BaseOperations._resolveItemAttributeValues(this.attrListCache, writeRequest.Item)
                );
              }
            }
          }
        }
      }
    }

    return Promise.all(deanonymizePromiseList).then(() => response);
  }

  static _resolveItemAttributeValues(attrListCache, item) {
    if(item && item._attrListId !== undefined) {
      return attrListCache.get(item._attrListId).then((attrNames) => {
        Util.deanonymizeAttributeValues(item, attrNames);
      });
    } else {
      return Promise.resolve(item);
    }
  }

  _validateBatchGetItem(request) {
    if(!request.RequestItems) {
      throw new DaxClientError('1 validation error detected: Value ' +
        JSON.stringify(request.RequestItems) +
        ' at "requestItems" failed to satisfy constraint: Member must have length greater than or equal to 1',
      DaxErrorCode.Validation, false);
    }
    let requestByTable = request.RequestItems;
    let batchSize = 0;
    let isEmpty = true;

    Object.keys(requestByTable).forEach((tableName) => {
      let kaas = requestByTable[tableName];
      if(!kaas) {
        throw new DaxClientError('Request can not be null for table ' + tableName, DaxErrorCode.Validation, false);
      }
      if(!Object.keys(kaas).length) {
        throw new DaxClientError('Keys can not be null for table ' + tableName, DaxErrorCode.Validation, false);
      }
      batchSize += Object.keys(kaas).length;
      if(batchSize > MAX_READ_BATCH_SIZE) {
        throw new DaxClientError('Batch size should be less than ' + MAX_READ_BATCH_SIZE, DaxErrorCode.Validation, false);
      }
      isEmpty = false;
    });

    if(isEmpty) {
      throw new DaxClientError(
        '1 validation error detected: Value null at "requestItems" failed to satisfy constraint: Member must not be null',
        DaxErrorCode.Validation, false);
    }
  }

  prepare_batchGetItem_N697851100_1(request) {
    this._validateBatchGetItem(request);
    let stubData = {};
    let requestByTable = request.RequestItems;
    let keysPerTable = {};
    let tableProjOrdinals = {};
    let buffer = new StreamBuffer();
    let encoder = new CborEncoder();

    buffer.write(encoder.encodeMapHeader(Object.keys(requestByTable).length));

    let fetchKeySchema = [];
    Object.keys(requestByTable).forEach((tableName) => {
      fetchKeySchema.push(this.keyCache.get(tableName).then((keySchema) => {
        keysPerTable[tableName] = keySchema;
      }));
    });

    return Promise.all(fetchKeySchema).then(() => {
      let keySet = new Set();
      Object.keys(requestByTable).forEach((tableName) => {
        keySet.clear();
        let kaas = requestByTable[tableName];

        buffer.write(encoder.encodeString(tableName));
        buffer.write(encoder.encodeArrayHeader(3));

        if(!kaas.ConsistentRead) {
          buffer.write(encoder.encodeBoolean(false));
        } else {
          buffer.write(encoder.encodeBoolean(true));
        }

        tableProjOrdinals[tableName] = [];
        if(kaas.ProjectionExpression) {
          buffer.write(encoder.encodeBinary(Encoder._encodeProjection(kaas.ProjectionExpression, kaas.ExpressionAttributeNames)));
          Encoder._prepareProjection(kaas.ProjectionExpression, kaas.ExpressionAttributeNames, tableProjOrdinals[tableName]);
        } else {
          buffer.write(encoder.encodeNull());
        }


        let keys = (kaas.Keys ? kaas.Keys : []);

        buffer.write(encoder.encodeArrayHeader(keys.length));
        for(let key of keys) {
          let keyBytes = Encoder.encodeKey(key, keysPerTable[tableName], encoder);
          if(keySet.has(keyBytes)) {
            throw new DaxClientError('Provided list of item keys contains duplicates', DaxErrorCode.Validation, false);
          }
          keySet.add(keyBytes);
          buffer.write(keyBytes);
        }
      });

      stubData.getItemKeys = buffer.read();
      let hasKwargs = request.ReturnConsumedCapacity;
      if(hasKwargs) {
        buffer.write(encoder.encodeMapStreamHeader());
        if(request.ReturnConsumedCapacity) {
          buffer.write(encoder.encodeInt(Constants.DaxDataRequestParam.ReturnConsumedCapacity));
          buffer.write(encoder.encodeInt(Constants.ReturnConsumedCapacityValues[request.ReturnConsumedCapacity]));
        }

        buffer.write(encoder.encodeStreamBreak());
      } else {
        buffer.write(encoder.encodeNull());
      }

      stubData.kwargs = buffer.read();
      // attach data neccessary for decoding to request
      request._keysPerTable = keysPerTable;
      request._tableProjOrdinals = tableProjOrdinals;
      request._attrListCache = this.attrListCache; // need cache for assemble, it's more efficient during that phase

      request._stubData = stubData;
      return stubData;
    });
  }

  write_batchGetItem_N697851100_1(data, tube) {
    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(Constants.DaxMethodIds.batchGetItem));
    tube.write(data.getItemKeys ? data.getItemKeys : tube.cbor.encodeNull());
    tube.write(data.kwargs ? data.kwargs : tube.cbor.encodeNull());
    tube.flush();
  }

  prepare_batchWriteItem_116217951_1(request) {
    let stubData = {};
    let keysPerTable = {};
    let attrListIdPerTable = {};
    let requestByTable = request.RequestItems;
    let buffer = new StreamBuffer();
    let encoder = new CborEncoder();
    let totalRequests = 0;
    if(!requestByTable) {
      throw new DaxClientError('1 validation error detected: Value ' +
        JSON.stringify(request.RequestItems) +
        ' at "requestItems" failed to satisfy constraint: Member must have length greater than or equal to 1',
      DaxErrorCode.Validation, false);
    }

    let fetchKeySchema = [];
    Object.keys(requestByTable).forEach((tableName) => {
      fetchKeySchema.push(this.keyCache.get(tableName).then((keySchema) => {
        keysPerTable[tableName] = keySchema;
      }));
    });

    let fetchAttributeSchema = [];

    buffer.write(encoder.encodeMapHeader(Object.keys(requestByTable).length));

    return Promise.all(fetchKeySchema).then(() => {
      Object.keys(requestByTable).forEach((tableName) => {
        attrListIdPerTable[tableName] = [];
        for(let i = 0; i < requestByTable[tableName].length; ++i) {
          if(requestByTable[tableName][i].PutRequest) {
            let attrNames = AttributeValueEncoder.getCanonicalAttributeList(requestByTable[tableName][i].PutRequest.Item, keysPerTable[tableName]);
            fetchAttributeSchema.push(this.attrListIdCache.get(attrNames).then((attrListId) => {
              attrListIdPerTable[tableName][i] = attrListId;
            }));
          }
        }
      });

      return Promise.all(fetchAttributeSchema);
    }).then(() => {
      let keySet = new Set();
      Object.keys(requestByTable).forEach((tableName) => {
        keySet.clear();
        if(!tableName) {
          throw new DaxClientError('Value null at "tableName" failed to satisfy constraint: Member must not be null', DaxErrorCode.Validation, false);
        }

        let writeRequests = requestByTable[tableName];
        if((totalRequests += writeRequests.length) > MAX_WRITE_BATCH_SIZE) {
          throw new DaxClientError(`Batch size should be less than ${MAX_WRITE_BATCH_SIZE}`, DaxErrorCode.Validation, false);
        }

        buffer.write(encoder.encodeString(tableName));

        let requestItemCount = 0;
        let isEmpty = true;
        for(let writeRequest of writeRequests) {
          if(writeRequest.PutRequest || writeRequest.DeleteRequest) {
            requestItemCount++;
          }
        }
        buffer.write(encoder.encodeArrayHeader(requestItemCount * 2));

        for(let i = 0; i < writeRequests.length; ++i) {
          let writeRequest = writeRequests[i];
          if(!writeRequest) {
            continue;
          }

          isEmpty = false;
          this._validateWriteRequest(writeRequest);
          if(writeRequest.PutRequest) {
            let attributes = writeRequest.PutRequest.Item;
            this._validateBatchWriteItem(attributes);
            let keyBytes = Encoder.encodeKey(attributes, keysPerTable[tableName], encoder);
            if(keySet.has(keyBytes)) {
              throw new DaxClientError('Provided list of item keys contains duplicates', DaxErrorCode.Validation, false);
            }
            keySet.add(keyBytes);
            buffer.write(keyBytes);
            buffer.write(Encoder.encodeValuesWithKeys(attributes, keysPerTable[tableName], attrListIdPerTable[tableName][i], encoder));
          } else if(writeRequest.DeleteRequest) {
            let key = writeRequest.DeleteRequest.Key;
            let keyBytes = Encoder.encodeKey(key, keysPerTable[tableName], encoder);
            if(keySet.has(keyBytes)) {
              throw new DaxClientError('Provided list of item keys contains duplicates', DaxErrorCode.Validation, false);
            }
            keySet.add(keyBytes);
            buffer.write(keyBytes);
            buffer.write(encoder.encodeNull());
          }
        }
        if(isEmpty) {
          throw new DaxClientError(`1 validation error detected: Value '{ ${tableName} =`,
            JSON.stringify(writeRequests),
            `}' at 'requestItems' failed to satisfy constraint: Map value must satisfy constraint:`,
            `[Member must have length less than or equal to 25, Member must have length greater than or equal to 1`,
            DaxErrorCode.Validation, false);
        }
      });

      if(totalRequests === 0) {
        throw new DaxClientError(`1 validation error detected: Value`,
          JSON.stringify(requestByTable),
          `at "requestItems" failed to satisfy constaint: Member must have length greater than or equal to 1`,
          DaxErrorCode.Validation, false);
      }

      stubData.keyValuesByTable = buffer.read();
      buffer.write(encoder.encodeMapStreamHeader());
      if(request.ReturnConsumedCapacity && request.ReturnConsumedCapacity !== 'NONE') {
        buffer.write(encoder.encodeInt(Constants.DaxDataRequestParam.ReturnConsumedCapacity));
        buffer.write(encoder.encodeInt(Constants.ReturnConsumedCapacityValues[request.ReturnConsumedCapacity]));
      }

      if(request.ReturnItemCollectionMetrics && request.ReturnItemCollectionMetrics !== 'NONE') {
        buffer.write(encoder.encodeInt(Constants.DaxDataRequestParam.ReturnItemCollectionMetrics));
        buffer.write(encoder.encodeInt(Constants.ReturnItemCollectionMetricsValue[request.ReturnItemCollectionMetrics]));
      }

      buffer.write(encoder.encodeStreamBreak());

      stubData.kwargs = buffer.read();
      request._keysPerTable = keysPerTable;
      request._attrListCache = this.attrListCache; // need cache for assemble, it's more efficient during that phase

      request._stubData = stubData;
      return stubData;
    });
  }

  write_batchWriteItem_116217951_1(data, tube) {
    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(Constants.DaxMethodIds.batchWriteItem));
    tube.write(data.keyValuesByTable ? data.keyValuesByTable : tube.cbor.encodeNull());
    tube.write(data.kwargs ? data.kwargs : tube.cbor.encodeNull());
    tube.flush();
  }

  prepare_transactWriteItems_N1160037738_1(request) {
    if(request.TransactItems == null) {
      throw RequestValidator.newValidationException(`1 validation error detected: Value ${JSON.stringify(request.TransactItems)} at 'transactItems' failed to satisfy constraint: Member must not be null`);
    } else if(request.TransactItems.length < 1) {
      throw RequestValidator.newValidationException(`1 validation error detected: Value '${request.TransactItems}' at 'transactItems' failed to satisfy constraint: Member must have length greater than or equal to 1`);
    }

    let keySetPerTable = {};
    let keysPerTable = {};
    let keysPerRequest = [];
    let tableNamesBuffer = new StreamBuffer();
    let keysBuffer = new StreamBuffer();
    let valuesBuffer = new StreamBuffer();
    let conditionExprsBuffer = new StreamBuffer();
    let updateExprsBuffer = new StreamBuffer();
    // Use small buffer for following parameters. Each only occupy tens of bytes.
    let operationsBuffer = new StreamBuffer(64);
    let rvOnConditionCheckFailuresBuffer = new StreamBuffer(64);

    let encoder = new CborEncoder();

    operationsBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));
    tableNamesBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));
    keysBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));
    valuesBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));
    conditionExprsBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));
    updateExprsBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));
    rvOnConditionCheckFailuresBuffer.write(encoder.encodeArrayHeader(request.TransactItems.length));

    let promiseChain = Promise.resolve();
    request.TransactItems.forEach((transactWriteItem, i) => {
      promiseChain = promiseChain.then(() => {
        if(!transactWriteItem) {
          throw RequestValidator.newValidationException(`1 validation error detected: Value '${JSON.stringify(request.TransactItems)}' at 'transactItems' failed to satisfy constraint: Member must not be null`);
        }

        let tableName;
        let updateExpr;
        let conditionExpr;
        let rvOnConditionCheckFailure;
        let operation;
        let key;
        let item;
        let eAttrVal;
        let eAttrName;
        let opName;
        let operations = 0;

        if(transactWriteItem.ConditionCheck) {
          operations++;
          let check = transactWriteItem.ConditionCheck;
          tableName = check.TableName;
          operation = Operation.CHECK;
          key = check.Key;
          conditionExpr = check.ConditionExpression;
          if(!conditionExpr) {
            throw RequestValidator.newValidationException(
              `Value ${JSON.stringify(check.ConditionExpression)} at 'transactItems.${i+1}.member.conditionCheck.conditionExpression' failed to satisfy constraint: Member must not be null`);
          }
          eAttrName = check.ExpressionAttributeNames;
          eAttrVal = check.ExpressionAttributeValues;
          rvOnConditionCheckFailure = check.ReturnValuesOnConditionCheckFailure;
          opName = 'conditionCheck';
        }
        if(transactWriteItem.Put) {
          operations++;
          let put = transactWriteItem.Put;
          tableName = put.TableName;
          operation = Operation.PUT;
          item = put.Item;
          conditionExpr = put.ConditionExpression;
          eAttrName = put.ExpressionAttributeNames;
          eAttrVal = put.ExpressionAttributeValues;
          rvOnConditionCheckFailure = put.ReturnValuesOnConditionCheckFailure;
          opName = 'put';
        }
        if(transactWriteItem.Delete) {
          operations++;
          // delete is the reserved word for JS.
          let deleteOp = transactWriteItem.Delete;
          tableName = deleteOp.TableName;
          operation = Operation.DELETE;
          key = deleteOp.Key;
          conditionExpr = deleteOp.ConditionExpression;
          eAttrName = deleteOp.ExpressionAttributeNames;
          eAttrVal = deleteOp.ExpressionAttributeValues;
          rvOnConditionCheckFailure = deleteOp.ReturnValuesOnConditionCheckFailure;
          opName = 'delete';
        }
        if(transactWriteItem.Update) {
          operations++;
          let update = transactWriteItem.Update;
          tableName = update.TableName;
          operation = Operation.PARTIAL_UPDATE;
          key = update.Key;
          conditionExpr = update.ConditionExpression;
          updateExpr = update.UpdateExpression;
          if(!updateExpr) {
            throw RequestValidator.newValidationException(
              `1 validation error detected: Value null at 'transactItems.${i+1}.member.update.updateExpression' failed to satisfy constraint: Member must not be null`);
          }
          eAttrName = update.ExpressionAttributeNames;
          eAttrVal = update.ExpressionAttributeValues;
          rvOnConditionCheckFailure = update.ReturnValuesOnConditionCheckFailure;
          opName = 'update';
        }

        if(operations > 1) {
          throw RequestValidator.newValidationException('TransactItems can only contain one of ConditionCheck, Put, Update or Delete');
        }
        if(operations === 0) {
          throw RequestValidator.newValidationException('Invalid Request: TransactWriteRequest should contain Delete or Put or Update request');
        }

        RequestValidator.validateTableName(tableName, `transactItems.${i+1}.member.${opName}.tableName`);
        RequestValidator.validateTransactItem(opName === 'put' ? item : key, `transactItems.${i+1}.member.${opName}.${opName === 'put' ? 'item' : 'key'}`);
        RequestValidator.validateExpression(conditionExpr,
          updateExpr, // UpdateExpression
          null, // ProjectionExpression
          null, // FilterExpression
          null, // key condition expression
          null,
          null,
          null, // AttributeUpdates
          null, // AttributesToGet
          null, // query filter
          null, // scan filter
          null, // Key Condition
          eAttrName,
          eAttrVal);

        return this.keyCache.get(tableName).then((keySchema) => {
          keysPerTable[tableName] = keySchema;
          keysPerRequest.push(Util.extractKey(key ? key : item, keySchema));
          if(key) {
            RequestValidator.validateKey(key, keySchema);
          }
          let keyBytes = Encoder.encodeKey(key ? key : item, keySchema, encoder);
          let keySet = keySetPerTable[tableName];
          if(!keySet) {
            keySet = {};
            keySetPerTable[tableName] = keySet;
          }
          if(keySet[keyBytes]) {
            throw new DaxClientError('Provided list of item keys contains duplicates', DaxErrorCode.Validation, false);
          }
          // This will convert buffer to string first. Set will compare Buffer reference instead of actual value.
          keySet[keyBytes] = true;
          keysBuffer.write(keyBytes);

          if(item) {
            let attrNames = AttributeValueEncoder.getCanonicalAttributeList(item, keySchema);
            return this.attrListIdCache.get(attrNames).then((attrListId) => {
              valuesBuffer.write(Encoder.encodeValuesWithKeys(item, keySchema, attrListId, encoder));
            });
          } else {
            valuesBuffer.write(encoder.encodeNull());
          }
        }).then(() => {
          operationsBuffer.write(encoder.encodeInt(operation));
          tableNamesBuffer.write(encoder.encodeBinary(tableName));
          if(rvOnConditionCheckFailure) {
            rvOnConditionCheckFailuresBuffer.write(encoder.encodeInt(ReturnValueOnConditionCheckFailure[rvOnConditionCheckFailure]));
          } else {
            rvOnConditionCheckFailuresBuffer.write(encoder.encodeInt(ReturnValueOnConditionCheckFailure.NONE));
          }

          let encodedExprs = Encoder.encodeExpressions({
            ConditionExpression: conditionExpr,
            UpdateExpression: updateExpr,
            ExpressionAttributeNames: eAttrName,
            ExpressionAttributeValues: eAttrVal,
          });
          if(encodedExprs.Condition) {
            conditionExprsBuffer.write(encoder.encodeBinary(encodedExprs.Condition));
          } else {
            conditionExprsBuffer.write(encoder.encodeNull());
          }
          if(encodedExprs.Update) {
            updateExprsBuffer.write(encoder.encodeBinary(encodedExprs.Update));
          } else {
            updateExprsBuffer.write(encoder.encodeNull());
          }
        });
      });
    });

    return promiseChain.then(() => {
      request._keysPerTable = keysPerTable;
      request._keysPerRequest = keysPerRequest;
      if(!request.ClientRequestToken) {
        request.ClientRequestToken = UUID.v4();
      }
      request._stubData = {
        operations: operationsBuffer.read(),
        tableNames: tableNamesBuffer.read(),
        keys: keysBuffer.read(),
        values: valuesBuffer.read(),
        returnValues: null,
        returnValuesOnConditionCheckFailure: rvOnConditionCheckFailuresBuffer.read(),
        conditionExpressions: conditionExprsBuffer.read(),
        updateExpressions: updateExprsBuffer.read(),
        kwargs: Encoder.encodeExpressionAndKwargs({
          ReturnConsumedCapacity: request.ReturnConsumedCapacity,
          ReturnItemCollectionMetrics: request.ReturnItemCollectionMetrics,
          ClientRequestToken: request.ClientRequestToken,
        }, encoder).kwargs,
      };
    });
  }

  write_transactWriteItems_N1160037738_1(data, tube) {
    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(DaxMethodIds.transactWriteItems));
    tube.write(data.operations);
    tube.write(data.tableNames);
    tube.write(data.keys);
    tube.write(data.values ? data.values : tube.cbor.encodeNull());
    tube.write(data.returnValues ? data.returnValues : tube.cbor.encodeNull());
    tube.write(data.returnValuesOnConditionCheckFailure ? data.returnValuesOnConditionCheckFailure : tube.cbor.encodeNull());
    tube.write(data.conditionExpressions ? data.conditionExpressions : tube.cbor.encodeNull());
    tube.write(data.updateExpressions ? data.updateExpressions : tube.cbor.encodeNull());
    tube.write(data.kwargs ? data.kwargs : tube.cbor.encodeNull());
    tube.flush();
  }


  _validateWriteRequest(writeRequest) {
    if(writeRequest.PutRequest && writeRequest.DeleteRequest) {
      throw new DaxClientError('Both delete and put request cannot be set', DaxErrorCode.Validation, false);
    }
    if(!writeRequest.PutRequest && !writeRequest.DeleteRequest) {
      throw new DaxClientError('Both delete and put request cannot be empty', DaxErrorCode.Validation, false);
    }
  }

  _validateBatchWriteItem(attributes) {
    if(!attributes || Object.keys(attributes) === 0) {
      throw new DaxClientError(
        `1 validation error detected. Value ${JSON.stringify(attributes)} at "item" failed to satisfy constraint: Item must not be null`,
        DaxErrorCode.Validation, false);
    }

    Object.keys(attributes).forEach((name) => {
      if(this._simpleAttrValLength(attributes[name]) > BATCH_WRITE_MAX_ITEM_SIZE) {
        throw new DaxClientError('Item size has exceeded the maximum allowed size', DaxErrorCode.Validation, false);
      }
    });
  }

  /*
   * Validate the TransactGetItems request.
   *
   * Attempt to match the codes and messages emitted by the DynamoDB JavaScript client:
   *
   * $ node
   * > var AWS = require('aws-sdk')
   * > AWS.config.update({region: 'us-west-2'})
   * > ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'})
   * > ddb.transactGetItems({}, function(err, data) { if(err) { console.log('Error', err); } })
   *   ...
   *   Response {
   *     error:
   *      { MissingRequiredParameter: Missing required key 'TransactItems' in params
   *        ...
   *        message: 'Missing required key \'TransactItems\' in params',
   *        code: 'MissingRequiredParameter',
   */
  _validateTransactGetItems(request) {
    let validationErrors = [];

    if(request.TransactItems == null) {
      throw new DaxClientError(
        'Missing required key \'TransactItems\' in params',
        DaxErrorCode.Validation, false, undefined, 400);
    }

    if(request.TransactItems.length < 1) {
      validationErrors.push(
        'Value \'' + JSON.stringify(request.TransactItems)
          + '\' at \'transactItems\' failed to satisfy constraint: Member must have length greater than or equal to 1');
    } else if(request.TransactItems.length > 25) {
      validationErrors.push(
        'Value \'' + JSON.stringify(request.TransactItems)
          + '\' at \'transactItems\' failed to satisfy constraint: Member must have length less than or equal to 25');
    }

    for(const [i, item] of request.TransactItems.entries()) {
      if(item === null || !('Get' in item)) {
        throw new DaxClientError(
          'Cannot read property \'Get\' of ' + JSON.stringify(item), DaxErrorCode.Validation, false, undefined, 400);
      }
      let get = item.Get;

      if(get === null || !('Key' in get)) {
        throw new DaxClientError(
          'Cannot read property \'Key\' of ' + JSON.stringify(item), DaxErrorCode.Validation, false, undefined, 400);
      }

      if(!('TableName' in get) || get.TableName == null) {
        throw new DaxClientError(
          `Missing required key 'TableName' in params.TransactItems[${i}].Get`, DaxErrorCode.Validation, false, undefined, 400);
      }
      let tableName = get.TableName;

      if(tableName.length < 3) {
        validationErrors.push(`Value '${tableName}' at 'transactItems.${i + 1}.member.get.tableName' failed to satisfy constraint: `
                              + 'Member must have length greater than or equal to 3');
      }

      if(!/[a-zA-Z0-9_.-]+/.test(tableName)) {
        validationErrors.push(`Value '${tableName}' at 'transactItems.${i + 1}.member.get.tableName' failed to satisfy constraint: `
                              + 'Member must satisfy regular expression pattern: [a-zA-Z0-9_.-]+');
      }

      let key = get.Key;
      if(key === null) {
        throw new DaxClientError(
          `Missing required key 'Key' in params.TransactItems[${i}].Get`, DaxErrorCode.Validation, false, undefined, 400);
      }
    }

    if(validationErrors.length > 0) {
      throw new DaxClientError(
        validationErrors.length + ' validation errors detected: ' + validationErrors.join('; '),
        DaxErrorCode.Validation, false, undefined, 400);
    }
  }

  /*
   * Validate the keys against the table schemas. We've already validated
   * the existence of the table names and keys in
   * _validateTransactGetItems(), so it's safe to dereference them now.
   */
  _validate_transactgetitems_keys(items, keySchemasForTables) {
    let validationErrors = [];
    for(const [i, item] of items.entries()) {
      let schema = keySchemasForTables[item.TableName];
      for(const attrSchema of schema) {
        let attrName = attrSchema.AttributeName;
        let attrSchemaType = attrSchema.AttributeType;
        let keyAttr = item.Key[attrName];

        if(!keyAttr) {
          // Missing key attribute
          validationErrors.push(`key attribute '${attrName}' is missing from params.TransactItems[${i}].Get.Key`);
        } else if(!keyAttr.hasOwnProperty(attrSchemaType)) {
          // Key attribute with wrong type
          validationErrors.push(`key attribute '${attrName}' with value '${JSON.stringify(item.Key[attrName])}' `
                                + 'does not match schema type \'${attrSchemaType}\'');
        }
      }
      let keyAttrNames = Object.keys(item.Key);
      if(schema.length != keyAttrNames.length) {
        validationErrors.push(`key length does not match schema for table '${item.TableName}' in params.TransactItems[${i}].Get.Key`);
      }
    }

    if(validationErrors.length > 0) {
      throw new DaxClientError(
        validationErrors.length + ' validation errors detected: ' + validationErrors.join('; '),
        DaxErrorCode.Validation, false, undefined, 400);
    }
  }

  prepare_transactGetItems_1866287579_1(request) {
    let stubData = {};
    let kwargsBuffer = new StreamBuffer();
    let tableNameBuffer = new StreamBuffer();
    let keysBuffer = new StreamBuffer();
    let encoder = new CborEncoder();

    this._validateTransactGetItems(request);

    // Prepare the keyword arguments
    let hasKwargs = request.ReturnConsumedCapacity;
    if(hasKwargs) {
      kwargsBuffer.write(encoder.encodeMapStreamHeader());
      if(request.ReturnConsumedCapacity) {
        kwargsBuffer.write(encoder.encodeInt(Constants.DaxDataRequestParam.ReturnConsumedCapacity));
        kwargsBuffer.write(encoder.encodeInt(Constants.ReturnConsumedCapacityValues[request.ReturnConsumedCapacity]));
      }
      kwargsBuffer.write(encoder.encodeStreamBreak());
    } else {
      kwargsBuffer.write(encoder.encodeNull());
    }
    stubData.kwargs = kwargsBuffer.read();

    let items = request.TransactItems.map((transactItem) => transactItem.Get);
    tableNameBuffer.write(encoder.encodeArrayHeader(items.length));
    keysBuffer.write(encoder.encodeArrayHeader(items.length));

    // Prepare the table names
    for(const item of items) {
      let tableName = item.TableName;
      tableNameBuffer.write(encoder.encodeBinary(tableName));
    }
    stubData.tableNames = tableNameBuffer.read();

    // Validate the keys against the key schema.
    // First, collect the table names.
    let tableNames = items.reduce((tableNames, item) => {
      tableNames.add(item.TableName);
      return tableNames;
    }, new Set());

    // Next, build a promise of a map of table names to key schema.
    let keySchemasForTablesPromise = Array.from(tableNames.values()).reduce(
      (keySchemasForTables, tableName) => {
        // We need to resolve both the table names to schemas dict, and the
        // schema value from the key cache. Put both promises in an array
        // to call Promise.all() on, then assign the schema to the dict.
        return Promise.all([keySchemasForTables, this.keyCache.get(tableName)]).then((arr) => {
          arr[0][tableName] = arr[1];
          return arr[0];
        });
      },
      Promise.resolve({})
    );

    return keySchemasForTablesPromise
      .then((keySchemasForTables) => {
        // Now we can validate the keys against their table schema
        this._validate_transactgetitems_keys(items, keySchemasForTables);

        // and write them
        items.forEach((item) => keysBuffer.write(Encoder.encodeKey(item.Key, keySchemasForTables[item.TableName], encoder)));

        // and save them in the stub data
        stubData.keys = keysBuffer.read();
        request._stubData = stubData;

        // and write the projection expressions
        let projectionExpressionsBuffer = new StreamBuffer();
        projectionExpressionsBuffer.write(encoder.encodeArrayHeader(items.length));
        for(const item of items) {
          if('ProjectionExpression' in item) {
            projectionExpressionsBuffer.write(encoder.encodeBinary(Encoder._encodeProjection(item.ProjectionExpression, item.ExpressionAttributeNames)));
            item._projectionOrdinals = [];
            Encoder._prepareProjection(item.ProjectionExpression, item.ExpressionAttributeNames, item._projectionOrdinals);
          } else {
            projectionExpressionsBuffer.write(encoder.encodeNull());
          }
        }
        stubData.projectionExpressions = projectionExpressionsBuffer.read();
      })
      .then(() => stubData);
  }

  write_transactGetItems_1866287579_1(data, tube) {
    tube.write(tube.cbor.encodeInt(1));
    tube.write(tube.cbor.encodeInt(Constants.DaxMethodIds.transactGetItems));
    tube.write(data.tableNames ? data.tableNames : tube.cbor.encodeNull());
    tube.write(data.keys ? data.keys : tube.cbor.encodeNull());
    tube.write(data.projectionExpressions ? data.projectionExpressions : tube.cbor.encodeNull());
    tube.write(data.kwargs ? data.kwargs : tube.cbor.encodeNull());
    tube.flush();
  }

  _simpleAttrValLength(v) {
    if(!v) {
      return 0;
    } else if(v.S) {
      return v.S.length;
    } else if(v.B) {
      return v.B.length;
    } else if(v.N) {
      return v.N.length;
    } else if(v.BS) {
      let size = 0;
      for(let b of v.BS) {
        size += b.length;
      }
      return size;
    }
    // Only the primitive types are expected
    return 0;
  }
};
