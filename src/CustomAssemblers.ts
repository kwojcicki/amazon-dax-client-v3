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

import { Assembler } from './Assembler';
import { Util } from './Util';
import { DaxClientError } from './DaxClientError';
import { DaxErrorCode } from './DaxErrorCode';

exports.Custom_defineKeySchema_N742646399_1_Assembler = class Custom_defineKeySchema_N742646399_1_Assembler extends Assembler {
  _assembleResult() {
    let schema: any[] = [];
    this.dec.processMap(() => {
      let attrName = this.dec.decodeString();
      let attrType = this.dec.decodeString();
      schema.push({ AttributeName: attrName, AttributeType: attrType });
    });
    return schema;
  }
};

exports.Custom_defineAttributeList_670678385_1_Assembler = class Custom_defineAttributeList_670678385_1_Assembler extends Assembler {
  _assembleResult() {
    return this.dec.decodeObject();
  }
};

exports.Custom_defineAttributeListId_N1230579644_1_Assembler = class Custom_defineAttributeListId_N1230579644_1_Assembler extends Assembler {
  _assembleResult() {
    return this.dec.decodeInt();
  }
};

exports.Custom_endpoints_455855874_1_Assembler = class Custom_endpoints_455855874_1_Assembler extends Assembler {
  _assembleResult() {
    let result = this.dec.decodeObject();
    let eps: any[] = [];
    for (let ep of result) {
      if (!(ep[2] instanceof Buffer) && ep[2].length !== 4) {
        throw new DaxClientError('unexpected Endpoint IP address', DaxErrorCode.MalformedResult);
      }
      ep[2] = ep[2].readUInt8(0) + '.' + ep[2].readUInt8(1) + '.' + ep[2].readUInt8(2) + '.' + ep[2].readUInt8(3);
      eps.push(Util.serviceEndpointFrom(ep[0], ep[1], ep[2], ep[3], ep[4], ep[5], ep[6]));
    }
    return eps;
  }
};

exports.Custom_batchGetItem_N697851100_1_Assembler = class Custom_batchGetItem_N697851100_1_Assembler extends Assembler {
  _expectedResponseValues() {
    // Due to a mistake in the server-side response serialization, the response for BatchGetItem
    // consists of *two* top-level CBOR values instead of just one. The server side declares an
    // array of length 2, but then sends *three* elements. Therefore, the third element is outside
    // the array and is its own top-level CBOR value.
    return 2;
  }

  _assembleResult() {
    // Assume the error response has already been handled
    let result: { Responses: any; UnprocessedKeys: any; ConsumedCapacity?: any } = { Responses: {}, UnprocessedKeys: {} };
    let length = this.dec.decodeArrayLength();
    if (length !== 2) {
      throw new DaxClientError('BatchGetResponse needs to have two elements, instead had: ' + length,
        DaxErrorCode.MalformedResult);
    }

    result.Responses = {};
    this.dec.processMap(() => {
      let tableName = this.dec.decodeString();
      let projOrdinals = this._request._tableProjOrdinals[tableName];
      let items: any[] = [];
      if (projOrdinals && projOrdinals.length > 0) {
        this.dec.processArray(() => {
          let item = this._decodeItemInternalHelper(projOrdinals);
          items.push(item);
        });
      } else {
        let keySchema = this._request._keysPerTable[tableName];
        let numItems = this.dec.decodeArrayLength();
        for (let i = 0; i < numItems; i += 2) {
          let key = Assembler._decodeKeyBytes(this.dec, keySchema);
          let item = Assembler._decodeStreamItem(this.dec.decodeCbor());
          item = Object.assign(item, key);

          items.push(item);
        }
      }

      result.Responses[tableName] = items;
    });

    result.UnprocessedKeys = {};
    this.dec.processMap(() => {
      let tableName = this.dec.decodeString();
      let keySchema = this._request._keysPerTable[tableName];
      let keys = this.dec.buildArray(() => Assembler._decodeKeyBytes(this.dec, keySchema));

      if (keys.length > 0) {
        let requestInfo = { Keys: keys };

        // Copy the RequestInfo back into the UnprocessedKeys items
        let tableRequest = this._request.RequestItems[tableName];
        // A table in the response should always be in the request, but guard just in case
        if (tableRequest) {
          for (let field of ['ProjectionExpression', 'ConsistentRead', 'AttributesToGet', 'ExpressionAttributeNames']) {
            let requestField = tableRequest[field];
            if (requestField) {
              requestInfo[field] = requestField;
            }
          }
        }

        result.UnprocessedKeys[tableName] = requestInfo;
      }
    });

    let consumedCapacities = this.dec.buildArray(() => Assembler._decodeConsumedCapacityData(this.dec.decodeCbor()));
    if (this._request.ReturnConsumedCapacity && this._request.ReturnConsumedCapacity !== 'NONE') {
      result.ConsumedCapacity = verifyBatchConsumedCapacity(consumedCapacities, Object.getOwnPropertyNames(this._request.RequestItems));
    }

    return result;
  }
};

exports.Custom_batchWriteItem_116217951_1_Assembler = class Custom_batchWriteItem_116217951_1_Assembler extends Assembler {
  _expectedResponseValues() {
    // Server response is three separate values: unprocessed items, consumed capacity and item collection metrics
    return 3;
  }

  _assembleResult() {
    let unprocessedItemsByTable = {};

    this.dec.processMap(() => {
      let tableName = this.dec.decodeString();
      let numItems = this.dec.decodeArrayLength();
      let keySchema = this._request._keysPerTable[tableName];

      unprocessedItemsByTable[tableName] = [];
      for (let i = 0; i < numItems; i += 2) {
        let key = Assembler._decodeKeyBytes(this.dec, keySchema);
        if (this.dec.tryDecodeNull()) {
          // DeleteRequest
          unprocessedItemsByTable[tableName].push({ DeleteRequest: { Key: key } });
        } else {
          // PutRequest
          let item = Assembler._decodeStreamItem(this.dec.decodeCbor());
          // These get de-anonymized later
          unprocessedItemsByTable[tableName].push({ PutRequest: { Item: item } });
        }
      }
    });

    let result: { UnprocessedItems: any; ConsumedCapacity?: any; ItemCollectionMetrics?: any } = {
      UnprocessedItems: unprocessedItemsByTable,
    };

    let consumedCapacities = this.dec.buildArray(() => Assembler._decodeConsumedCapacityData(this.dec.decodeCbor()));
    if (this._request.ReturnConsumedCapacity && this._request.ReturnConsumedCapacity !== 'NONE') {
      result.ConsumedCapacity = verifyBatchConsumedCapacity(consumedCapacities, Object.getOwnPropertyNames(this._request.RequestItems));
    }

    let itemCollectionMetrics = this.dec.buildMap(() => {
      let tableName = this.dec.decodeString();
      let keySchema = this._request._keysPerTable[tableName];
      let metrics = this.dec.buildArray(() => Assembler._decodeItemCollectionMetricsData(this.dec.decodeCbor(), keySchema));
      return [tableName, metrics];
    });
    if (this._request.ReturnItemCollectionMetrics && this._request.ReturnItemCollectionMetrics !== 'NONE') {
      result.ItemCollectionMetrics = itemCollectionMetrics;
    }

    return result;
  }
};

function verifyBatchConsumedCapacity(consumedCapacityByTable, tables) {
  let tablesWithConsumedCapacity = new Set();
  if (consumedCapacityByTable) {
    for (let capacity of consumedCapacityByTable) {
      if (capacity) {
        tablesWithConsumedCapacity.add(capacity.TableName);
      }
    }
  }
  for (let table of tables) {
    if (!tablesWithConsumedCapacity.has(table)) {
      let consumedCapacity = {} as any;
      consumedCapacity.TableName = table;
      consumedCapacity.CapacityUnits = 0;
      consumedCapacityByTable.push(consumedCapacity);
    }
  }
  return consumedCapacityByTable;
}

exports.Custom_transactGetItems_1866287579_1_Assembler = class Custom_transactGetItems_1866287579_1_Assembler extends Assembler {
  _assembleResult() {
    // Assume the error response has already been handled
    let result = {} as any;

    // Response is an array of two elements. The first element is an array
    // of items, the second is a nullable array of consumed capacity
    // responses, one entry per table.
    let length = this.dec.decodeArrayLength();
    if (length !== 2) {
      throw new DaxClientError('TransactGetResponse needs to have 2 elements, instead had: ' + length,
        DaxErrorCode.MalformedResult);
    }

    // Read the items
    let itemCount = this.dec.decodeArrayLength();
    let items: any[] = [];
    for (let i = 0; i < itemCount; i++) {
      if (this.dec.tryDecodeNull()) {
        items.push(null);
      } else {
        let projectionOrdinals = this._request.TransactItems[i].Get._projectionOrdinals;
        if (projectionOrdinals && projectionOrdinals.length > 0) {
          items.push(this._decodeItemInternalHelper(projectionOrdinals));
        } else {
          let item = Assembler._decodeStreamItem(this.dec.decodeCbor());
          // Add the keys from the request
          item = Object.assign(item, this._request.TransactItems[i].Get.Key);
          items.push(item);
        }
      }
    }

    // Read the consumed capacity
    let consumedCapacities: any[] = [];
    if (!this.dec.tryDecodeNull()) {
      let consumedCapacityCount = this.dec.decodeArrayLength();
      while (consumedCapacityCount-- > 0) {
        let consumedCapacity = Assembler._decodeConsumedCapacityExtended(this.dec);
        if (consumedCapacity) {
          consumedCapacities.push(consumedCapacity);
        }
      }
    }
    if (consumedCapacities.length > 0) {
      result.ConsumedCapacity = consumedCapacities;
    }

    result.Responses = items.map((item) => item ? { 'Item': item } : {});
    return result;
  }
};

exports.Custom_transactWriteItems_N1160037738_1_Assembler = class Custom_transactWriteItems_N1160037738_1_Assembler extends Assembler {
  _assembleResult() {
    let arrayLen = this.dec.decodeArrayLength();
    if (arrayLen !== 3) {
      throw new DaxClientError(`TransactWriteResponse needs to have 3 elements, instead had: ${length}`, DaxErrorCode.MalformedResult);
    }

    // skip Responses field in TransactWriteItem response since DDB removed this field after preview.
    this.dec.decodeObject();
    let result = {} as any;
    // Read the consumed capacity
    let consumedCapacities;
    if (!this.dec.tryDecodeNull()) {
      consumedCapacities = this.dec.buildArray(() => {
        return Assembler._decodeConsumedCapacityExtended(this.dec);
      });
    }
    if (consumedCapacities && consumedCapacities.length > 0) {
      result.ConsumedCapacity = consumedCapacities;
    }

    let itemCollectionMetrics;

    if (!this.dec.tryDecodeNull()) {
      itemCollectionMetrics = this.dec.buildMap(() => {
        let tableName = this.dec.decodeString();
        let keySchema = this._request._keysPerTable[tableName];
        let metrics = this.dec.buildArray(() => Assembler._decodeItemCollectionMetricsData(this.dec.decodeCbor(), keySchema));
        return [tableName, metrics];
      });
    }
    if (this._request.ReturnItemCollectionMetrics && this._request.ReturnItemCollectionMetrics !== 'NONE') {
      result.ItemCollectionMetrics = itemCollectionMetrics;
    }
    return result;
  }
};
