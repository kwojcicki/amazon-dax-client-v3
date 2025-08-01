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
import { error } from 'antlr4';
import { DaxClientError } from './DaxClientError';
import { DaxErrorCode } from './DaxErrorCode';

export class ExpressionErrorListener extends error.ErrorListener {
  _mExpression: any;
  _mExpressionType: any;
  constructor(expression, expressionType) {
    super();
    this._mExpression = expression;
    this._mExpressionType = expressionType;
  }

  syntaxError(recognizer, offendingSymbol, line, column, message, exception) {
    let token = offendingSymbol;
    throw new DaxClientError('Invalid ' + this._mExpressionType + ': Syntax error; token: "'
      + token.text + '", near: line ' + line + ' char ' + column, DaxErrorCode.Validation, false);
  }
}
