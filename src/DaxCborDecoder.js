/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

const CborDecoder = require('./CborDecoder');
const DaxCborTypes = require('./DaxCborTypes');

class DaxCborDecoder extends CborDecoder {
  constructor(buffer, start, end) {
    super(buffer, start, end, {});

    this.tagHandlers[DaxCborTypes.TAG_DDB_STRING_SET] = (tag) => this._decodeStringSet(tag);
    this.tagHandlers[DaxCborTypes.TAG_DDB_NUMBER_SET] = (tag) => this._decodeNumberSet(tag);
    this.tagHandlers[DaxCborTypes.TAG_DDB_BINARY_SET] = (tag) => this._decodeBinarySet(tag);
  }

  _decodeStringSet(tag) {
    return new DaxCborTypes._DdbSet('SS', this.buildArray(() => this.decodeString()));
  }

  _decodeNumberSet(tag) {
    return new DaxCborTypes._DdbSet('NS', this.buildArray(() => this.decodeNumber().toString()));
  }

  _decodeBinarySet(tag) {
    return new DaxCborTypes._DdbSet('BS', this.buildArray(() => this.decodeBytes()));
  }
}

module.exports = DaxCborDecoder;

