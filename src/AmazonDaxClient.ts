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

/**
 * kerent - 3/29/21
 * antlr4 v3.8 has a circular dependency bug described here: https://github.com/antlr/antlr4/issues/2834
 * This issue is resolved in antlr4 v3.9, however, it requires a NodeJS version >= 14.x
 * The AWS NodeJS SDK currently allows NodeJS version >= 10.x.
 * At this time, we cannot update our dependencies so we will silence this warning instead of confusing customers.
 * This fix will prevent us outputting warnings from our dependencies, but not prevent users from seeing warnings that we issue to them.
 * Note: We should be testing locally with the line commented out so we don't miss warnings from dependencies.
 */
process.removeAllListeners('warning');

const EventEmitter = require('events');
const Cluster = require('./Cluster');
const DaxClient = require('./DaxClient');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const ERROR_CODES_WRITE_FAILURE_AMBIGUOUS = [[1, 37, 38, 53], [1, 37, 38, 55], ['*', 37, '*', 39, 47]];
const ERROR_CODES_THROTTLING = [
  DaxErrorCode.ProvisionedThroughputExceeded,
  DaxErrorCode.LimitExceeded,
  DaxErrorCode.RequestLimitExceeded,
  DaxErrorCode.Throttling,
];

// https://github.com/aws/aws-sdk-js/blob/880e811e857c34e4ad983c37837767cd5eddb98f/lib/util.js#L515
const abort = {};

// https://github.com/aws/aws-sdk-js/blob/880e811e857c34e4ad983c37837767cd5eddb98f/lib/util.js#L517C3-L524C4
function each(object, iterFunction) {
  for (var key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      var ret = iterFunction.call(this, key, object[key]);
      if (ret === abort) break;
    }
  }
}

//  https://github.com/aws/aws-sdk-js/blob/880e811e857c34e4ad983c37837767cd5eddb98f/lib/util.js#L535C3-L540C4
function update(obj1, obj2) {
  each(obj2, function iterator(key, item) {
    obj1[key] = item;
  });
  return obj1;
}

// https://github.com/aws/aws-sdk-js/blob/880e811e857c34e4ad983c37837767cd5eddb98f/lib/util.js#L639C12-L664C4
function inherit(klass, features) {
  var newObject = null;
  if (features === undefined) {
    features = klass;
    klass = Object;
    newObject = {};
  } else {
    var ctor = function ConstructorWrapper() { };
    ctor.prototype = klass.prototype;
    newObject = new ctor();
  }

  // constructor not supplied, create pass-through ctor
  if (features.constructor === Object) {
    features.constructor = function () {
      if (klass !== Object) {
        return klass.apply(this, arguments);
      }
    };
  }

  features.constructor.prototype = newObject;
  update(features.constructor.prototype, features);
  features.constructor.__super__ = klass;
  return features.constructor;
}

// Shim class to work with inheritance model expected by DocumentClient
const _AmazonDaxClient = inherit({
  constructor: function AmazonDaxClient(config) {
    this.middlewareStack = config.client.middlewareStack;

    // flag indicating if the underlying connection to DAX has been created/ready to use
    this._ready = false;
    var isDocumentClient = config.client instanceof DynamoDBDocumentClient;
    // using the passed in DDBs client config to configure DAX
    config = { ...config.client.config, ...config.config };

    this.config = config;
    this._textDecoder = new TextDecoder();
    this._textEncoder = new TextEncoder("utf-8");

    // entry point when DAX client is wrapped into a DynamoDBClient or DynamoDBDocumentClient
    this.config.requestHandler = {
      handle: async (request, _context) => {
        if (!this._ready) {
          await this._clusterReady;
          this._ready = true;
        }

        // amz-target will be something like DynamoDB_20120810.Query
        var target = request.headers['x-amz-target'].split(".")[1];
        if (!this[target]) {
          throw new Error('this operation is not supported currently: ' + target);
        }

        var resp = await this[target](JSON.parse(request.body));
        return {
          response: {
            output: {
              body: resp,
              $metadata: {}
            },
            body: resp,
            headers: {},
            $metadata: {},
            statusCode: 200
          },
          output: {
            ...resp,
            $metadata: {}
          }
        }
      }
    }

    // the sdkv3 middleware expects the response from its clients to be a stream 
    // (and for this method to turn that stream into an array of bytes)
    // the DAXRequest object directly returns a parsed response, so we restringify and encode it
    // ideally we modify DAXRequest to return a stream instead so we don't have to this round trip of parsing
    // this.config.streamCollector = (stream) => {
    //   console.trace();
    //   return new Promise((resolve) => {
    //     // resolve(this._textEncoder.encode(JSON.stringify(stream)));
    //     resolve(stream);
    //   })
    // };

    // this.config.utf8Encoder = (input) => {
    //   return JSON.stringify(input);
    //   // return this._textDecoder.decode(input);
    // }

    // no redirects in DAX
    this.config.maxRedirects = 0;

    /*
     * Skip hostname verification of TLS connections. This has no impact on un-encrypted clusters.
     * The default is to perform hostname verification, setting this to True will skip verification.
     * Be sure you understand the implication of turning it off, which is the inability to authenticate the cluster that you are connecting to.
     * The value for this configuration is a Boolean, either True or False.
     */
    this.skipHostnameVerification = config.skipHostnameVerification != null ? config.skipHostnameVerification : false;

    let requestTimeout = config.requestTimeout || 60000;
    this._clusterReady = new Promise((resolve, reject) => {
      Promise.all([config.credentials(), config.region(), config.endpoint()]).then((deasyncedValues) => {
        // not sure why I used to have to do this? Is it being memoized from a promise to directly returning the value???
        // if (!isDocumentClient) config.credentials = deasyncedValues[0];
        config.region = deasyncedValues[1];
        config.endpoint = `${deasyncedValues[2].protocol}//${deasyncedValues[2].hostname}`
        this._cluster = new Cluster(config, {
          createDaxClient: (pool, region, el) => {
            return new DaxClient(pool, region, el, requestTimeout);
          }
        });

        // precedence: write/read retry > ddb maxRetries > AWS config maxRetries > default(1 same as JAVA)
        if (!config.maxRetries && config.maxRetries !== 0) {
          config.maxRetries = 1;
        }
        this._writeRetries = config.writeRetries ? config.writeRetries : config.maxRetries;
        this._readRetries = config.readRetries ? config.readRetries : config.maxRetries;
        this._maxRetryDelay = config.maxRetryDelay ? config.maxRetryDelay : 7000;
        this._readClientFactory = {
          getClient: (previous) => {
            return this._cluster.readClient(previous);
          }
        };
        this._writeClientFactory = {
          getClient: (previous) => {
            return this._cluster.leaderClient(previous);
          }
        };

        this._cluster.startup();
        this._readOperationsRetryHandler = new RetryHandler(this._cluster, this._maxRetryDelay, this._readRetries);
        this._writeOperationsRetryHandler = new WriteOperationsRetryHandler(this._cluster, this._maxRetryDelay, this._writeRetries);
        resolve(true)
      }).catch((err) => {
        reject(err);
      });
    });
  },

  destroy: function destroy() {
    this.shutdown();
  },

  shutdown: function shutdown() {
    this._cluster.close();
  },

  // copied lib-dynamodb utility pagination methods
  paginateQuery: async function* paginateQuery(config, input, ...additionalArguments) {
    const makePagedClientRequest = async (client, input, ...args) => {
      return await client.send(new QueryCommand(input), ...args);
    };

    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
      input.ExclusiveStartKey = token;
      input["Limit"] = config.pageSize;
      page = await makePagedClientRequest(this, input, ...additionalArguments);
      yield page;
      token = page.LastEvaluatedKey;
      hasNext = !!token;
    }
    return undefined;
  },

  paginateScan: async function* paginateScan(config, input, ...additionalArguments) {
    const makePagedClientRequest = async (client, input, ...args) => {
      return await client.send(new ScanCommand(input), ...args);
    }

    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
      input.ExclusiveStartKey = token;
      input["Limit"] = config.pageSize;
      page = await makePagedClientRequest(this, input, ...additionalArguments);
      yield page;
      token = page.LastEvaluatedKey;
      hasNext = !!token;
    }
    return undefined;
  },

  // vv Supported DDB methods vv
  // upper cased methods are called as part of the DynamoDocumentDB/DynamoDB flow
  // lower cased methods are called directly as part of the DynamoClientDB flow

  BatchGetItem: function batchGetItem(params) {
    return this._makeReadRequestWithRetries('batchGetItem', params, (client, newParams) => {
      return client.batchGetItem(newParams);
    });
  },

  batchGetItem: async function batchGetItem(params) {
    await this.awaitCluster();
    return this.BatchGetItem(params);
  },

  BatchWriteItem: function batchWriteItem(params) {
    return this._makeWriteRequestWithRetries('batchWriteItem', params, (client, newParams) => {
      return client.batchWriteItem(newParams);
    });
  },

  batchWriteItem: async function batchWriteItem(params) {
    await this.awaitCluster();
    return this.BatchWriteItem(params);
  },

  DeleteItem: function deleteItem(params) {
    return this._makeWriteRequestWithRetries('deleteItem', params, (client, newParams) => {
      return client.deleteItem(newParams);
    });
  },

  deleteItem: async function deleteItem(params) {
    await this.awaitCluster();
    return this.DeleteItem(params);
  },

  GetItem: function getItem(params) {
    return this._makeReadRequestWithRetries('getItem', params, (client, newParams) => {
      return client.getItem(newParams);
    });
  },

  getItem: async function getItem(params) {
    await this.awaitCluster();
    return this.GetItem(params);
  },

  PutItem: function putItem(params) {
    return this._makeWriteRequestWithRetries('putItem', params, (client, newParams) => {
      return client.putItem(newParams);
    });
  },

  putItem: async function putItem(params) {
    await this.awaitCluster();
    return this.PutItem(params);
  },

  Query: function query(params) {
    return this._makeReadRequestWithRetries('query', params, (client, newParams) => {
      return client.query(newParams);
    });
  },

  query: async function query(params) {
    await this.awaitCluster();
    return this.query(params);
  },

  Scan: function scan(params) {
    return this._makeReadRequestWithRetries('scan', params, (client, newParams) => {
      return client.scan(newParams);
    });
  },

  scan: async function scan(params) {
    await this.awaitCluster();
    return this.Scan(params);
  },

  TransactGetItems: function transactGetItems(params) {
    return this._makeReadRequestWithRetries('transactGetItems', params, (client, newParams) => {
      return client.transactGetItems(newParams);
    });
  },

  transactGetItems: async function transactGetItems(params) {
    await this.awaitCluster();
    return this.TransactGetItems(params);
  },

  UpdateItem: function updateItem(params) {
    return this._makeWriteRequestWithRetries('updateItem', params, (client, newParams) => {
      return client.updateItem(newParams);
    });
  },

  updateItem: async function updateItem(params) {
    await this.awaitCluster();
    return this.UpdateItem(params);
  },

  // vv Unsupported DDB methods vv

  createTable: function createTable(params, callback) {
    throw new DaxClientError('createTable is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  deleteTable: function deleteTable(params, callback) {
    throw new DaxClientError('deleteTable is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  describeLimits: function describeLimits(params, callback) {
    throw new DaxClientError('describeLimits is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  describeTable: function describeTable(params, callback) {
    throw new DaxClientError('describeTable is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  describeTimeToLive: function describeTimeToLive(params, callback) {
    throw new DaxClientError('describeTimeToLive is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  listTables: function listTables(params, callback) {
    throw new DaxClientError('listTables is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  listTagsOfResources: function listTagsOfResources(params, callback) {
    throw new DaxClientError('listTagsOfResources is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  tagResource: function tagResource(params, callback) {
    throw new DaxClientError('tagResource is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  TransactWriteItems: function transactWriteItems(params) {
    return this._makeWriteRequestWithRetries('transactWriteItems', params, (client, newParams) => {
      return client.transactWriteItems(newParams);
    });
  },

  transactWriteItems: async function transactWriteItems(params) {
    await this.awaitCluster();
    return this.TransactWriteItems(params);
  },

  untagResource: function untagResource(params, callback) {
    throw new DaxClientError('untagResource is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  updateTable: function updateTable(params, callback) {
    throw new DaxClientError('updateTable is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  updateTimeToLive: function updateTimeToLive(params, callback) {
    throw new DaxClientError('updateTimeToLive is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  waitFor: function waitFor(state, params, callback) {
    throw new DaxClientError('waitFor is not support for DAX. Use AWS.DynamoDB instead.', DaxErrorCode.Validation, false);
  },

  // js version of https://github.com/smithy-lang/smithy-typescript/blob/main/packages/smithy-client/src/client.ts
  // utilized when the DAX client is typed to a DynamoDB type
  // under the hood this will eventually call the requestHandler specified in the constructor
  send: function (command, optionsOrCb, cb) {
    var options = typeof optionsOrCb !== "function" ? optionsOrCb : undefined;
    var callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
    var cmd = command.clientCommand ? command.clientCommand : command;
    var oldResolveMiddlewareWithContext = command.resolveMiddlewareWithContext;
    cmd.resolveMiddlewareWithContext = function (_1, _2, _3, _4) {
      cmd.resolveMiddlewareWithContext = oldResolveMiddlewareWithContext;
      const oldMiddlewareFn = _4.middlewareFn;
      _4.middlewareFn = function (_5, _6, _7, _8) {
        const middlewares = oldMiddlewareFn.bind(this)(_5, _6, _7, _8);
        return [{
          applyToStack: (commandStack) => {
            for (const mw of middlewares) {
              commandStack.use(mw);
            }
            commandStack.removeByTag("DESERIALIZER");
            commandStack.add((next, _context) => async (args) => {
              const result = await next(args);
              return result;
            }, { step: "deserialize", name: "deserializerMiddleware" });
          }
        }];
      }
      return cmd.resolveMiddlewareWithContext(_1, _2, _3, _4);
    }
    var handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
    if (callback) {
      handler(command).then(function (result) {
        return callback(null, result.output);
      }, function (err) { return callback(err); })
        .catch(function () { });
    } else {
      return handler(command).then(function (result) { return result.output });
    }
  },

  awaitCluster: async function () {
    if (!this._ready) {
      await this._clusterReady;
      this._ready = true;
    }
  },

  /**
   * @api private
   */
  _makeReadRequestWithRetries: function _makeReadRequestWithRetries(opname, params, operation) {
    let request = new DaxRequest(this, opname, params,
      (newParams) => this._readOperationsRetryHandler.makeRequestWithRetries(
        operation, newParams, this._readClientFactory, this._readRetries)
    );

    return request.promise();
  },

  /**
   * @api private
   */
  _makeWriteRequestWithRetries: function _makeWriteRequestWithRetries(opname, params, operation) {
    let request = new DaxRequest(this, opname, params,
      (newParams) => this._writeOperationsRetryHandler.makeRequestWithRetries(
        operation, newParams, this._writeClientFactory, this._writeRetries)
    );

    return request.promise();
  },
});

// Exists only to work with DocumentClient
const AmazonDaxClient = inherit(_AmazonDaxClient, {});

class RetryHandler {
  constructor(cluster, retryDelay, retries) {
    this._cluster = cluster;
    this._maxRetryDelay = retryDelay;
    this._maxRetries = retries;
  }

  makeRequestWithRetries(operation, params, clientFactory, retries, prevClient) {
    let newClient;
    return new Promise((resolve, reject) => {
      newClient = clientFactory.getClient(prevClient);
      return resolve(newClient);
    }).then((newClient) => {
      return operation(newClient, params);
    }).catch((err) => {
      if (this._cluster.startupComplete() === false && err.code === DaxErrorCode.NoRoute) {
        retries++;
      }

      if (retries <= 0) {
        return Promise.reject(this.check(err));
      }

      if (!this.isRetryable(err)) {
        return Promise.reject(this.check(err));
      }

      let maybeWait;

      if (err.code === DaxErrorCode.NoRoute) {
        maybeWait = this.waitForRoutesRebuilt();
      } else {
        maybeWait = this.isWaitForClusterRecoveryBeforeRetrying(err) ?
          this._cluster.waitForRecovery(this._cluster._leaderSessionId, this._maxRetryDelay) :
          Promise.resolve();
      }

      const retryHandler = () => {
        return this._exponentialBackOff(err, this._maxRetries - retries).then(() => {
          return this.makeRequestWithRetries(operation, params, clientFactory, retries - 1, newClient);
        });
      };
      return maybeWait.then(
        retryHandler, retryHandler // this is handler for wait fail
      );
    });
  }

  _exponentialBackOff(err, n) {
    if (!ERROR_CODES_THROTTLING.includes(err.code)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, this._jitter(70 << n));
    });
  }

  _jitter(interval) { // jitter between 50% and 100% of interval
    return interval * (0.5 + Math.random() * 0.5);
  }

  waitForRoutesRebuilt() {
    return this._cluster.waitForRoutesRebuilt(false);
  }

  check(err) {
    if (!err) {
      err = new Error('No cluster endpoints available');
    }

    return err;
  }

  isWaitForClusterRecoveryBeforeRetrying(err) {
    // normal system error won't have this property and will return false, which means no need to wait
    return err.waitForRecoveryBeforeRetrying;
  }

  isRetryable(err) {
    // only some Dax/DDB error is not retryable, will be init when creating
    // only explicitly indicate that retryable is false otherwise retryable
    // all non-DaxClientErrors are non-retryable
    return err instanceof DaxClientError ? err.retryable !== false : false;
  }
}

class WriteOperationsRetryHandler extends RetryHandler {
  constructor(cluster, retryDelay, retries) {
    super(cluster, retryDelay, retries);
  }

  isRetryable(err) {
    if (this._isWriteFailureAmbiguous(err)) {
      return false;
    }

    return super.isRetryable(err);
  }

  /**
   * Returns true when with the given information it can't be determined if the written values is
   * persisted to the data store or not. Returns false if given exception type means that data
   * is not persisted to data store.
   * @param {Error} err
   * @return {boolean}
   */
  _isWriteFailureAmbiguous(err) {
    if (err.code === DaxErrorCode.Decoder
      || err.code === DaxErrorCode.MalformedResult
      || err.code === DaxErrorCode.EndOfStream
      || err.code === 'EPIPE') {
      return true;
    }

    if (err.codeSeq && this._listContain(err.codeSeq, ERROR_CODES_WRITE_FAILURE_AMBIGUOUS)) {
      return true;
    }

    if (err instanceof ReferenceError || err instanceof TypeError) {
      return true;
    }

    return false;
  }

  _listContain(targetList, lists) {
    checkList: for (let list of lists) {
      if (list.length !== targetList.length) {
        continue;
      }
      for (let i = 0; i < list.length; ++i) {
        if (list[i] !== '*' && list[i] !== targetList[i]) {
          continue checkList;
        }
      }
      return true;
    }
    return false;
  }

  check(err) {
    if (this._isWriteFailureAmbiguous(err)) {
      let newError = new Error('Write operation failed without negative acknowledgement ');
      // err.stack = newError.stack + '\n' + err.stack;
      err.message = newError.message + '\n' + err.message;
      return err;
    }
    return super.check(err);
  }
}

class DaxRequest extends EventEmitter {
  constructor(service, opname, params, op) {
    super();

    this.service = service;
    this.operation = opname;
    this.params = params;
    this.response = {};
    // https://github.com/aws/aws-sdk-js/blob/880e811e857c34e4ad983c37837767cd5eddb98f/lib/util.js#L288
    this.startTime = new Date();

    this._op = op;
    this._fired = false;

    // add a no-op listeners so that validate is an array
    // only needed for DocumentClient
    this.addListener('validate', () => { });
    this.addListener('validate', () => { });
  }

  abort() {
    // no-op, can't abort DAX calls
    return this;
  }

  createReadStream() {
    throw new DaxClientError('createReadStream is not supported in DAX.', DaxErrorCode.Validation, false);
  }

  promise() {
    if (this._fired) {
      // Request object can only be used once
      throw new DaxClientError('Request object already used.', DaxErrorCode.Validation, false);
    }

    this._fired = true;
    let self = this;

    this.emit('validate', this);
    // skip 'build' and 'sign' as they are not meaningful for DAX

    let resultP = this._op(this.params).then((data) => {
      self.response.data = data;
      self.emit('extractData', self.response);

      self.emit('success', self.response);
    }).catch((err) => {
      self.response.error = err;
      self.emit('extractError', self.response);
      self.emit('error', self.response.error, self.response);
    }).then(() => {
      self.emit('complete', self.response);
      return self.response.data;
    });

    return resultP;
  }
}

module.exports = AmazonDaxClient;
