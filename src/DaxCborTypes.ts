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

class _DdbSet {
  constructor(type, values) {
    this.type = type;
    this.values = values;
  }

  toAV() {
    return {[this.type]: this.values};
  }
}

module.exports = {
  _DdbSet: _DdbSet,
  TAG_DDB_STRING_SET: 3321,
  TAG_DDB_NUMBER_SET: 3322,
  TAG_DDB_BINARY_SET: 3323,
  TAG_DDB_DOCUMENT_PATH_ORDINAL: 3324,
};
