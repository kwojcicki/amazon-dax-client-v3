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

/*
 * Used for any errors detected in the client side
*/
export class DaxClientError extends Error {
  time: number;
  code: any;
  retryable: any;
  requestId: any;
  statusCode: any;
  _tubeInvalid: boolean;
  waitForRecoveryBeforeRetrying: boolean;
  constructor(message: any, code?: any, retryable?: any, requestId?: any, statusCode?: any) {
    super(message);
    this.time = Date.now();
    this.code = code;
    this.retryable = retryable === undefined ? true : retryable;
    this.requestId = requestId === undefined ? null : requestId;
    this.statusCode = statusCode === undefined ? -1 : statusCode;
    this._tubeInvalid = false;
    this.waitForRecoveryBeforeRetrying = false;

    this.message = DaxClientError._formatMessage(code, message);
  }

  static _formatMessage(code: any, message: any) {
    return !code || message.startsWith(code) ? message : code + ': ' + message;
  }
}
