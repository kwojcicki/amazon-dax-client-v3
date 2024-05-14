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
const antlr4 = require('antlr4');
const DynamoDbGrammarListener = require('./DynamoDbGrammarListener').DynamoDbGrammarListener;
const AttributeValueEncoder = require('./AttributeValueEncoder');
const StreamBuffer = require('./ByteStreamBuffer');
const CborEncoder = require('./CborEncoder');
const DaxCborTypes = require('./DaxCborTypes');
const DynamoDbExpressionParser = require('./DynamoDbExpressionParser');
const ExpressionErrorListener = require('./ExpressionErrorListener');
const DaxClientError = require('./DaxClientError');
const DaxErrorCode = require('./DaxErrorCode');

const ENCODING_FORMAT = 1;
const ATTRIBUTE_VALUE_PREFIX = ':';
const ATTRIBUTE_NAME_PREFIX = '#';

class CborSExprGenerator extends DynamoDbGrammarListener {
  constructor(expressionAttributeNames, expressionAttributeValues) {
    super();
    this._mStack = [];
    this._mExpressionAttributeNames = expressionAttributeNames;
    this._mExpressionAttributeValues = expressionAttributeValues;

    if(expressionAttributeNames) {
      this._mUnusedExpressionAttributeNames = new Set(Object.keys(expressionAttributeNames));
    } else {
      this._mUnusedExpressionAttributeNames = new Set();
    }
    if(expressionAttributeValues) {
      this._mUnusedExpressionAttributeValues = new Set(Object.keys(expressionAttributeValues));
      this._mVariableNameById = {};
      this._mVariableValues = [];
    } else {
      this._mUnusedExpressionAttributeValues = new Set();
      this._mVariableNameById = null;
      this._mVariableValues = null;
    }
  }

  _reset(type) {
    this._mType = type;
    this._mNestingLevel = 0;
    this._mVariableNameById = {};
    this._mVariableValues = [];
  }

  static encodeConditionExpression(expression, eAttrStrs, eAttrVals) {
    return CborSExprGenerator.encodeExpressions(expression, null, null, null, null,
      eAttrStrs, eAttrVals).Condition;
  }

  static encodeKeyConditionExpression(expression, eAttrStrs, eAttrVals) {
    return CborSExprGenerator.encodeExpressions(null, expression, null, null, null,
      eAttrStrs, eAttrVals).KeyCondition;
  }

  static encodeFilterExpression(expression, eAttrStrs, eAttrVals) {
    return CborSExprGenerator.encodeExpressions(null, null, expression, null, null,
      eAttrStrs, eAttrVals).Filter;
  }

  static encodeUpdateExpression(expression, eAttrStrs, eAttrVals) {
    return CborSExprGenerator.encodeExpressions(null, null, null, expression, null,
      eAttrStrs, eAttrVals).Update;
  }

  static encodeProjectionExpression(expression, eAttrStrs) {
    return CborSExprGenerator.encodeExpressions(null, null, null, null,
      expression, eAttrStrs, null).Projection;
  }

  static encodeExpressions(condExpr, keyCondExpr, filterExpr, updExpr, projExpr, eAttrNames, eAttrVals) {
    let exprs = {};
    exprs.Condition = condExpr;
    exprs.KeyCondition = keyCondExpr;
    exprs.Filter = filterExpr;
    exprs.Update = updExpr;
    exprs.Projection = projExpr;

    let output = {};

    let generator = new CborSExprGenerator(eAttrNames, eAttrVals);
    let buffer = new StreamBuffer();
    let encoder = new CborEncoder();

    Object.keys(exprs).forEach((type) => {
      let expr = exprs[type];
      if(!expr) {
        output[type] = null;
        return;
      }
      let typeStr = type + 'Expression';
      let tree = null;
      let exprArrayLength = 3;
      try {
        switch(type) {
          case 'Condition':
          case 'Filter':
          case 'KeyCondition':
            exprArrayLength = 3;
            tree = DynamoDbExpressionParser
              .parseCondition(expr, new ExpressionErrorListener(expr, typeStr));
            break;
          case 'Projection':
            exprArrayLength = 2;
            tree = DynamoDbExpressionParser
              .parseProjection(expr, new ExpressionErrorListener(expr, typeStr));
            break;
          case 'Update':
            exprArrayLength = 3;
            tree = DynamoDbExpressionParser
              .parseUpdate(expr, new ExpressionErrorListener(expr, typeStr));
            break;
        }
      } catch(err) {
        if(err instanceof DaxClientError) {
          throw err;
        } else {
          throw new DaxClientError(err + '\nInvalid ' + typeStr + ': The expression has redundant parentheses',
            DaxErrorCode.Validation, false);
        }
      }

      generator._reset(type);
      antlr4.tree.ParseTreeWalker.DEFAULT.walk(generator, tree);

      generator._validateIntermediateState();
      let spec = generator._mStack.pop();

      buffer.write(encoder.encodeArrayHeader(exprArrayLength));
      buffer.write(encoder.encodeInt(ENCODING_FORMAT));
      buffer.write(spec);
      if('Projection' !== type) {
        buffer.write(encoder.encodeArrayHeader(generator._mVariableValues.length));
        for(let varVal of generator._mVariableValues) {
          buffer.write(varVal);
        }
      }
      output[type] = buffer.read();
    });

    generator._validateFinalState();

    return output;
  }

  _validateIntermediateState() {
    if(this._mStack.length !== 1) {
      throw new DaxClientError('Invalid ' + this._mType + 'Expression, Stack size = ' + this._mStack.length, DaxErrorCode.Validation, false);
    }

    if(this._mNestingLevel !== 0) {
      throw new DaxClientError('Invalid ' + this._mType + 'Expression, Nesting level = ' + this._mNestingLevel, DaxErrorCode.Validation, false);
    }
  }

  _validateFinalState() {
    if(this._mUnusedExpressionAttributeNames.size !== 0) {
      let names = this._joinMissingNames(this._mUnusedExpressionAttributeNames);
      throw new DaxClientError('Value provided in ExpressionAttributeNames unused in expressions: keys: {' + names + '}', DaxErrorCode.Validation, false);
    }
    if(this._mUnusedExpressionAttributeValues.size !== 0) {
      let names = this._joinMissingNames(this._mUnusedExpressionAttributeValues);
      throw new DaxClientError('Value provided in ExpressionAttributeValues unused in expressions: keys: {' + names + '}', DaxErrorCode.Validation, false);
    }
  }

  _validateNotEquals(expType, actual, notExpected) {
    for(let n of notExpected) {
      if(actual.toLowerCase() === n.toLowerCase()) {
        let expTypeStr = (!expType ? '' : expType);
        throw new DaxClientError('Invalid ' + expTypeStr + 'Expression: The function is not allowed in a ' + expTypeStr.toLowerCase() + ' expression',
          DaxErrorCode.Validation, false);
      }
    }
  }

  _joinMissingNames(names) {
    let result = null;
    for(let name of names) {
      result = (result === null ? name : result + ', ' + name);
    }

    return result;
  }

  enterComparator(ctx) {
    this._mNestingLevel++;
  }

  exitComparator(ctx) {
    let arg2 = this._mStack.pop();
    let func = this._mStack.pop();
    let arg1 = this._mStack.pop();
    this._mStack.push(this._encodeArray([func, arg1, arg2]));
    this._mNestingLevel--;
  }

  exitComparator_symbol(ctx) {
    let func = null;
    switch(ctx.getText()) {
      case '=':
        func = Func.Equal;
        break;
      case '<>':
        func = Func.NotEqual;
        break;
      case '<':
        func = Func.LessThan;
        break;
      case '<=':
        func = Func.LessEqual;
        break;
      case '>':
        func = Func.GreaterThan;
        break;
      case '>=':
        func = Func.GreaterEqual;
        break;
      default:
        throw new DaxClientError('invalid function ' + ctx.getText(), DaxErrorCode.Validation, false);
    }
    this._mStack.push(this._encodeFunctionCode(func));
  }

  exitPath(ctx) {
    let components = [];
    for(let i=ctx.getChildCount()-1; i>=0; i--) {
      components[i] = this._mStack.pop();
    }
    this._mStack.push(this._encodeFunction(Func.DocumentPath, components));
  }

  exitListAccess(ctx) {
    let value = ctx.getText();
    try {
      let ordinal = parseInt(value.substr(1, value.length - 2)); // get rid of []
      this._mStack.push(this._encodeListAccess(ordinal));
    } catch(err) {
      throw new DaxClientError('Invalid ' + this._mType
                + 'Expression: List index is not within the allowable range', DaxErrorCode.Validation, false);
    }
  }

  exitId(ctx) {
    let id = ctx.getText();
    if(id[0] === ATTRIBUTE_NAME_PREFIX) {
      let sub = this._mExpressionAttributeNames[id];
      if(!sub) {
        throw new DaxClientError('Invalid ' + this._mType + 'Expression. Substitution value not provided for ' + id,
          DaxErrorCode.Validation, false);
      }
      this._mUnusedExpressionAttributeNames.delete(id);
      this._mStack.push(this._encodeAttributeValue({'S': sub}));
    } else {
      this._mStack.push(this._encodeDocumentPathElement(id)); // FIXME Should this be a function?
    }
  }

  exitLiteralSub(ctx) {
    let literal = ctx.getText();
    this._mStack.push(this._encodeVariable(literal.substr(1)));
  }

  exitAnd(ctx) {
    let arg2 = this._mStack.pop();
    let arg1 = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.And, [arg1, arg2]));
  }

  exitOr(ctx) {
    let arg2 = this._mStack.pop();
    let arg1 = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.Or, [arg1, arg2]));
  }

  exitNegation(ctx) {
    let arg = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.Not, [arg]));
  }

  enterIn(ctx) {
    this._mNestingLevel++;
  }

  exitIn(ctx) {
    let numArgs = 1 + (ctx.getChildCount() - 3) / 2; // arg + IN + ( + args*2-1 + )
    let args = [];
    while(numArgs-- > 1) {
      args[numArgs-1] = this._mStack.pop();
    }
    let arg1 = this._mStack.pop();
    // a in (b,c,d) =>  (In a (b c d))
    this._mStack.push(this._encodeFunction(Func.In, [arg1, this._encodeArray(args)]));
    this._mNestingLevel--;
  }

  enterBetween(ctx) {
    this._mNestingLevel++;
  }

  exitBetween(ctx) {
    let arg3 = this._mStack.pop();
    let arg2 = this._mStack.pop();
    let arg1 = this._mStack.pop();

    // a between b and c => (Between a b c)
    this._mStack.push(this._encodeFunction(Func.Between, [arg1, arg2, arg3]));
    this._mNestingLevel--;
  }

  enterFunctionCall(ctx) {
    let funcName = ctx.ID().getText();
    if(this._mType) {
      switch(this._mType) {
        case 'Update':
          this._validateNotEquals(this._mType, funcName, ['attribute_exists', 'attribute_not_exists',
            'attribute_type', 'begins_with', 'contains', 'size']);
          if(this._mNestingLevel > 0 && !(funcName.toLowerCase() === 'if_not_exists')) {
            throw new DaxClientError('Only if_not_exists() function can be nested', DaxErrorCode.Validation, false);
          }
          break;
        case 'Filter':
        case 'Condition':
        // If nesting level is 0, function should return type boolean (which is all functions other than size)
        // If nesting level > 0, only size function is allowed
          this._validateNotEquals(this._mType, funcName, ['if_not_exists', 'list_append']);
          if(this._mNestingLevel === 0 && (funcName.toLowerCase() === 'size')) {
            let expTypeStr = (!this._mType) ? '' : this._mType;
            throw new DaxClientError('Invalid ' + expTypeStr + 'Expression: The function is not allowed to be used this way in an expression',
              DaxErrorCode.Validation, false);
          } else if(this._mNestingLevel > 0 && !(funcName.toLowerCase() === 'size')) {
            throw new DaxClientError('Only size() function is allowed to be nested', DaxErrorCode.Validation, false);
          }
          break;
        default:
          break;
      }
    }
    this._mNestingLevel++;
  }

  exitFunctionCall(ctx) {
    let funcName = ctx.ID().getText();
    let func = null;
    switch(funcName.toLowerCase()) {
      case 'attribute_exists':
        func = Func.AttributeExists;
        break;
      case 'attribute_not_exists':
        func = Func.AttributeNotExists;
        break;
      case 'attribute_type':
        func = Func.AttributeType;
        break;
      case 'begins_with':
      // FIXME validate argument type is string for BeginsWith
        func = Func.BeginsWith;
        break;
      case 'contains':
        func = Func.Contains;
        break;
      case 'size':
        func = Func.Size;
        break;
      case 'if_not_exists':
        func = Func.IfNotExists;
        break;
      case 'list_append':
        func = Func.ListAppend;
        break;
      default:
        throw new DaxClientError('Invalid ' + this._mType + 'Expression: Invalid function name: function: ' + funcName.toLowerCase(),
          DaxErrorCode.Validation, false);
    }

    let numArgs = (ctx.getChildCount() - 2) / 2; // children = fname + ( + numOperands*2-1 +)
    let args = [];
    while(numArgs-- > 0) {
      args[numArgs] = this._mStack.pop();
    }
    // func(a,b,c,..) => (func a b c ..)
    this._mStack.push(this._encodeFunction(func, args));
    this._mNestingLevel--;
  }

  exitProjection(ctx) {
    let numPaths = (ctx.getChildCount() + 1) / 2; // path, path, ... path
    let paths = [];
    while(numPaths-->0) {
      paths[numPaths] = this._mStack.pop();
    }
    this._mStack.push(this._encodeArray(paths));
  }

  exitUpdate(ctx) {
    let updates = [];
    let remaining = this._mStack.length;
    while(remaining > 0) {
      updates[--remaining] = this._mStack.pop();
    }
    this._mStack.push(this._encodeArray(updates));
  }

  exitSet_action(ctx) {
    let operand = this._mStack.pop();
    let path = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.SetAction, [path, operand]));
  }

  exitRemove_action(ctx) {
    let path = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.RemoveAction, [path]));
  }

  exitAdd_action(ctx) {
    let value = this._mStack.pop();
    let path = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.AddAction, [path, value]));
  }

  exitDelete_action(ctx) {
    let value = this._mStack.pop();
    let path = this._mStack.pop();
    this._mStack.push(this._encodeFunction(Func.DeleteAction, [path, value]));
  }

  enterPlusMinus(ctx) {
    this._mNestingLevel++;
  }

  exitPlusMinus(ctx) {
    let op2 = this._mStack.pop();
    let op1 = this._mStack.pop();

    let func = null;
    let operator = ctx.getChild(1).getText();
    switch(operator) {
      case '+': func = Func.Plus; break;
      case '-': func = Func.Minus; break;
      default:
        throw new DaxClientError('Must be +/-', DaxErrorCode.Validation, false);
    }
    this._mStack.push(this._encodeFunction(func, [op1, op2]));
    this._mNestingLevel--;
  }

  _encodeDocumentPathElement(str) {
    return new CborEncoder().encodeString(str);
  }

  _encodeAttributeValue(val) {
    return AttributeValueEncoder.encodeAttributeValue(val);
  }

  _encodeArray(arr) {
    let encoder = new CborEncoder();
    let buffer = new StreamBuffer();
    buffer.write(encoder.encodeArrayHeader(arr.length));
    for(let obj of arr) {
      buffer.write(obj);
    }
    return buffer.read();
  }

  _encodeFunctionCode(func) {
    return new CborEncoder().encodeInt(func);
  }

  _encodeFunction(func, args) {
    let encoder = new CborEncoder();
    let buffer = new StreamBuffer();
    buffer.write(encoder.encodeArrayHeader(args.length+1));
    buffer.write(encoder.encodeInt(func));
    for(let i = 0; i < args.length; ++i) {
      buffer.write(args[i]);
    }
    return buffer.read();
  }

  _encodeListAccess(ordinal) {
    let encoder = new CborEncoder();
    let buffer = new StreamBuffer();
    buffer.write(encoder.encodeTag(DaxCborTypes.TAG_DDB_DOCUMENT_PATH_ORDINAL));
    buffer.write(encoder.encodeInt(ordinal));
    return buffer.read();
  }

  _encodeVariable(varName) {
    let fullName = ATTRIBUTE_VALUE_PREFIX + varName;
    let val = this._mExpressionAttributeValues[fullName];
    if(!val) {
      throw new DaxClientError('Invalid ' + this._mType
                + 'Expression: An expression attribute value used in expression is not defined: attribute value: '
                + fullName, DaxErrorCode.Validation, false);
    }
    this._mUnusedExpressionAttributeValues.delete(fullName);
    let varId = this._mVariableNameById[varName];
    if(!varId) {
      varId = this._mVariableValues.length;
      this._mVariableNameById[varName] = varId;
      this._mVariableValues.push(this._encodeAttributeValue(val));
    }
    let buffer = new StreamBuffer();
    let encoder = new CborEncoder();
    buffer.write(encoder.encodeArrayHeader(2));
    buffer.write(encoder.encodeInt(Func.Variable));
    buffer.write(encoder.encodeInt(varId));
    return buffer.read();
  }
}

const Func = {
  // NOTE: Ordinal is used as identifiers in CBor encoded format
  /* Comparison operators */
  Equal: 0,
  NotEqual: 1,
  LessThan: 2,
  GreaterEqual: 3,
  GreaterThan: 4,
  LessEqual: 5,

  /* Logical operators */
  And: 6,
  Or: 7,
  Not: 8,

  /* Range operators */
  Between: 9,

  /* Enumeration operators */
  In: 10,

  /* Functions */
  AttributeExists: 11,
  AttributeNotExists: 12,
  AttributeType: 13,
  BeginsWith: 14,
  Contains: 15,
  Size: 16,

  /* Document path elements */
  Variable: 17, // takes 1 argument which is a placeholder for a value. function substitutes argument with corresponding value
  DocumentPath: 18, // maps a CBOR object to a document path

  /* Update Actions */
  SetAction: 19,
  AddAction: 20,
  DeleteAction: 21,
  RemoveAction: 22,

  /* Update operations */
  IfNotExists: 23,
  ListAppend: 24,
  Plus: 25,
  Minus: 26,
};

module.exports = {
  CborSExprGenerator: CborSExprGenerator,
  ATTRIBUTE_VALUE_PREFIX: ATTRIBUTE_VALUE_PREFIX,
  ATTRIBUTE_NAME_PREFIX: ATTRIBUTE_NAME_PREFIX,
};
