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
// Generated from DynamoDbGrammar.g4 by ANTLR 4.5.3
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by DynamoDbGrammarParser.
function DynamoDbGrammarListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

DynamoDbGrammarListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
DynamoDbGrammarListener.prototype.constructor = DynamoDbGrammarListener;

// Enter a parse tree produced by DynamoDbGrammarParser#projection_.
DynamoDbGrammarListener.prototype.enterProjection_ = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#projection_.
DynamoDbGrammarListener.prototype.exitProjection_ = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#projection.
DynamoDbGrammarListener.prototype.enterProjection = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#projection.
DynamoDbGrammarListener.prototype.exitProjection = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#condition_.
DynamoDbGrammarListener.prototype.enterCondition_ = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#condition_.
DynamoDbGrammarListener.prototype.exitCondition_ = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#Or.
DynamoDbGrammarListener.prototype.enterOr = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#Or.
DynamoDbGrammarListener.prototype.exitOr = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#Negation.
DynamoDbGrammarListener.prototype.enterNegation = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#Negation.
DynamoDbGrammarListener.prototype.exitNegation = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#In.
DynamoDbGrammarListener.prototype.enterIn = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#In.
DynamoDbGrammarListener.prototype.exitIn = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#And.
DynamoDbGrammarListener.prototype.enterAnd = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#And.
DynamoDbGrammarListener.prototype.exitAnd = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#Between.
DynamoDbGrammarListener.prototype.enterBetween = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#Between.
DynamoDbGrammarListener.prototype.exitBetween = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#FunctionCondition.
DynamoDbGrammarListener.prototype.enterFunctionCondition = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#FunctionCondition.
DynamoDbGrammarListener.prototype.exitFunctionCondition = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#Comparator.
DynamoDbGrammarListener.prototype.enterComparator = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#Comparator.
DynamoDbGrammarListener.prototype.exitComparator = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#ConditionGrouping.
DynamoDbGrammarListener.prototype.enterConditionGrouping = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#ConditionGrouping.
DynamoDbGrammarListener.prototype.exitConditionGrouping = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#comparator_symbol.
DynamoDbGrammarListener.prototype.enterComparator_symbol = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#comparator_symbol.
DynamoDbGrammarListener.prototype.exitComparator_symbol = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#update_.
DynamoDbGrammarListener.prototype.enterUpdate_ = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#update_.
DynamoDbGrammarListener.prototype.exitUpdate_ = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#update.
DynamoDbGrammarListener.prototype.enterUpdate = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#update.
DynamoDbGrammarListener.prototype.exitUpdate = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#set_section.
DynamoDbGrammarListener.prototype.enterSet_section = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#set_section.
DynamoDbGrammarListener.prototype.exitSet_section = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#set_action.
DynamoDbGrammarListener.prototype.enterSet_action = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#set_action.
DynamoDbGrammarListener.prototype.exitSet_action = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#add_section.
DynamoDbGrammarListener.prototype.enterAdd_section = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#add_section.
DynamoDbGrammarListener.prototype.exitAdd_section = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#add_action.
DynamoDbGrammarListener.prototype.enterAdd_action = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#add_action.
DynamoDbGrammarListener.prototype.exitAdd_action = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#delete_section.
DynamoDbGrammarListener.prototype.enterDelete_section = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#delete_section.
DynamoDbGrammarListener.prototype.exitDelete_section = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#delete_action.
DynamoDbGrammarListener.prototype.enterDelete_action = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#delete_action.
DynamoDbGrammarListener.prototype.exitDelete_action = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#remove_section.
DynamoDbGrammarListener.prototype.enterRemove_section = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#remove_section.
DynamoDbGrammarListener.prototype.exitRemove_section = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#remove_action.
DynamoDbGrammarListener.prototype.enterRemove_action = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#remove_action.
DynamoDbGrammarListener.prototype.exitRemove_action = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#OperandValue.
DynamoDbGrammarListener.prototype.enterOperandValue = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#OperandValue.
DynamoDbGrammarListener.prototype.exitOperandValue = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#ArithmeticValue.
DynamoDbGrammarListener.prototype.enterArithmeticValue = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#ArithmeticValue.
DynamoDbGrammarListener.prototype.exitArithmeticValue = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#PlusMinus.
DynamoDbGrammarListener.prototype.enterPlusMinus = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#PlusMinus.
DynamoDbGrammarListener.prototype.exitPlusMinus = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#ArithmeticParens.
DynamoDbGrammarListener.prototype.enterArithmeticParens = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#ArithmeticParens.
DynamoDbGrammarListener.prototype.exitArithmeticParens = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#PathOperand.
DynamoDbGrammarListener.prototype.enterPathOperand = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#PathOperand.
DynamoDbGrammarListener.prototype.exitPathOperand = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#LiteralOperand.
DynamoDbGrammarListener.prototype.enterLiteralOperand = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#LiteralOperand.
DynamoDbGrammarListener.prototype.exitLiteralOperand = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#FunctionOperand.
DynamoDbGrammarListener.prototype.enterFunctionOperand = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#FunctionOperand.
DynamoDbGrammarListener.prototype.exitFunctionOperand = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#ParenOperand.
DynamoDbGrammarListener.prototype.enterParenOperand = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#ParenOperand.
DynamoDbGrammarListener.prototype.exitParenOperand = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#FunctionCall.
DynamoDbGrammarListener.prototype.enterFunctionCall = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#FunctionCall.
DynamoDbGrammarListener.prototype.exitFunctionCall = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#path.
DynamoDbGrammarListener.prototype.enterPath = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#path.
DynamoDbGrammarListener.prototype.exitPath = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#id.
DynamoDbGrammarListener.prototype.enterId = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#id.
DynamoDbGrammarListener.prototype.exitId = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#MapAccess.
DynamoDbGrammarListener.prototype.enterMapAccess = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#MapAccess.
DynamoDbGrammarListener.prototype.exitMapAccess = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#ListAccess.
DynamoDbGrammarListener.prototype.enterListAccess = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#ListAccess.
DynamoDbGrammarListener.prototype.exitListAccess = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#LiteralSub.
DynamoDbGrammarListener.prototype.enterLiteralSub = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#LiteralSub.
DynamoDbGrammarListener.prototype.exitLiteralSub = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#expression_attr_names_sub.
DynamoDbGrammarListener.prototype.enterExpression_attr_names_sub = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#expression_attr_names_sub.
DynamoDbGrammarListener.prototype.exitExpression_attr_names_sub = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#expression_attr_values_sub.
DynamoDbGrammarListener.prototype.enterExpression_attr_values_sub = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#expression_attr_values_sub.
DynamoDbGrammarListener.prototype.exitExpression_attr_values_sub = function(ctx) {
};


// Enter a parse tree produced by DynamoDbGrammarParser#unknown.
DynamoDbGrammarListener.prototype.enterUnknown = function(ctx) {
};

// Exit a parse tree produced by DynamoDbGrammarParser#unknown.
DynamoDbGrammarListener.prototype.exitUnknown = function(ctx) {
};



exports.DynamoDbGrammarListener = DynamoDbGrammarListener;
