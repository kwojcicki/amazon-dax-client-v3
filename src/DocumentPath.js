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
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

function mapGetOrDefault(map, key, defaultValue) { // helper function
  return map[key] ? map[key] : defaultValue;
}

class DocumentPath extends Array {
// string represent a Map, number represent a ArrayIndex
  constructor(elements) {
    // super(...elements)
    super();
    elements.forEach((v) => {
      super.push(v);
    });
  }

  static from(path, attrNames) {
    if(!attrNames) {
      attrNames = {};
    }
    const split = path.split('.');
    const elements = [];

    for(let element of split) {
      let index = element.indexOf('[');
      if(index === -1) {
        elements.push(mapGetOrDefault(attrNames, element, element));
        continue;
      }
      if(index === 0) {
        throw new DaxClientError('Invalid path: ' + path, DaxErrorCode.Validation, false);
      }

      let initial = element.substr(0, index);
      elements.push(mapGetOrDefault(attrNames, initial, initial));

      do {
        element = element.substr(index + 1);
        index = element.indexOf(']');

        if(index === -1) {
          throw new DaxClientError('Invalid path: ' + path, DaxErrorCode.Validation, false);
        }

        let arrayIndex = parseInt(element.substr(0, index));
        elements.push(arrayIndex);

        element = element.substr(index + 1);
        index = element.indexOf('[');

        if(index > 0) {
          throw new DaxClientError('Invalid path: ' + path, DaxErrorCode.Validation, false);
        }
      } while(index !== -1);

      if(element) {
        throw new DaxClientError('Invalid path: ' + path, DaxErrorCode.Validation, false);
      }
    }

    return new DocumentPath(elements);
  }
}

module.exports = DocumentPath;
