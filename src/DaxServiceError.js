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
const DaxErrorCode = require('./DaxErrorCode');
const DaxClientError = require('./DaxClientError');

/*
 * Used for errors coming explicitly from the server
*/
class DaxServiceError extends DaxClientError {
  constructor(message, code, retryable, requestId, statusCode, codeSeq, cancellationReasons) {
    let errorInfo = DaxServiceError._pickError(codeSeq, code, message);
    message = errorInfo[0];
    code = errorInfo[1];

    super(message, code, retryable, requestId, statusCode);

    this._message = message;
    this.retryable = retryable == undefined ? false : retryable;
    this.codeSeq = codeSeq;
    this.cancellationReasons = cancellationReasons;
    this._determineRetryability();
    this._determineWaitForRecoveryBeforeRetrying();
    this._determineTubeValidity();
  }

  static _pickError(codeSeq, code, message) {
    if(codeSeq && codeSeq.length >= 2) {
      switch(codeSeq[1]) {
        case 23:
          if(codeSeq.length > 2) {
            switch(codeSeq[2]) {
              case 24:
                code = DaxErrorCode.ResourceNotFound;
                break;
              case 35:
                code = DaxErrorCode.ResourceInUse;
                break;
            }
          }
          break;
        case 37:
          if(codeSeq.length > 3) {
            switch(codeSeq[3]) {
              case 39:
                if(codeSeq.length > 4) {
                  switch(codeSeq[4]) {
                    case 40:
                      code = DaxErrorCode.ProvisionedThroughputExceeded;
                      break;
                    case 41:
                      code = DaxErrorCode.ResourceNotFound;
                      break;
                    case 43:
                      code = DaxErrorCode.ConditionalCheckFailed;
                      break;
                    case 45:
                      code = DaxErrorCode.ResourceInUse;
                      break;
                    case 46:
                      code = DaxErrorCode.Validation;
                      break;
                    case 47:
                      code = DaxErrorCode.InternalServerError;
                      break;
                    case 48:
                      code = DaxErrorCode.ItemCollectionSizeLimitExceeded;
                      break;
                    case 49:
                      code = DaxErrorCode.LimitExceeded;
                      break;
                    case 50:
                      code = DaxErrorCode.Throttling;
                      break;
                    case 61:
                      code = DaxErrorCode.RequestLimitExceeded;
                      break;
                  }
                }
                break;

              case 44:
                message = 'NotImplementedException';
                code = DaxErrorCode.Validation;
                break;
            }
          }
          break;
      }
    }

    return [message, code];
  }

  _determineRetryability() {
    if(!this.codeSeq || this.codeSeq.length < 2) {
      return;
    }

    if((this.codeSeq[0] !== 4)
    || this.code === DaxErrorCode.Throttling
    || this.statusCode === 503 // Service Unavailable
    || this.statusCode === 500) { // Internal Server Error
      this.retryable = true;
      return;
    }

    switch(this.codeSeq[1]) {
      case 23:
        switch(this.codeSeq[2]) {
          case 31:
            if(this.codeSeq.length > 3) {
              switch(this.codeSeq[3]) {
                case 33:
                  this.retryable = true; // AuthenticationRequiredException
                  break;
              }
            }
            break;
        }
        break;
      case 37:
        if(this.codeSeq.length > 3) {
          switch(this.codeSeq[3]) {
            case 39:
              if(this.codeSeq.length > 4) {
                switch(this.codeSeq[4]) {
                  case 40: // ProvisionedThroughputExceededException
                  case 47: // InternalServerError
                  case 49: // LimitExceededException
                  case 58: // TransactionCanceledException
                  case 61: // RequestLimitExceeded
                    this.retryable = true;
                    break;
                }
              }
          }
        }
        break;
    }
  }

  _determineWaitForRecoveryBeforeRetrying() {
    this.waitForRecoveryBeforeRetrying = (this.codeSeq.length >= 1 && this.codeSeq[0] == 2);
  }

  _determineTubeValidity() {
    if(this.codeSeq.length >= 4
      && this.codeSeq[1] === 23 && this.codeSeq[2] === 31) {
      this._tubeInvalid = true;
    }
  }
}

module.exports = DaxServiceError;
