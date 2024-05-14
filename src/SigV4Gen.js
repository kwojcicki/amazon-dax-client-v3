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
const crypto = require('crypto');

/** Class representing a Signature Generation type. */
class SigV4Gen {
  /**
   * Generate signature
   * @param {AWSCredentials} creds
   * @param {String} endpoint
   * @param {String} region
   * @param {String} payload
   * @param {Date} time
   * @return {SigAndStringToSign}
   */
  static generateSigAndStringToSign(creds, endpoint, region, payload, time) {
    if(time === undefined || !(time instanceof Date)) {
      time = new Date();
    }
    const headers = SigV4Gen._getHeaders(endpoint, time, creds);

    return SigV4Gen._getAuthorizationHeader('POST', time, headers,
      payload, creds, region);
  }

  /**
   * Get authorization header
   * @param {String} requestType
   * @param {Date} now
   * @param {Map<String, String>} headers
   * @param {String} payload
   * @param {AWSCredentials} awsCredentials
   * @param {String} region
   * @return {SigAndStringToSign}
   */
  static _getAuthorizationHeader(requestType, now, headers, payload,
    awsCredentials, region) {
    const credentialScope = customizedtoISOString(now, true) +
      '/' + region + '/dax/aws4_request';

    const canonicalRequest = requestType + '\n/\n' /* URI */ + '\n' +
      SigV4Gen._getCanonicalHeaders(headers) + '\n' +
      SigV4Gen._getSignedHeaders() + '\n' + SigV4Gen._SHA256(payload);
    const stringToSign = 'AWS4-HMAC-SHA256\n' +
      customizedtoISOString(now, false) + '\n' + credentialScope +
      '\n' + SigV4Gen._SHA256(canonicalRequest);

    const signingKey = SigV4Gen._getSignatureKey(
      awsCredentials.secretAccessKey, customizedtoISOString(now, true),
      region, 'dax');
    let signature = SigV4Gen._HmacSHA256(stringToSign, signingKey)
      .toString('hex');

    let sessionToken = awsCredentials.sessionToken !== undefined
      ? awsCredentials.sessionToken : null;

    return {signature: signature,
      stringToSign: stringToSign,
      sessionToken: sessionToken};
  }

  static _getCanonicalHeaders(headers) {
    let stringBuilder = '';
    for(let h of SigV4Gen._SIGNED_HEADERS) {
      stringBuilder += (h + ':' + headers.get(h) + '\n');
    }
    return stringBuilder;
  }

  static _getSignedHeaders() {
    return SigV4Gen._SIGNED_HEADERS.join(';');
  }

  static _SHA256(data) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(data);
      return hash.digest('hex');
    } catch(e) {
      throw new DaxClientError('Failed to compute SHA-256. ' +
        e.name + ': ' + e.message, DaxErrorCode.Unrecognized);
    }
  }

  static _HmacSHA256(data, key) {
    const algorithm = SigV4Gen._HMAC_SHA256;
    const hmac = crypto.createHmac(algorithm, key);
    hmac.update(data);
    return hmac.digest();
  }

  static _getSignatureKey(key, dateStamp, regionName, serviceName) {
    try {
      let kSecret = 'AWS4' + key;
      let kDate = SigV4Gen._HmacSHA256(dateStamp, kSecret);
      let kRegion = SigV4Gen._HmacSHA256(regionName, kDate);
      let kService = SigV4Gen._HmacSHA256(serviceName, kRegion);
      let kSigning = SigV4Gen._HmacSHA256('aws4_request', kService);
      return kSigning;
    } catch(e) {
      throw e;
    }
  }

  static _getHeaders(hostname, now, awsCredentials) {
    const headers = new Map();
    if(hostname.startsWith('https://')) {
      hostname = hostname.substring(8);
    }
    headers.set(SigV4Gen._HEADER_NAME_HOST, hostname);
    headers.set(SigV4Gen._HEADER_NAME_DATE, customizedtoISOString(now, false));
    if(awsCredentials.sessionToken !== undefined) {
      headers.set(SigV4Gen._HEADER_NAME_SECURITY_TOKEN,
        awsCredentials.sessionToken);
    }
    return headers;
  }
}

SigV4Gen._HMAC_SHA256 = 'sha256';

SigV4Gen._HEADER_NAME_DATE = 'x-amz-date';
SigV4Gen._HEADER_NAME_SECURITY_TOKEN = 'x-amz-security-token';
SigV4Gen._HEADER_NAME_HOST = 'host';
// NOTE: should be in lexicographic order
SigV4Gen._SIGNED_HEADERS = [SigV4Gen._HEADER_NAME_HOST,
  SigV4Gen._HEADER_NAME_DATE];

function customizedtoISOString(date, dateOnly) {
  function pad(number) {
    if(number < 10) {
      return '0' + number;
    }
    return number;
  }

  return date.getUTCFullYear() +
    '' + pad(date.getUTCMonth() + 1) +
    '' + pad(date.getUTCDate()) + (dateOnly ? '' :
    'T' + pad(date.getUTCHours()) +
    '' + pad(date.getUTCMinutes()) +
    '' + pad(date.getUTCSeconds()) +
    'Z');
}

module.exports = SigV4Gen;
