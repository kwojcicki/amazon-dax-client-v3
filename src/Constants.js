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
/* eslint no-invalid-this: ["off"]*/
'use strict';
const self = this;
self.DaxResponseParam = {
  Item: 0,
  ConsumedCapacity: 1,
  Attributes: 2,
  ItemCollectionMetrics: 3,
  Responses: 4,
  UnprocessedKeys: 5,
  UnprocessedItems: 6,
  Items: 7,
  Count: 8,
  LastEvaluatedKey: 9,
  ScannedCount: 10,
  TableDescription: 11,
};

self.DaxTableRequestParam = {
  AttributeDefinitions: 0,
  KeySchema: 1,
  ProvisionedThroughput: 2,
  GlobalSecondaryIndexes: 3,
  LocalSecondaryIndexes: 4,
  StreamSpecification: 5,
  GlobalSecondaryIndexUpdates: 6,
  ExclusiveStartTableName: 7,
  Limit: 8,
};

self.DaxDataRequestParam = {
  ProjectionExpression: 0,
  ExpressionAttributeNames: 1,
  ConsistentRead: 2,
  ReturnConsumedCapacity: 3,
  ConditionExpression: 4,
  ExpressionAttributeValues: 5,
  ReturnItemCollectionMetrics: 6,
  ReturnValues: 7,
  UpdateExpression: 8,
  ExclusiveStartKey: 9,
  FilterExpression: 10,
  IndexName: 11,
  KeyConditionExpression: 12,
  Limit: 13,
  ScanIndexForward: 14,
  Select: 15,
  Segment: 16,
  TotalSegments: 17,
  RequestItems: 18,
  ClientRequestToken: 19,
};

self.DaxMethodIds = {
  authorizeConnection: 1489122155,
  batchGetItem: -697851100,
  batchWriteItem: 116217951,
  createTable: -313431286,
  defineAttributeList: 670678385,
  defineAttributeListId: -1230579644,
  defineKeySchema: -742646399,
  deleteItem: 1013539361,
  deleteTable: 2120496185,
  describeLimits: -475661135,
  describeTable: -819330193,
  endpoints: 455855874,
  getItem: 263244906,
  listTables: 1874119219,
  methods: 785068263,
  putItem: -2106490455,
  query: -931250863,
  scan: -1875390620,
  services: -1016793520,
  transactGetItems: 1866287579,
  transactWriteItems: -1160037738,
  updateItem: 1425579023,
  updateTable: 383747477,
};

self.Operation = {
  GET: 1,
  PUT: 2,
  EXCHANGE: 3,
  INSERT: 4,
  REPLACE: 5,
  UPDATE: 6,
  DELETE: 7,
  REMOVE: 8,
  PARTIAL_UPDATE: 9,
  BATCH_GET: 10,
  BATCH_WRITE: 11,
  CHECK: 12,
  TRANSACT_WRITE: 13,
  TRANSACT_GET: 14,
  SCAN: 15,
  QUERY: 16,
  CREATE_TABLE: 17,
  DELETE_TABLE: 18,
  DESCRIBE_TABLE: 19,
  LIST_TABLE: 20,
  UPDATE_TABLE: 21,
};

self.ReturnValueOnConditionCheckFailure = {
  NONE: 1,
  ALL_OLD: 2,
};

self.ReturnConsumedCapacityValues = {
  NONE: 0,
  TOTAL: 1,
  INDEXES: 2,
};

self.ReturnItemCollectionMetricsValue = {
  NONE: 0,
  SIZE: 1,
};

self.SelectValues = {
  ALL_ATTRIBUTES: 1,
  ALL_PROJECTED_ATTRIBUTES: 2,
  COUNT: 3,
  SPECIFIC_ATTRIBUTES: 4,
};

self.ReturnValues = {
  NONE: 1,
  ALL_OLD: 2,
  UPDATED_OLD: 3,
  ALL_NEW: 4,
  UPDATED_NEW: 5,
};

self.ReturnItemCollectionMetricsValues = {
  NONE: 0,
  SIZE: 1,
};

// Index into this array is the enum value we use on the wire
self.ConsumedCapacityValues = [
  undefined,
  'CapacityUnits',
  'ReadCapacityUnits',
  'WriteCapacityUnits',
  'TableName',
  'Table',
  'GlobalSecondaryIndexes',
  'LocalSecondaryIndexes',
];
