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
import { CborSExprGenerator } from './CborSExprGenerator';
import { DaxClientError } from './DaxClientError';
import { DaxErrorCode } from './DaxErrorCode';

const MAX_EXPRESSION_SIZE = 4096;
const MAX_PARAMETER_MAP_KEY_SIZE = 255;
const MAX_PARAMETER_MAP_ENTRIES = 2097152;
const MAX_ATTRIBUTENAME_SIZE = 65535;

export class RequestValidator {
  static validateTableName(tableName, key) {
    if (!tableName) {
      throw RequestValidator.newValidationException(
        // @ts-ignore
        'Value null at \'', key, '\' failed to satisfy constraint: Member must not be null');
    }
  }

  static validateKey(item, keys) {
    // Check that item is not null
    if (!item) {
      throw RequestValidator.newValidationException('Value null at \'item\' failed to satisfy constraint: Member must not be null');
    }

    // Validating: item attributes must be on key attributes only, and on all key attributes
    if (Object.keys(item).length !== keys.length) {
      throw RequestValidator.newValidationException('The number of conditions on the keys is invalid');
    }
  }

  static validateTransactItem(item, key) {
    if (!item) {
      // @ts-ignore
      throw RequestValidator.newValidationException('1 validation error detected: Value ', item,
        ' at \'', key, '\' failed to satisfy constraint: Member must not be null');
    }

    RequestValidator.validateItem(item);
  }

  static validateItem(item) {
    Object.keys(item).forEach((key) => {
      if (!key) {
        if (!item[key]) {
          // For some reason DDB SDK accept (null: null) but deny (null: av). (null: null) doesn't represent anything in actual item.
          // @ts-ignore
          throw newValidationException(
            'Unable to marshall request to JSON: Unable to marshall request to JSON: Unable to marshall request to JSON: Unable to marshall request to JSON');
        } else {
          delete item[key];
        }
      }
      RequestValidator.validateAttributeValue(item[key]);
    });
  }

  static validateExprAttrNames(attrNames) {
    let attrNameMapSize = 0;

    if (Object.keys(attrNames).length === 0) {
      throw RequestValidator.newValidationException('ExpressionAttributeNames must not be empty');
    } else if (Object.keys(attrNames).length >= MAX_PARAMETER_MAP_ENTRIES) {
      throw RequestValidator.newValidationException('ExpressionAttributeNames exceeds max size');
    } else {
      Object.keys(attrNames).forEach((k) => {
        let v = attrNames[k];
        if (k == null) {
          // @ts-ignore
          throw new AmazonClientException('ExpressionAttributeNames contains invalid key: null');
        }
        attrNameMapSize += k.length;
        if (v == null) {
          attrNameMapSize += 0;
        } else if (v.length === 0) {
          throw RequestValidator.newValidationException('ExpressionAttributeNames contains invalid value: for key ' + k);
        } else if (v.length > MAX_ATTRIBUTENAME_SIZE) {
          throw RequestValidator.newValidationException('Member must have length less than or equal to ' + MAX_ATTRIBUTENAME_SIZE +
            ', Member must have length greater than or equal to 0');
        } else {
          attrNameMapSize += v.length;
        }
        if (k.length === 0) {
          throw RequestValidator.newValidationException('ExpressionAttributeNames contains invalid key: The expression attribute map contains an empty key');
        } else if (k[0] != CborSExprGenerator.ATTRIBUTE_NAME_PREFIX) {
          // @ts-ignore
          throw RequestValidator.newValidationException('Syntax error, ExpressionAttributeNames contains invalid key: "', k, '"');
        } else if (k.length > MAX_PARAMETER_MAP_KEY_SIZE) {
          throw RequestValidator.newValidationException(
            'ExpressionAttributeNames contains invalid key: The expression attribute map contains a key that is too long');
        } else if (!v) {
          throw RequestValidator.newValidationException('ExpressionAttributeNames must not be empty');
        }
      });
    }
    return attrNameMapSize;
  }

  static validateExprAttrValues(attrVals) {
    let attrValuesMapSize = 0;
    if (Object.keys(attrVals).length === 0) {
      throw RequestValidator.newValidationException('ExpressionAttributeValues must not be empty');
    } else if (Object.keys(attrVals).length >= MAX_PARAMETER_MAP_ENTRIES) {
      throw RequestValidator.newValidationException('ExpressionAttributeValues exceeds max size');
    } else {
      Object.keys(attrVals).forEach((k) => {
        if (k == null) {
          // @ts-ignore
          throw new AmazonClientException('ExpressionAttributeValues contains invalid key: null');
        }
        let v = attrVals[k];
        attrValuesMapSize += k.length;
        attrValuesMapSize += RequestValidator.simpleAttrValLength(v);
        if (k.length === 0) {
          throw RequestValidator.newValidationException('ExpressionAttributeValues contains invalid key: The expression attribute map contains an empty key');
        } else if (!k.startsWith(CborSExprGenerator.ATTRIBUTE_VALUE_PREFIX)) {
          throw RequestValidator.newValidationException('Syntax error, ExpressionAttributeValues contains invalid key: "' + k + '"');
        } else if (k.length > MAX_PARAMETER_MAP_KEY_SIZE) {
          throw RequestValidator.newValidationException(
            'ExpressionAttributeValues contains invalid key: The expression attribute map contains a key that is too long');
        }

        RequestValidator.validateAttributeValue(v);
      });
    }
    return attrValuesMapSize;
  }

  static simpleAttrValLength(v) {
    if (v == null) {
      return 0;
    }
    if (v.S) {
      return v.S.length;
    }
    if (v.B) {
      return v.B.length;
    }
    if (v.N) {
      return v.N.length;
    }
    if (v.BS) {
      let size = 0;
      for (let b of v.BS) {
        size += b.length;
      }
      return size;
    }
    // Only the primitive types are expected
    return 0;
  }

  static validateAttributeValue(attr) {
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-attributes
    if (attr === null) {
      return;
    }

    if (attr.SS) {
      if (attr.SS.length == 0) {
        throw RequestValidator.newValidationException('One or more parameter values were invalid: An string set  may not be empty');
      }
      for (let s of attr.SS) {
        if (s == null) {
          throw RequestValidator.newValidationException('One or more parameter values were invalid: An string set may not have a null string as a member');
        }
      }
    } else if (attr.BS) {
      if (attr.BS.length == 0) {
        throw RequestValidator.newValidationException('One or more parameter values were invalid: Binary sets should not be empty');
      }
    } else if (attr.NS) {
      if (attr.NS.length == 0) {
        throw RequestValidator.newValidationException('One or more parameter values were invalid: An number set  may not be empty');
      }
    } else if (attr.M != null) {
      RequestValidator.validateItem(attr.M);
    } else if (attr.L != null) {
      for (let av of attr.L) {
        RequestValidator.validateAttributeValue(av);
      }
    }
  }

  static validateExpression(condExpr,
    updExpr,
    projExpr,
    filterExpr,
    keyCondExpr,
    condOp,
    expAttrVals,
    attrUpdates,
    attributesToGet,
    queryFilter,
    scanFilter,
    keyCondition,
    attrNames,
    attrVals) {
    let attrNameMapSize = 0;
    if (attrNames) {
      if (!condExpr && !updExpr && !projExpr && !filterExpr && !keyCondExpr) {
        throw RequestValidator.newValidationException('ExpressionAttributeNames can only be specified when using expressions');
      }
      attrNameMapSize = RequestValidator.validateExprAttrNames(attrNames);
      if (attrNameMapSize > MAX_PARAMETER_MAP_ENTRIES) {
        throw RequestValidator.newValidationException('ExpressionAttributeNames exceeds max size');
      }
    }
    let attrValuesMapSize = 0;
    if (attrVals) {
      if (!condExpr && !updExpr && !filterExpr && !keyCondExpr) {
        throw RequestValidator.newValidationException('ExpressionAttributeValues can only be specified when using expressions');
      }

      attrValuesMapSize = RequestValidator.validateExprAttrValues(attrVals);
      if (attrValuesMapSize > MAX_PARAMETER_MAP_ENTRIES) {
        throw RequestValidator.newValidationException('ExpressionAttributeValues exceeds max size');
      }
    }
    if ((attrNameMapSize + attrValuesMapSize) > MAX_PARAMETER_MAP_ENTRIES) {
      throw RequestValidator.newValidationException('Combined size of ExpressionAttributeNames and ExpressionAttributeValues exceeds max size');
    }
    if (expAttrVals != null) {
      Object.keys(expAttrVals).forEach((k) => {
        let v = expAttrVals[k];
        if (v && v.Value && v.AttributeValueList) {
          throw RequestValidator.newValidationException(
            'One or more parameter values were invalid: Value and AttributeValueList cannot be used together for Attribute: ' + k);
        }
      });
    }
    if (condExpr || updExpr) {
      if (attrUpdates || condOp || expAttrVals) {
        throw RequestValidator.newValidationException(
          'Can not use both expression and non-expression parameters in the same request');
      }
      if (condExpr !== null && condExpr !== undefined) {
        if (condExpr.length === 0) {
          throw RequestValidator.newValidationException('Invalid ConditionExpression: The expression can not be empty');
        } else if (condExpr.length > MAX_EXPRESSION_SIZE) {
          throw RequestValidator.newValidationException(
            // @ts-ignore
            'Invalid ConditionExpression: Expression size has exceeded the maximum allowed size (', MAX_EXPRESSION_SIZE, ')');
        }
      }
      if (updExpr !== null && updExpr !== undefined) {
        if (updExpr.length === 0) {
          throw RequestValidator.newValidationException('Invalid UpdateExpression: The expression can not be empty');
        } else if (updExpr.length > MAX_EXPRESSION_SIZE) {
          throw RequestValidator.newValidationException(
            // @ts-ignore
            'Invalid UpdateExpression: Expression size has exceeded the maximum allowed size (', MAX_EXPRESSION_SIZE, ')');
        }
      }
    }

    if (keyCondExpr !== null && keyCondExpr !== undefined) {
      if (keyCondExpr.length === 0) {
        throw RequestValidator.newValidationException('Invalid KeyConditionExpression: The expression can not be empty');
      } else if (keyCondExpr.length > MAX_EXPRESSION_SIZE) {
        throw RequestValidator.newValidationException(
          'Invalid KeyConditionExpression: Expression size has exceeded the maximum allowed size (' + MAX_EXPRESSION_SIZE + ')');
      }
    }

    if (projExpr !== null && projExpr !== undefined) {
      if (projExpr.length === 0) {
        throw RequestValidator.newValidationException('Invalid ProjectionExpression: The expression can not be empty');
      } else if (RequestValidator.expressionLength(projExpr, attrNames) > MAX_EXPRESSION_SIZE) {
        throw RequestValidator.newValidationException(
          'Invalid ProjectionExpression: Expression size has exceeded the maximum allowed size (' + MAX_EXPRESSION_SIZE + ')');
      }
    }

    if (filterExpr !== null && filterExpr !== undefined) {
      if (filterExpr.length) {
        throw RequestValidator.newValidationException('Invalid FilterExpression: The expression can not be empty');
      } else if (filterExpr.length > MAX_EXPRESSION_SIZE) {
        throw RequestValidator.newValidationException(
          'Invalid FilterExpression: Expression size has exceeded the maximum allowed size (' + MAX_EXPRESSION_SIZE + ')');
      }
    }

    if (projExpr || filterExpr || keyCondExpr) {
      let nonExprParams;
      let exprParams;

      // This is required by some of the tests. Probably over-matching but whatever.
      // The order is important; don't re-arrange unless necessary

      if (projExpr) {
        exprParams = RequestValidator.appendParameterName(exprParams, 'ProjectionExpression');
      }

      if (filterExpr) {
        exprParams = RequestValidator.appendParameterName(exprParams, 'FilterExpression');
      }

      if (keyCondExpr) {
        exprParams = RequestValidator.appendParameterName(exprParams, 'KeyConditionExpression');
      }

      if (attributesToGet) {
        nonExprParams = RequestValidator.appendParameterName(nonExprParams, 'AttributesToGet');
      }

      if (scanFilter) {
        nonExprParams = RequestValidator.appendParameterName(nonExprParams, 'ScanFilter');
      }

      if (queryFilter) {
        nonExprParams = RequestValidator.appendParameterName(nonExprParams, 'QueryFilter');
      }

      if (condOp) {
        nonExprParams = RequestValidator.appendParameterName(nonExprParams, 'ConditionalOperator');
      }

      if (keyCondExpr && keyCondition) {
        nonExprParams = RequestValidator.appendParameterName(nonExprParams, 'KeyConditions');
      }

      if (nonExprParams) {
        throw RequestValidator.newValidationException(
          'Can not use both expression and non-expression parameters in the same request: Non-expression parameters: {'
          + nonExprParams + '} Expression parameters: {' + exprParams + '}');
      }
    }

    if (condOp) {
      if (!expAttrVals && !queryFilter && !scanFilter) {
        throw RequestValidator.newValidationException('ConditionalOperator cannot be used without Filter or Expected');
      }

      if ((expAttrVals && Object.keys(expAttrVals).length <= 1) ||
        ((queryFilter != null && Object.keys(queryFilter).length <= 1) || (scanFilter != null && Object.keys(scanFilter).length <= 1))) {
        throw RequestValidator.newValidationException(
          'ConditionalOperator can only be used when Filter or Expected has two or more elements');
      }
    }
  }

  static appendParameterName(params, name) {
    return params ? (params + ', ' + name) : name;
  }

  static expressionLength(expr, subs) {
    if (!expr) {
      return 0;
    }
    if (!subs) {
      return expr.length;
    }
    let length = expr.length;
    Object.keys(subs).forEach((from) => {
      let to = subs[from];
      if (from.length === 0) {
        // this should never happen as 'from' always has prefix '#'.
        // checking the condition to make the code agnostic to other validations.
        return;
      }
      let reduced = expr.replace(new RegExp(from, 'g'), '');
      let times = (expr.length - reduced.length) / from.length;
      length -= times * from.length;
      length += times * (to ? to.length : 0);
      expr = reduced;
    });
    return length;
  }

  static newValidationException(message) { // FIXME match DDB exception.
    return new DaxClientError(message, DaxErrorCode.Validation, false);
  }
};
