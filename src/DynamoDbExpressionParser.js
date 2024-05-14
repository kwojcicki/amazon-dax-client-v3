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
const ProjectionExpressionParser = require('./ProjectionExpressionParser');
const ConditionExpressionParser = require('./ConditionExpressionParser');
const UpdateExpressionParser = require('./UpdateExpressionParser');

class DynamoDbExpressionParser {
  /**
   * Helper to parse the expression into a 'projection' AST
   */
  static parseProjection(expression, errorListener) {
    return new ProjectionExpressionParser().parse(expression, errorListener);
  }

  /**
   * Helper to parse the expression into a 'condition' AST
   */
  static parseCondition(expression, errorListener) {
    return new ConditionExpressionParser().parse(expression, errorListener);
  }

  /**
   * Helper to parse the expression into an 'update' AST
   */
  static parseUpdate(expression, errorListener) {
    return new UpdateExpressionParser().parse(expression, errorListener);
  }
}

module.exports = DynamoDbExpressionParser;
