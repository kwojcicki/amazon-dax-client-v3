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

const DaxErrorCode = {
  Decoder: 'DecoderException',
  Unrecognized: 'UnrecognizedClientException',
  Authentication: 'MissingAuthenticationTokenException',
  MalformedResult: 'MalformedResultException',
  EndOfStream: 'EndOfStreamException',
  IllegalArgument: 'IllegalArgumentException',
  Validation: 'ValidationException',
  NoRoute: 'NoRouteException',
  ResourceNotFound: 'ResourceNotFoundException',
  ResourceInUse: 'ResourceInUseException',
  ProvisionedThroughputExceeded: 'ProvisionedThroughputExceededException',
  ConditionalCheckFailed: 'ConditionalCheckFailedException',
  InternalServerError: 'InternalServerErrorException',
  ItemCollectionSizeLimitExceeded: 'ItemCollectionSizeLimitExceededException',
  LimitExceeded: 'LimitExceededException',
  RequestLimitExceeded: 'RequestLimitExceeded',
  Throttling: 'ThrottlingException',
  Connection: 'ConnectionException',
};

module.exports = DaxErrorCode;
