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
const DynamoDbGrammarLexer = require('./DynamoDbGrammarLexer').DynamoDbGrammarLexer;
const DynamoDbGrammarParser = require('./DynamoDbGrammarParser').DynamoDbGrammarParser;

class AbstractTwoStageExpressionParser {
  parse(expression, errorListener) {
    let lexer = new DynamoDbGrammarLexer(new antlr4.InputStream(expression));
    let tokens = new antlr4.CommonTokenStream(lexer);
    let parser = new DynamoDbGrammarParser(tokens);
    parser.buildParseTrees = true;
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);
    parser.removeErrorListeners();
    try {
      // Stage 1 parse with PredictionMode.SLL
      // If there are no issues SLL was enough to parse
      // If there were problems LL will be used to try again
      parser.interpreter.setPredictionMode(PredictionMode.LL);
      return this.parseStub(parser);
    } catch(e) {
      // If there was an error we don't know if it's a real SyntaxError
      // Or SLL strategy wasn't strong enough
      // Stage 2 parse with default prediction mode
      tokens.reset();
      parser.reset();
      parser.addErrorListener(errorListener);
      parser._interp.predictionMode = antlr4.atn.PredictionMode.LL;
      return this.parseStub(parser);
    }
  }

  parseStub(parser) {

  }
}

module.exports = AbstractTwoStageExpressionParser;
