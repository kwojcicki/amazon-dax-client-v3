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

const DaxMethodIds = require('./Constants').DaxMethodIds;
const DaxDataRequestParam = require('./Constants').DaxDataRequestParam;
const BigDecimal = require('./BigDecimal');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');
const Util = require('./Util');

const NAME_PREFIX = '#key';
const VALUE_PREFIX = ':val';

class DynamoDBV1Converter {
  /**
  * Checks If given DDB request is a V1 request which needs conversion
  */
  static isV1Request(request, type) {
    switch(type) {
      case DaxMethodIds.getItem:
        return !DynamoDBV1Converter._isArrayEmpty(request.AttributesToGet);
      case DaxMethodIds.batchGetItem:
        if(!DynamoDBV1Converter._isMapEmpty(request.RequestItems)) {
          for(const tableName of Object.getOwnPropertyNames(request.RequestItems)) {
            if(!DynamoDBV1Converter._isArrayEmpty(request.RequestItems[tableName].AttributesToGet)) {
              return true;
            }
          }
        }
        return false;
      case DaxMethodIds.putItem:
      case DaxMethodIds.deleteItem:
        return !DynamoDBV1Converter._isMapEmpty(request.Expected);
      case DaxMethodIds.updateItem:
        return !DynamoDBV1Converter._isMapEmpty(request.Expected) ||
          !DynamoDBV1Converter._isMapEmpty(request.AttributeUpdates);
      case DaxMethodIds.query:
        return (!DynamoDBV1Converter._isArrayEmpty(request.AttributesToGet) ||
          !DynamoDBV1Converter._isMapEmpty(request.QueryFilter) ||
          !DynamoDBV1Converter._isMapEmpty(request.KeyConditions));
      case DaxMethodIds.scan:
        return (!DynamoDBV1Converter._isArrayEmpty(request.AttributesToGet) ||
        !DynamoDBV1Converter._isMapEmpty(request.ScanFilter));
      case DaxMethodIds.batchWriteItem:
      case DaxMethodIds.transactGetItems:
      case DaxMethodIds.transactWriteItems:
        return false;
      default:
        throw new DaxClientError('Invalid request type', DaxErrorCode.Validation, false);
    }
  }

  static _isArrayEmpty(arr) {
    return arr === undefined || arr.length === 0;
  }

  static _isMapEmpty(obj) {
    return obj === undefined || Object.keys(obj).length === 0;
  }

  static convertRequest(ddbRequest, type) {
    let request = Util.deepCopy(ddbRequest);

    // Workaround a bug in the initial release of DAX
    request.ReturnConsumedCapacity = request.ReturnConsumedCapacity || 'NONE';

    if(DynamoDBV1Converter.isV1Request(request, type)) {
      DynamoDBV1Converter.convertV1RequestToV2(request, type);
    }

    return request;
  }

  /**
  * Converts V1 compatible DDB request to V2
  */
  static convertV1RequestToV2(request, type) {
    switch(type) {
      case DaxMethodIds.getItem:
        request.ExpressionAttributeNames = {};
        request.ProjectionExpression = DynamoDBV1Converter._convertAttrToGetToProjExpr(request.AttributesToGet,
          request.ExpressionAttributeNames);
        delete request.AttributesToGet;
        break;

      case DaxMethodIds.batchGetItem:
        for(const tableName in request.RequestItems) {
          if(!DynamoDBV1Converter._isArrayEmpty(request.RequestItems[tableName].AttributesToGet)) {
            request.RequestItems[tableName].ExpressionAttributeNames = {};
            request.RequestItems[tableName].ProjectionExpression = DynamoDBV1Converter._convertAttrToGetToProjExpr(
              request.RequestItems[tableName].AttributesToGet,
              request.RequestItems[tableName].ExpressionAttributeNames);
          }
        }
        break;

      case DaxMethodIds.putItem:
      case DaxMethodIds.deleteItem:
        request.ExpressionAttributeNames = {};
        request.ExpressionAttributeValues = {};
        request.ConditionExpression = DynamoDBV1Converter._convertConditionsToExpression(request.Expected,
          request.ConditionalOperator, request.ExpressionAttributeNames, request.ExpressionAttributeValues,
          DaxDataRequestParam.ConditionExpression);
        delete request.Expected;
        delete request.ConditionalOperator;
        break;

      case DaxMethodIds.updateItem:
        request.ExpressionAttributeNames = {};
        request.ExpressionAttributeValues = {};

        if(!DynamoDBV1Converter._isMapEmpty(request.Expected)) {
          request.ConditionExpression = DynamoDBV1Converter._convertConditionsToExpression(request.Expected,
            request.ConditionalOperator, request.ExpressionAttributeNames, request.ExpressionAttributeValues,
            DaxDataRequestParam.ConditionExpression);
          delete request.Expected;
          delete request.ConditionalOperator;
        }

        if(!DynamoDBV1Converter._isMapEmpty(request.AttributeUpdates)) {
          request.UpdateExpression = DynamoDBV1Converter._convertUpdateAttributesToUpdateExpr(request.AttributeUpdates,
            request.ExpressionAttributeNames, request.ExpressionAttributeValues);
          delete request.AttributeUpdates;
        }
        break;

      case DaxMethodIds.query:
        if(!request.ExpressionAttributeNames &&
          (!DynamoDBV1Converter._isMapEmpty(request.AttributesToGet) ||
          !DynamoDBV1Converter._isMapEmpty(request.QueryFilter) ||
          !DynamoDBV1Converter._isMapEmpty(request.KeyConditions))) {
          request.ExpressionAttributeNames = {};
        }

        if(request.AttributesToGet) {
          request.ProjectionExpression = DynamoDBV1Converter._convertAttrToGetToProjExpr(request.AttributesToGet,
            request.ExpressionAttributeNames);
          delete request.AttributesToGet;
        }

        if(!request.ExpressionAttributeValues &&
          (!DynamoDBV1Converter._isMapEmpty(request.KeyConditions) ||
          !DynamoDBV1Converter._isMapEmpty(request.QueryFilter))) {
          request.ExpressionAttributeValues = {};
        }

        if(!DynamoDBV1Converter._isMapEmpty(request.KeyConditions)) {
          request.KeyConditionExpression = DynamoDBV1Converter._convertConditionsToExpression(request.KeyConditions,
            'AND', request.ExpressionAttributeNames, request.ExpressionAttributeValues,
            DaxDataRequestParam.KeyConditionExpression);
          delete request.KeyConditions;
        }

        if(!DynamoDBV1Converter._isMapEmpty(request.QueryFilter)) {
          request.FilterExpression = DynamoDBV1Converter._convertConditionsToExpression(request.QueryFilter,
            request.ConditionalOperator, request.ExpressionAttributeNames, request.ExpressionAttributeValues,
            DaxDataRequestParam.FilterExpression);
          delete request.QueryFilter;
        }
        break;

      case DaxMethodIds.scan:
        request.ExpressionAttributeNames = {};
        if(!DynamoDBV1Converter._isArrayEmpty(request.AttributesToGet)) {
          request.ProjectionExpression = DynamoDBV1Converter._convertAttrToGetToProjExpr(request.AttributesToGet, request.ExpressionAttributeNames);
          delete request.AttributesToGet;
        }

        if(!DynamoDBV1Converter._isMapEmpty(request.ScanFilter)) {
          request.ExpressionAttributeValues = {};
          request.FilterExpression = DynamoDBV1Converter._convertConditionsToExpression(request.ScanFilter,
            request.ConditionalOperator, request.ExpressionAttributeNames, request.ExpressionAttributeValues,
            DaxDataRequestParam.FilterExpression);
          delete request.ScanFilter;
          delete request.ConditionalOperator;
        }
        break;

      default:
        throw new DaxClientError('Invalid request type', DaxErrorCode.Validation, false);
    }
  }

  /**
  * Creates and returns expression string from attribute names map
  */
  static _convertAttrToGetToProjExpr(attrToGet, exprAttrNamesMap) {
    if(attrToGet === undefined) {
      throw new DaxClientError('AttributesToGet cannot be null', DaxErrorCode.Validation, false);
    }

    let expr = DynamoDBV1Converter._convertToExpressionAttributeString(attrToGet, NAME_PREFIX, ',', exprAttrNamesMap);
    return expr;
  }

  /**
  * Converts expected attribute map or Filter attribute map to conditional expression
  */
  static _convertConditionsToExpression(conditions, conditionalOperator, exprAttrNamesMap, exprAttrValsMap, exprType) {
    let expr = '';
    let addCondOpDelimiter = false;
    let condOperator = conditionalOperator ? conditionalOperator : 'AND';

    Object.keys(conditions).forEach((attr) => {
      if(addCondOpDelimiter) {
        expr+= ' ' + condOperator + ' ';
      } else {
        addCondOpDelimiter = true;
      }
      let encodingFn;
      switch(exprType) {
        case DaxDataRequestParam.FilterExpression:
          encodingFn = DynamoDBV1Converter._encodeFilterExpression;
          break;
        case DaxDataRequestParam.ConditionExpression:
          encodingFn = DynamoDBV1Converter._encodeConditionExpression;
          break;
        case DaxDataRequestParam.KeyConditionExpression:
          encodingFn = DynamoDBV1Converter._encodeKeyConditionExpression;
      }
      expr+= encodingFn(attr, conditions[attr], exprAttrNamesMap, exprAttrValsMap);
    });
    return expr;
  }

  /**
  * Converts AttributeValueUpdate Map to update expression
  */
  static _convertUpdateAttributesToUpdateExpr(attrValUpdates, exprAttrNamesMap, exprAttrValsMap) {
    let sets = [];
    let adds = [];
    let deletes = [];
    let removes = [];
    for(let attributeName in attrValUpdates) {
      if(!Object.prototype.hasOwnProperty.call(attrValUpdates, attributeName)) {
        continue;
      }

      let attrValUpdate = attrValUpdates[attributeName];

      // Move ahead If update entry is null. DynamoDB's behavior.
      if(!attrValUpdate) {
        continue;
      }

      let action = attrValUpdate.Action ? attrValUpdate.Action: 'PUT';

      if(action !== 'ADD' && action !== 'DELETE' && action !== 'PUT') {
        throw new DaxClientError('Member must satisfy enum value set: [ADD, DELETE, PUT]', DaxErrorCode.Validation, false);
      }

      if(!attrValUpdate.Value && action !== 'DELETE') {
        throw new DaxClientError('Only DELETE action is allowed when no attribute value is specified', DaxErrorCode.Validation, false);
      }

      switch(action) {
        case 'PUT':
          let putExpression = DynamoDBV1Converter._appendToExpAttrMap(attributeName, exprAttrNamesMap, NAME_PREFIX) + ' = '
            + DynamoDBV1Converter._appendToExpAttrMap(attrValUpdate.Value, exprAttrValsMap, VALUE_PREFIX);
          sets.push(putExpression);
          break;

        case 'ADD':
          let addExpression = DynamoDBV1Converter._appendToExpAttrMap(attributeName, exprAttrNamesMap, NAME_PREFIX) + ' '
            + DynamoDBV1Converter._appendToExpAttrMap(attrValUpdate.Value, exprAttrValsMap, VALUE_PREFIX);
          adds.push(addExpression);
          break;

        case 'DELETE':
          let deleteExpression;
          if(attrValUpdate.Value) {
            deleteExpression = DynamoDBV1Converter._appendToExpAttrMap(attributeName, exprAttrNamesMap, NAME_PREFIX) + ' '
              + DynamoDBV1Converter._appendToExpAttrMap(attrValUpdate.Value, exprAttrValsMap, VALUE_PREFIX);
            deletes.push(deleteExpression);
          } else {
            deleteExpression = DynamoDBV1Converter._appendToExpAttrMap(attributeName, exprAttrNamesMap, NAME_PREFIX);
            removes.push(deleteExpression);
          }
          break;

        default:
          throw new DaxClientError('Invalid action passed : ' + action, DaxErrorCode.Validation, false);
      }
    }

    let updateExpr = '';
    if(sets.length !== 0) {
      updateExpr+= DynamoDBV1Converter._generateAndAppendUpdateExpression(sets, 'SET');
    }
    if(adds.length !== 0) {
      if(updateExpr.length !== 0) {
        updateExpr+= ' ';
      }
      updateExpr+= DynamoDBV1Converter._generateAndAppendUpdateExpression(adds, 'ADD');
    }
    if(deletes.length !== 0) {
      if(updateExpr.length !== 0) {
        updateExpr+= ' ';
      }
      updateExpr+= DynamoDBV1Converter._generateAndAppendUpdateExpression(deletes, 'DELETE');
    }
    if(removes.length !== 0) {
      if(updateExpr.length !== 0) {
        updateExpr+= ' ';
      }
      updateExpr+= DynamoDBV1Converter._generateAndAppendUpdateExpression(removes, 'REMOVE');
    }

    return updateExpr;
  }

  /**
  * Adds operation and then values
  */
  static _generateAndAppendUpdateExpression(list, operation) {
    let updateExpr = operation + ' ' + list[0];
    for(let i = 1; i < list.length; i++) {
      updateExpr += ', ' + list[i];
    }
    return updateExpr;
  }

  /**
  * Generates conditional expression for given Key and ExpectedAttributeValue
  */
  static _encodeConditionExpression(attr, expectedAttrVal, exprAttrNamesMap, exprAttrValsMap) {
    // If Expected Attribute value is null, then ignore it. Its the DynamoDB behavior.
    if(!expectedAttrVal) {
      return '';
    }

    let eName = DynamoDBV1Converter._appendToExpAttrMap(attr, exprAttrNamesMap, NAME_PREFIX);
    let compOp = expectedAttrVal.ComparisonOperator;

    if(!compOp) {
      if(exprAttrValsMap.AttributeValueList) {
        throw new DaxClientError(
          'One or more parameter values were invalid: AttributeValueList can only be used with a ComparisonOperator for Attribute: ' + attr,
          DaxErrorCode.Validation, false);
      }

      return DynamoDBV1Converter._handleExistsCriteria(attr, expectedAttrVal, eName, exprAttrValsMap);
    }

    if(expectedAttrVal.Exists) {
      throw new DaxClientError('One or more parameter values were invalid: Exists and ComparisonOperator cannot be used together for Attribute: ' + attr,
        DaxErrorCode.Validation, false);
    }

    let avl = expectedAttrVal.AttributeValueList;

    if(!avl) {
      if(expectedAttrVal.Value) {
        avl = [expectedAttrVal.Value];
      }
    } else if(expectedAttrVal.Value) {
      throw new DaxClientError('Value and AttributeValueList cannot be used together for Attribute: ' + attr + ' ' + avl,
        DaxErrorCode.Validation, false);
    }

    return DynamoDBV1Converter._constructFilterOrExpectedCompOpExpression(compOp, eName, attr, avl, exprAttrValsMap,
      'Unsupported operator on ExpectedAttributeValue: ' + expectedAttrVal);
  }

  /**
  * Constructs expression for given Key and Condition
  */
  static _encodeFilterExpression(attr, condition, exprAttrNamesMap, exprAttrValsMap) {
    // If the condition is null it should be ignored, as if it wasn't present (same as DDB SDK)
    if(condition === null) {
      return '';
    }

    let eName = DynamoDBV1Converter._appendToExpAttrMap(attr, exprAttrNamesMap, NAME_PREFIX);
    let compOp = condition.ComparisonOperator;
    if(!compOp) {
      throw new DaxClientError(
        'One or more parameter values were invalid: AttributeValueList can only be used with a ComparisonOperator for Attribute: ' + attr,
        DaxErrorCode.Validation, false);
    }

    let avl = condition.AttributeValueList;
    return DynamoDBV1Converter._constructFilterOrExpectedCompOpExpression(compOp, eName, attr, avl, exprAttrValsMap,
      'Unsupported operator on ExpectedAttributeValue: ' + condition);
  }

  /**
  * Converts KeyCondition to conditional expression
  */
  static _encodeKeyConditionExpression(attr, keyCondition, exprAttrNamesMap, exprAttrValsMap) {
    if(!keyCondition) {
      throw new DaxClientError('KeyCondition cannot be null for key: ' + attr, DaxErrorCode.Validation, false);
    }

    let compOp = keyCondition.ComparisonOperator;
    if(!compOp || compOp.trim().length === 0) {
      throw new DaxClientError('ComparisonOperator cannot be empty for KeyCondition: ' + keyCondition,
        DaxErrorCode.Validation, false);
    }

    let op;
    let avl = keyCondition.AttributeValueList;
    let eName = DynamoDBV1Converter._appendToExpAttrMap(attr, exprAttrNamesMap, NAME_PREFIX);

    switch(compOp) {
      case 'BETWEEN':
        return DynamoDBV1Converter._handleBetweenCondition(compOp, eName, avl, exprAttrValsMap, attr);
      case 'BEGINS_WITH':
        return DynamoDBV1Converter._handleBeginsWithCondition(compOp, eName, avl, exprAttrValsMap, attr);
      case 'EQ':
        op = '=';
        break;
      case 'LE':
        op = '<=';
        break;
      case 'LT':
        op = '<';
        break;
      case 'GE':
        op = '>=';
        break;
      case 'GT':
        op = '>';
        break;
      default:
        throw new DaxClientError('Unsupported operator on KeyCondition: ' + keyCondition, DaxErrorCode.Validation, false);
    }
    DynamoDBV1Converter._checkNumArguments(compOp, 1, avl, attr);
    let av0 = avl[0];
    let exprAttrVal0 = DynamoDBV1Converter._appendToExpAttrMap(av0, exprAttrValsMap, VALUE_PREFIX);
    return eName + ' ' + op + ' ' + exprAttrVal0;
  }
  /**
  * constructs expression for EXISTS comparison operator
  */
  static _handleExistsCriteria(attr, expectedAttrVal, eName, exprAttrValsMap) {
    const exists = expectedAttrVal.Exists === undefined || expectedAttrVal.Exists === null || expectedAttrVal.Exists;
    let expr = '';
    if(exists) {
      // If Exists is true, a value must be provided
      if(!expectedAttrVal.Value) {
        throw new DaxClientError(
          `One or more parameter values were invalid: Value must be provided when Exists is ${expectedAttrVal.Exists} for Attribute: ${attr}`,
          DaxErrorCode.Validation, false);
      }
      let expectedAttrVal0 = DynamoDBV1Converter._appendToExpAttrMap(expectedAttrVal.Value, exprAttrValsMap, VALUE_PREFIX);
      expr+= eName + ' = ' + expectedAttrVal0;
    } else {
      if(expectedAttrVal.Value) {
        // If Exists is false they must not provide a value
        throw new DaxClientError(
          `One or more parameter values were invalid: Value cannot be used when Exists is false for Attribute: ${attr}`,
          DaxErrorCode.Validation, false);
      }
      expr += 'attribute_not_exists(' + eName + ')';
    }
    return expr;
  }

  /**
  * Constructs expression for filter or expected comparison operators
  */
  static _constructFilterOrExpectedCompOpExpression(compOp, eName, attr, avl, exprAttrValsMap, errorMessage) {
    let op;
    switch(compOp) {
      case 'BETWEEN':
        return DynamoDBV1Converter._handleBetweenCondition(compOp, eName, avl, exprAttrValsMap, attr);
      case 'BEGINS_WITH':
        return DynamoDBV1Converter._handleBeginsWithCondition(compOp, eName, avl, exprAttrValsMap, attr);
      case 'NOT_CONTAINS': // Don't append key name
        return 'attribute_exists(' + eName + ') AND NOT '
          + DynamoDBV1Converter._handleContainsCondition(compOp, eName, avl, exprAttrValsMap, attr);
      case 'CONTAINS': // Don't append key name
        return DynamoDBV1Converter._handleContainsCondition(compOp, eName, avl, exprAttrValsMap, attr);
      case 'NOT_NULL': // Don't append key name
        DynamoDBV1Converter._checkNumArguments(compOp, 0, avl, attr);
        return 'attribute_exists(' + eName + ')';
      case 'NULL': // Don't append key name
        DynamoDBV1Converter._checkNumArguments(compOp, 0, avl, attr);
        return 'attribute_not_exists(' + eName + ')';
      case 'IN':
        return DynamoDBV1Converter._handleInCondition(compOp, eName, attr, avl, exprAttrValsMap);
      case 'EQ':
        op = '=';
        break;
      case 'LE':
        op = '<=';
        break;
      case 'LT':
        op = '<';
        break;
      case 'GE':
        op = '>=';
        break;
      case 'GT':
        op = '>';
        break;
      case 'NE':
        op = '<>';
        break;
      default:
        throw new DaxClientError(errorMessage, DaxErrorCode.Validation, false);
    }
    DynamoDBV1Converter._checkNumArguments(compOp, 1, avl, attr);
    let av0 = avl[0];
    DynamoDBV1Converter._checkValidBSNType(compOp, av0);
    let exprAttrVal0 = DynamoDBV1Converter._appendToExpAttrMap(av0, exprAttrValsMap, VALUE_PREFIX);
    return eName + ' ' + op + ' ' + exprAttrVal0;
  }

  /**
  * constructs expression for BETWEEN comparison operator
  */
  static _handleBetweenCondition(compOp, eName, avl, exprAttrValsMap, attr) {
    DynamoDBV1Converter._checkNumArguments(compOp, 2, avl, attr);
    DynamoDBV1Converter._checkValidBSNType(compOp, avl[0], avl[1]);
    DynamoDBV1Converter._checkValidBounds(avl[0], avl[1]);
    let exprAttrVal0 = DynamoDBV1Converter._appendToExpAttrMap(avl[0], exprAttrValsMap, VALUE_PREFIX);
    let exprAttrVal1 = DynamoDBV1Converter._appendToExpAttrMap(avl[1], exprAttrValsMap, VALUE_PREFIX);
    return eName + ' between ' + exprAttrVal0 + ' AND ' + exprAttrVal1;
  }

  /**
  * constructs expression for BEGINS_WITH comparison operator
  */
  static _handleBeginsWithCondition(compOp, eName, avl, exprAttrValsMap, attr) {
    DynamoDBV1Converter._checkNumArguments(compOp, 1, avl, attr);
    let av0 = avl[0];
    if(!av0.B && !av0.S) {
      throw new DaxClientError('One or more parameter values were invalid: ComparisonOperator ' + compOp
         + ' is not valid for ' + Objects.keys(av1)[0] + ' AttributeValue type', DaxErrorCode.Validation, false);
    }
    let exprAttrVal0 = DynamoDBV1Converter._appendToExpAttrMap(av0, exprAttrValsMap, VALUE_PREFIX);
    return 'begins_with(' + eName + ', ' + exprAttrVal0 + ')';
  }

  /**
  * constructs expression for CONTAINS comparison operator
  */
  static _handleContainsCondition(compOp, eName, avl, exprAttrValsMap, attr) {
    DynamoDBV1Converter._checkNumArguments(compOp, 1, avl, attr);
    let av1 = avl[0];
    DynamoDBV1Converter._checkValidBSNBoolNullTypes(compOp, av1);
    let exprAttrVal0 = DynamoDBV1Converter._appendToExpAttrMap(av1, exprAttrValsMap, VALUE_PREFIX);
    return 'contains(' + eName + ', ' + exprAttrVal0 + ')';
  }

  /**
  * constructs expression for IN comparison operator
  */
  static _handleInCondition(compOp, eName, atrr, avl, exprAttrValsMap) {
    if(!avl) {
      throw new DaxClientError(
        'One or more parameter values were invalid: Value or AttributeValueList must be used with ComparisonOperator: IN for Attribute: ' + attr,
        DaxErrorCode.Validation, false);
    } else if(avl.length === 0) {
      throw new DaxClientError('One or more parameter values were invalid: Invalid number of argument(s) for the IN ComparisonOperator',
        DaxErrorCode.Validation, false);
    }

    DynamoDBV1Converter._checkValidBSNType.apply(null, [compOp].concat(avl));
    return eName + ' IN (' + DynamoDBV1Converter._convertToExpressionAttributeString(avl, VALUE_PREFIX, ',', exprAttrValsMap) + ')';
  }

  /**
  * Validates the argument number
  */
  static _checkNumArguments(compOp, expectedArgsCount, avl, attr) {
    let size = avl ? avl.length : 0;
    if(!avl && expectedArgsCount > 0) {
      throw new DaxClientError('One or more parameter values were invalid: Value or AttributeValueList must be used with ComparisonOperator: '
         + compOp + ' for Attribute: ' + attr, DaxErrorCode.Validation, false);
    }

    if(size != expectedArgsCount) {
      throw new DaxClientError('One or more parameter values were invalid: Invalid number of argument(s) for the ' + compOp + ' ComparisonOperator',
        DaxErrorCode.Validation, false);
    }
  }

  /**
  * Checks If AttributeValues are either Bool, NULL, Bytes, String or Number type
  */
  static _checkValidBSNBoolNullTypes(compOp) {
    let attrVals = Array.prototype.slice.call(arguments, DynamoDBV1Converter._checkValidBSNBoolNullTypes.length);
    for(let i = 0; i < attrVals.length; i++) {
      if(attrVals[i].BOOL || attrVals[i].NULL) {
        continue;
      }
      DynamoDBV1Converter._checkValidBSNType(compOp, attrVals[i]);
    }
  }

  /**
  * Checks If AttributeValues are either Bytes, String or Number type
  */
  static _checkValidBSNType(compOp) {
    let attrVals = Array.prototype.slice.call(arguments, DynamoDBV1Converter._checkValidBSNType.length);
    if(compOp === 'EQ' || compOp === 'NE') {
      return;
    }

    for(let i = 0; i < attrVals.length; i++) {
      if(!attrVals[i].B && !attrVals[i].S && !attrVals[i].N) {
        throw new DaxClientError('One or more parameter values were invalid: ComparisonOperator ' + compOp
         + ' is not valid for ' + Object.keys(attrVals[i]) + ' AttributeValue type', DaxErrorCode.Validation, false);
      }
    }
  }

  /**
  * Validates lower bound is less than upper bound for String and Number
  */
  static _checkValidBounds(lowerBoundAv, upperBoundAv) {
    let lbType = Object.keys(lowerBoundAv)[0];
    let ubType = Object.keys(upperBoundAv)[0];
    if(lbType !== ubType) {
      throw new DaxClientError('One or more parameter values were invalid: '
        + 'AttributeValues inside AttributeValueList must be of same type', DaxErrorCode.Validation, false);
    }

    if(lbType === 'S') {
      if(lowerBoundAv['S'] > upperBoundAv['S']) {
        throw new DaxClientError('The BETWEEN condition was provided a range where the lower bound is greater than the upper bound',
          DaxErrorCode.Validation, false);
      }
    } else if(lbType === 'N') {
      if(new BigDecimal(lowerBoundAv['N']).comparedTo(new BigDecimal(upperBoundAv['N'])) > 0) {
        throw new DaxClientError('The BETWEEN condition was provided a range where the lower bound is greater than the upper bound',
          DaxErrorCode.Validation, false);
      }
    }
  }

  /**
  * Constructs expression from given attribute Map
  */
  static _convertToExpressionAttributeString(attrs, prefix, delimiter, exprAttrMap) {
    let addDelimiter = false;
    let exprAttrStr = '';
    for(const attr of attrs) {
      let exprName = DynamoDBV1Converter._appendToExpAttrMap(attr, exprAttrMap, prefix);

      if(addDelimiter) {
        exprAttrStr+= delimiter;
      } else {
        addDelimiter = true;
      }
      exprAttrStr+= exprName;
    }
    return exprAttrStr;
  }

  /**
  * Creates an expression attribute and adds it to map
  */
  static _appendToExpAttrMap(attr, exprAttrMap, prefix) {
    let suffix = Object.keys(exprAttrMap).length;

    while(exprAttrMap[prefix + suffix] !== undefined) {
      suffix++;
    }

    exprAttrMap[prefix + suffix] = attr;
    return (prefix + suffix);
  }
}

module.exports = DynamoDBV1Converter;
