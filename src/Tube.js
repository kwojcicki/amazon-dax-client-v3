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

const CborEncoder = require('./CborEncoder');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');
const SessionVersion = require('./SessionVersion');
const SigV4Gen = require('./SigV4Gen');
const StreamBuffer = require('./ByteStreamBuffer');
const ControllablePromise = require('./ControllablePromise');
const {ENCRYPTED_SCHEME} = require('./Util');
const net = require('net');
const tls = require('tls');

const MAGIC_STRING = 'J7yne5G';
const USER_AGENT_STRING = 'UserAgent';
const USER_AGENT = 'DaxJSClient-' + require('../package.json').version;
const WINDOW_SCALAR = 0.1;
const DAX_ADDR = 'https://dax.amazonaws.com';
const BUFFER_ZERO = Buffer.from([0]);
const DEFAULT_FLUSH_SIZE = 4096;

const MAX_PENDING_CONNECTION = 10; // same number as JAVA client

class TimeoutError extends DaxClientError {
  constructor(timeout) {
    super('Connection timeout after ' + timeout + 'ms', DaxErrorCode.Connection);
  }
}

exports.USER_AGENT = USER_AGENT;

class ClientTube {
  constructor(socket, version, credProvider, region) {
    this.cbor = new CborEncoder();
    if(!ClientTube.ENCODED_INIT_PREFIX) {
      // lazily initialize ClientTube cbor encoder/context.
      ClientTube.makeCborContext(this.cbor);
    }

    socket.setKeepAlive(true);
    socket.setNoDelay(true);
    this.socket = socket;
    this._authExp = 0;
    this._nextTube = null;
    this._authTTLMillis = 5 * 60 * 1000;
    this._poolWindow = (this._authTTLMillis / 2);
    this._tubeWindow = (this._authTTLMillis * WINDOW_SCALAR);
    this._region = region;
    this._credProvider = credProvider;
    this._sessionVersion = version;
    this.requestBuffer = new StreamBuffer();
    this.responseBuffer = new StreamBuffer();
    this._init(version.session);

    this._closed = false;
    this.socket.on('close', (had_error) => {
      // If the server closes the socket for some reason, mark the tube as closed
      this._closed = true;
    });
  }

  static makeCborContext(cbor) {
    // construct reusable cbor context.
    cbor = new CborEncoder();
    cbor._writeString(MAGIC_STRING);
    cbor._write(BUFFER_ZERO);
    ClientTube.ENCODED_INIT_PREFIX = cbor.read();
    cbor._writeMapHeader(1);
    cbor._writeString(USER_AGENT_STRING);
    cbor._writeString(USER_AGENT);
    cbor._write(BUFFER_ZERO);
    ClientTube.ENCODED_INIT_SUFFIX = cbor.read();
    cbor._writeInt(1);
    cbor._writeInt(1489122155);
    ClientTube.ENCODED_AUTH_PREFIX = cbor.read();
    ClientTube.ENCODED_USER_AGENT = (USER_AGENT ? cbor.encodeString(USER_AGENT) : cbor.encodeNull());
  }

  _init(session) {
    this.write(ClientTube.ENCODED_INIT_PREFIX);

    if(!session) {
      this.write(this.cbor.encodeNull());
    } else {
      this.write(this.cbor.encodeBinary(session));
    }

    this.write(ClientTube.ENCODED_INIT_SUFFIX);
    this.flush();
  }

  close() {
    this._closed = true;
    this.socket.end();
    this._cleanupListeners();
  }

  _cleanupListeners() {
    // don't use removeAllListeners() to remove all listeners since there
    // are some default system listeners that deal with socket end/close event.
    if(this.socket) {
      this.socket.removeAllListeners('timeout');
      this.socket.removeAllListeners('data');
      this.socket.removeAllListeners('error');
    }
  }

  write(data) {
    this.requestBuffer.write(data);
    if(this.requestBuffer.length >= DEFAULT_FLUSH_SIZE) {
      this.socket.write(this.requestBuffer.read());
    }
  }

  flush(data) {
    if(this.requestBuffer.length > 0) {
      this.socket.write(this.requestBuffer.read());
    }
  }

  reauth() {
    let currTime = Date.now();
    if(this._authExp - currTime <= this._tubeWindow
        || currTime - this._lastPoolAuth >= this._poolWindow) {
      return this._credProvider.resolvePromise().then((creds) => {
        this._checkAndUpdateAccessKeyId(creds.accessKeyId);
        this._lastPoolAuth = currTime;
        this._authExp = currTime + this._authTTLMillis;

        this._authHandler(creds);

        // return the containing tube for further use
        return this;
      });
    } else {
      return Promise.resolve(this);
    }
  }

  invalidateAuth() {
    this._authExp = 0;
  }

  setTimeout(timeout, callback) {
    if(this.socket) {
      this.socket.setTimeout(timeout, callback);
    }
  }

  _authHandler(creds) {
    // Make sure the same credentials are used to sign and authorize.
    let sigHead = SigV4Gen.generateSigAndStringToSign(creds, DAX_ADDR, this._region, '');

    this.write(ClientTube.ENCODED_AUTH_PREFIX);
    this.write(this.cbor.encodeString(creds.accessKeyId));

    this.write(this.cbor.encodeString(sigHead.signature));

    this.write(this.cbor.encodeBinary(Buffer.from(sigHead.stringToSign)));

    this.write(sigHead.sessionToken === null ? this.cbor.encodeNull() : this.cbor.encodeString(sigHead.sessionToken));

    this.write(ClientTube.ENCODED_USER_AGENT);
  }

  _checkAndUpdateAccessKeyId(other) {
    if(!other) {
      throw new DaxClientError('AWSCredentialsProvider provided null AWSAccessKeyId', DaxErrorCode.Authentication, false);
    }
    let equality = (other === this._accessKeyId);
    if(!equality) {
      this._accessKeyId = other;
    }
    return equality;
  }
}

class Connector {
  constructor(isEncrypted, host, port, skipHostnameVerification, endpointHost) {
    let checkServerIdentity;
    if(isEncrypted) {
      checkServerIdentity = skipHostnameVerification ? () => undefined :
        (_, cert) => tls.checkServerIdentity(endpointHost, cert);
    } else if(skipHostnameVerification) {
      console.warn('Skipping hostname verification for unencrypted clusters will have no effect.');
    }
    this._connectOps = {
      host: host,
      port: port,
      checkServerIdentity: checkServerIdentity,
    };
    this._protocol = isEncrypted ? tls : net;
  }

  connect(callback) {
    return this._protocol.connect(this._connectOps, callback);
  }
}

class SocketTubePool {
  constructor(hostname, port, credProvider, region, idleTimeout, connectTimeout, tube, seeds, skipHostnameVerification) {
    this._hostname = hostname;
    this._port = port;
    this._headTube = null;

    this._region = region;
    this._credProvider = credProvider;
    this._sessionVersion = SessionVersion.create();

    this._pendingConnection = 0;
    this._pendingJob = [];

    this._idleTimeout = idleTimeout || 5000;
    this._connectTimeout = connectTimeout || 10000;

    /**
     * For client to cluster encryption, the client will only support one encrypted URL.
     * The scheme must be the same for all endpoints.
     * Endpoint host is needed for hostname verification of encrypted clusters.
     */
    const containsSeed = seeds != null && seeds.length > 0; // This exists because many unit tests don't enumerate seeds.
    const endpointScheme = containsSeed ? seeds[0].scheme : null;
    this._isEncrypted = endpointScheme == ENCRYPTED_SCHEME;
    this._endpointHost = containsSeed ? seeds[0].host : null;
    this._skipHostnameVerification = skipHostnameVerification;
    this._connector = new Connector(this._isEncrypted, this._hostname, this._port, this._skipHostnameVerification, this._endpointHost);

    this.recycle(tube);
  }

  alloc() {
    let tube = this._headTube;
    if(tube) {
      // open tube is available, so use it
      this._headTube = tube._nextTube;
      tube._nextTube = null;
      if(tube.socket) {
        // remove the idle handler
        tube.socket.removeAllListeners('timeout');

        // ref socket before return to caller.
        tube.socket.ref();
        tube._inPool = false;
      }

      return Promise.resolve(tube);
    } else {
      // no open available tubes, so try to create one
      let wait = new ControllablePromise(this._connectTimeout, new TimeoutError(this._connectTimeout));
      this._pendingJob.push(wait);
      this._alloc(wait);
      return wait;
    }
  }

  _alloc(wait) {
    // separate this out since we can better unit test with mocking this func out.
    if(this._pendingConnection >= MAX_PENDING_CONNECTION) {
      return null;
    }
    this._pendingConnection++;
    const socket = this._connector.connect(() => this.socketCallback(socket)).on('error', (e) => this.socketError(wait, e));
  }

  socketCallback(socket) {
    let newTube = new ClientTube(socket, this._sessionVersion, this._credProvider, this._region);
    this.recycle(newTube);
    this._pendingConnection--;
  }

  socketError(wait, error) {
    if(wait && !wait.isDone()) {
      wait.reject(new DaxClientError(error.message, DaxErrorCode.Connection));
    }
    this._pendingConnection--;
  }

  recycle(tube) {
    if(!tube || tube._inPool || tube._closed) {
      return;
    }

    if(tube._sessionVersion === this._sessionVersion) {
      // remove all socket listeners to avoid leaks
      tube._cleanupListeners();

      // first check whether we can assign tube to someone still waiting for it.
      while(this._pendingJob.length > 0) {
        let job = this._pendingJob.shift();
        if(job.isDone()) {
          continue;
        } else {
          job.resolve(tube);
          return;
        }
      }

      // no valid candidate, recycle to pool.
      // unref the socket recycled back to avoid hanging event loop.
      tube.socket.unref();
      tube._inPool = true;
      // set the idle timeout to remove it if unused
      tube.setTimeout(this._idleTimeout, () => {
        this._removeIdleTube(tube);
      });

      tube._nextTube = this._headTube;
      this._headTube = tube;
    } else {
      tube.close();
    }
  }

  // when calling reset, it's most likely that all tubes are affected, so we
  // preemptively close every tube instead of waiting for each tube to get an
  // exception and closed.
  reset(tube) {
    if(!tube) {
      return;
    }
    tube.close();
    if(tube._sessionVersion !== this._sessionVersion) {
      return;
    }
    this._signalAll(false);
    this._versionBump();
    tube = this._headTube;
    this._headTube = null;
    this._closeAll(tube);
  }

  // Signal pending connect jobs. 'reject' value will indicate whether to
  // reject directly or allow retry when still within connect timeout.
  _signalAll(reject) {
    for(let job of this._pendingJob) {
      if(!job.isDone()) {
        if(reject) {
          job.reject(new DaxClientError('pool is reset or closed', DaxErrorCode.Connection, true));
        } else {
          // We should give it another connect try instead of fail this
          // request as long as it's within connect timeout which is
          // configurable.
          this._alloc();
        }
      }
    }
    // Don't need to clean pending job list here since frequent array slice
    // is not efficient. If it will be used again, it will be shifted when
    // recycle method try to find a candidate. Otherwise, it will be
    // garbage collected.
  }

  close() {
    this._signalAll(true);
    this._versionBump();
    let tube = this._headTube;
    this._headTube = null;
    this._closeAll(tube);
  }

  _closeAll(tube) {
    let reapCount = 0;
    let next;
    while(tube) {
      reapCount++;
      tube.close();
      next = tube._nextTube;
      tube._nextTube = null;
      tube = next;
    }
    return reapCount;
  }

  _versionBump() {
    this._sessionVersion = SessionVersion.create();
  }

  _removeIdleTube(tube) {
    if(!tube || !tube._inPool) {
      return;
    }

    if(this._headTube === tube) {
      if(this._headTube._nextTube) {
        // if the head tube is idle and there's another tube available, remove the head tube
        this._headTube.close();
        this._headTube = this._headTube._nextTube;
      } else {
        // if there is no other tube, then leave it intact
        return;
      }
    } else {
      // find the idle tube in the list
      let prevTube = this._headTube;
      let curTube = this._headTube._nextTube;
      while(curTube) {
        if(curTube === tube) {
          // remove this tube from the list, let GC take care of it
          // prevTube cannot be null
          curTube.close();
          prevTube._nextTube = curTube._nextTube;
          curTube._nextTube = null;
          return;
        } else {
          prevTube = curTube;
          curTube = curTube._nextTube;
        }
      }
    }

    // if we get here the tube was not found, but ignore it
  }
}

module.exports = {
  ClientTube: ClientTube,
  SocketTubePool: SocketTubePool,
  TimeoutError: TimeoutError,
  Connector: Connector,
};
