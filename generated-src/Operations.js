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

const BaseOperations = require('../src/BaseOperations');
const CborDecoder = require('../src/CborDecoder');
const AttributeValueEncoder = require('../src/AttributeValueEncoder');
const Stubs = require('./Stubs');
const Assembler = require('../src/Assembler');
const CustomAssemblers = require('../src/CustomAssemblers');
const DaxMethodIds = require('../src/Constants').DaxMethodIds;
const DynamoDBV1Converter = require('../src/DynamoDBV1Converter');


module.exports = class Operations extends BaseOperations {
  constructor(keyCache, attrListCache, attrListIdCache, tubePool, requestTimeout) {
    super(keyCache, attrListCache, attrListIdCache, tubePool, requestTimeout);
  }

  batchGetItem_N697851100_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.batchGetItem);

    return Promise.resolve()
      // Use a custom preparation for batchGetItem
      .then(() => this.prepare_batchGetItem_N697851100_1(request))
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_batchGetItem_N697851100_1_Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              this.write_batchGetItem_N697851100_1(request._stubData, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  batchWriteItem_116217951_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.batchWriteItem);

    return Promise.resolve()
      // Use a custom preparation for batchWriteItem
      .then(() => this.prepare_batchWriteItem_116217951_1(request))
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_batchWriteItem_116217951_1_Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              this.write_batchWriteItem_116217951_1(request._stubData, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  defineAttributeList_670678385_1(attributeListId) {

    return Promise.resolve()
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_defineAttributeList_670678385_1_Assembler(null, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_defineAttributeList_670678385_1(attributeListId, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  defineAttributeListId_N1230579644_1(attributeNames) {

    return Promise.resolve()
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_defineAttributeListId_N1230579644_1_Assembler(null, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_defineAttributeListId_N1230579644_1(attributeNames, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  defineKeySchema_N742646399_1(tableName) {

    return Promise.resolve()
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_defineKeySchema_N742646399_1_Assembler(null, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_defineKeySchema_N742646399_1(tableName, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  deleteItem_1013539361_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.deleteItem);

    return Promise.resolve()
      // Precache the key to avoid parallel calls
      .then(() => {
        return this.keyCache.get(request.TableName)
          .then((keySchema) => { request._keySchema = keySchema; });
      })
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_deleteItem_1013539361_1(request, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  endpoints_455855874_1() {

    return Promise.resolve()
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_endpoints_455855874_1_Assembler(null, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_endpoints_455855874_1(tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  getItem_263244906_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.getItem);

    return Promise.resolve()
      // Precache the key to avoid parallel calls
      .then(() => {
        return this.keyCache.get(request.TableName)
          .then((keySchema) => { request._keySchema = keySchema; });
      })
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_getItem_263244906_1(request, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  putItem_N2106490455_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.putItem);

    return Promise.resolve()
      // Precache the key to avoid parallel calls
      .then(() => {
        return this.keyCache.get(request.TableName)
          .then((keySchema) => { request._keySchema = keySchema; });
      })
      // Precache the attribute list ID to avoid parallel calls
      .then(() => {
        let attrNames = AttributeValueEncoder.getCanonicalAttributeList(request.Item, request._keySchema);
        return this.attrListIdCache.get(attrNames)
          .then((attrListId) => { request._attrNames = attrNames; request._attrListId = attrListId; });
      })
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_putItem_N2106490455_1(request, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  query_N931250863_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.query);

    return Promise.resolve()
      // Precache the key to avoid parallel calls
      .then(() => {
        return this.keyCache.get(request.TableName)
          .then((keySchema) => { request._keySchema = keySchema; });
      })
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_query_N931250863_1(request, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  scan_N1875390620_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.scan);

    return Promise.resolve()
      // Precache the key to avoid parallel calls
      .then(() => {
        return this.keyCache.get(request.TableName)
          .then((keySchema) => { request._keySchema = keySchema; });
      })
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_scan_N1875390620_1(request, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  transactGetItems_1866287579_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.transactGetItems);

    return Promise.resolve()
      // Use a custom preparation for transactGetItems
      .then(() => this.prepare_transactGetItems_1866287579_1(request))
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_transactGetItems_1866287579_1_Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              this.write_transactGetItems_1866287579_1(request._stubData, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  transactWriteItems_N1160037738_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.transactWriteItems);

    return Promise.resolve()
      // Use a custom preparation for transactWriteItems
      .then(() => this.prepare_transactWriteItems_N1160037738_1(request))
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new CustomAssemblers.Custom_transactWriteItems_N1160037738_1_Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              this.write_transactWriteItems_N1160037738_1(request._stubData, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

  updateItem_1425579023_1(ddbRequest) {
    // Pre-process requests, including V1-V2 conversion
    let request = DynamoDBV1Converter.convertRequest(ddbRequest, DaxMethodIds.updateItem);

    return Promise.resolve()
      // Precache the key to avoid parallel calls
      .then(() => {
        return this.keyCache.get(request.TableName)
          .then((keySchema) => { request._keySchema = keySchema; });
      })
      .then(() => {
        let tube = null;
        return this.tubePool.alloc()
          .then((t) => {
            // assign tube for later clean up.
            tube = t;
            return this.reauth(t);
          })
          .then(() => {
            let assembler = new Assembler(request, tube.responseBuffer);

            // everything needs to be wrapped into promise chain in order to catch exception and avoid leak.
            return Promise.all([
              // Wrap the assembler result in a promise
              this._getReturnHandler(tube, assembler),
              // Send the actual request
              Stubs.write_updateItem_1425579023_1(request, tube),
            ]).then((result) => {
              return result[0];
            });
          });
      });
  }

};
