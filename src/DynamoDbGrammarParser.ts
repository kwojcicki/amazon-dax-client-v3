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
var DynamoDbGrammarListener = require('./DynamoDbGrammarListener').DynamoDbGrammarListener;
var grammarFileName = "DynamoDbGrammar.g4";

var serializedATN = ["\u0003\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd",
    "\u0003 \u00f1\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0004",
    "\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013\u0004\u0014\t",
    "\u0014\u0004\u0015\t\u0015\u0004\u0016\t\u0016\u0004\u0017\t\u0017\u0004",
    "\u0018\t\u0018\u0004\u0019\t\u0019\u0004\u001a\t\u001a\u0004\u001b\t",
    "\u001b\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0007\u0003=\n\u0003\f\u0003\u000e\u0003@\u000b\u0003\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0007\u0005P\n\u0005\f\u0005\u000e\u0005S\u000b\u0005\u0003",
    "\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003",
    "\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003",
    "\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005e\n\u0005\u0003",
    "\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0007",
    "\u0005m\n\u0005\f\u0005\u000e\u0005p\u000b\u0005\u0003\u0006\u0003\u0006",
    "\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003\b\u0003\b",
    "\u0006\b{\n\b\r\b\u000e\b|\u0003\t\u0003\t\u0003\t\u0003\t\u0007\t\u0083",
    "\n\t\f\t\u000e\t\u0086\u000b\t\u0003\n\u0003\n\u0003\n\u0003\n\u0003",
    "\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0007\u000b\u0090\n\u000b",
    "\f\u000b\u000e\u000b\u0093\u000b\u000b\u0003\f\u0003\f\u0003\f\u0003",
    "\r\u0003\r\u0003\r\u0003\r\u0007\r\u009c\n\r\f\r\u000e\r\u009f\u000b",
    "\r\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000f\u0003\u000f\u0003",
    "\u000f\u0003\u000f\u0007\u000f\u00a8\n\u000f\f\u000f\u000e\u000f\u00ab",
    "\u000b\u000f\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011\u0005\u0011",
    "\u00b1\n\u0011\u0003\u0012\u0003\u0012\u0003\u0012\u0003\u0012\u0003",
    "\u0012\u0003\u0012\u0003\u0012\u0003\u0012\u0003\u0012\u0005\u0012\u00bc",
    "\n\u0012\u0003\u0013\u0003\u0013\u0003\u0013\u0003\u0013\u0003\u0013",
    "\u0003\u0013\u0003\u0013\u0003\u0013\u0005\u0013\u00c6\n\u0013\u0003",
    "\u0014\u0003\u0014\u0003\u0014\u0003\u0014\u0003\u0014\u0007\u0014\u00cd",
    "\n\u0014\f\u0014\u000e\u0014\u00d0\u000b\u0014\u0003\u0014\u0003\u0014",
    "\u0003\u0015\u0003\u0015\u0007\u0015\u00d6\n\u0015\f\u0015\u000e\u0015",
    "\u00d9\u000b\u0015\u0003\u0016\u0003\u0016\u0003\u0017\u0003\u0017\u0003",
    "\u0017\u0003\u0017\u0003\u0017\u0005\u0017\u00e2\n\u0017\u0003\u0018",
    "\u0003\u0018\u0003\u0019\u0003\u0019\u0003\u0019\u0003\u001a\u0003\u001a",
    "\u0003\u001a\u0003\u001b\u0006\u001b\u00ed\n\u001b\r\u001b\u000e\u001b",
    "\u00ee\u0003\u001b\u0002\u0003\b\u001c\u0002\u0004\u0006\b\n\f\u000e",
    "\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e \"$&(*,.024\u0002\u0005",
    "\u0003\u0002\n\u000f\u0003\u0002\u0010\u0011\u0003\u0002\u001c\u001d",
    "\u00f0\u00026\u0003\u0002\u0002\u0002\u00049\u0003\u0002\u0002\u0002",
    "\u0006A\u0003\u0002\u0002\u0002\bd\u0003\u0002\u0002\u0002\nq\u0003",
    "\u0002\u0002\u0002\fs\u0003\u0002\u0002\u0002\u000ez\u0003\u0002\u0002",
    "\u0002\u0010~\u0003\u0002\u0002\u0002\u0012\u0087\u0003\u0002\u0002",
    "\u0002\u0014\u008b\u0003\u0002\u0002\u0002\u0016\u0094\u0003\u0002\u0002",
    "\u0002\u0018\u0097\u0003\u0002\u0002\u0002\u001a\u00a0\u0003\u0002\u0002",
    "\u0002\u001c\u00a3\u0003\u0002\u0002\u0002\u001e\u00ac\u0003\u0002\u0002",
    "\u0002 \u00b0\u0003\u0002\u0002\u0002\"\u00bb\u0003\u0002\u0002\u0002",
    "$\u00c5\u0003\u0002\u0002\u0002&\u00c7\u0003\u0002\u0002\u0002(\u00d3",
    "\u0003\u0002\u0002\u0002*\u00da\u0003\u0002\u0002\u0002,\u00e1\u0003",
    "\u0002\u0002\u0002.\u00e3\u0003\u0002\u0002\u00020\u00e5\u0003\u0002",
    "\u0002\u00022\u00e8\u0003\u0002\u0002\u00024\u00ec\u0003\u0002\u0002",
    "\u000267\u0005\u0004\u0003\u000278\u0007\u0002\u0002\u00038\u0003\u0003",
    "\u0002\u0002\u00029>\u0005(\u0015\u0002:;\u0007\u0003\u0002\u0002;=",
    "\u0005(\u0015\u0002<:\u0003\u0002\u0002\u0002=@\u0003\u0002\u0002\u0002",
    "><\u0003\u0002\u0002\u0002>?\u0003\u0002\u0002\u0002?\u0005\u0003\u0002",
    "\u0002\u0002@>\u0003\u0002\u0002\u0002AB\u0005\b\u0005\u0002BC\u0007",
    "\u0002\u0002\u0003C\u0007\u0003\u0002\u0002\u0002DE\b\u0005\u0001\u0002",
    "EF\u0005$\u0013\u0002FG\u0005\n\u0006\u0002GH\u0005$\u0013\u0002He\u0003",
    "\u0002\u0002\u0002IJ\u0005$\u0013\u0002JK\u0007\u0012\u0002\u0002KL",
    "\u0007\u0004\u0002\u0002LQ\u0005$\u0013\u0002MN\u0007\u0003\u0002\u0002",
    "NP\u0005$\u0013\u0002OM\u0003\u0002\u0002\u0002PS\u0003\u0002\u0002",
    "\u0002QO\u0003\u0002\u0002\u0002QR\u0003\u0002\u0002\u0002RT\u0003\u0002",
    "\u0002\u0002SQ\u0003\u0002\u0002\u0002TU\u0007\u0005\u0002\u0002Ue\u0003",
    "\u0002\u0002\u0002VW\u0005$\u0013\u0002WX\u0007\u0013\u0002\u0002XY",
    "\u0005$\u0013\u0002YZ\u0007\u0015\u0002\u0002Z[\u0005$\u0013\u0002[",
    "e\u0003\u0002\u0002\u0002\\e\u0005&\u0014\u0002]^\u0007\u0004\u0002",
    "\u0002^_\u0005\b\u0005\u0002_`\u0007\u0005\u0002\u0002`a\b\u0005\u0001",
    "\u0002ae\u0003\u0002\u0002\u0002bc\u0007\u0014\u0002\u0002ce\u0005\b",
    "\u0005\u0005dD\u0003\u0002\u0002\u0002dI\u0003\u0002\u0002\u0002dV\u0003",
    "\u0002\u0002\u0002d\\\u0003\u0002\u0002\u0002d]\u0003\u0002\u0002\u0002",
    "db\u0003\u0002\u0002\u0002en\u0003\u0002\u0002\u0002fg\f\u0004\u0002",
    "\u0002gh\u0007\u0015\u0002\u0002hm\u0005\b\u0005\u0005ij\f\u0003\u0002",
    "\u0002jk\u0007\u0016\u0002\u0002km\u0005\b\u0005\u0004lf\u0003\u0002",
    "\u0002\u0002li\u0003\u0002\u0002\u0002mp\u0003\u0002\u0002\u0002nl\u0003",
    "\u0002\u0002\u0002no\u0003\u0002\u0002\u0002o\t\u0003\u0002\u0002\u0002",
    "pn\u0003\u0002\u0002\u0002qr\t\u0002\u0002\u0002r\u000b\u0003\u0002",
    "\u0002\u0002st\u0005\u000e\b\u0002tu\u0007\u0002\u0002\u0003u\r\u0003",
    "\u0002\u0002\u0002v{\u0005\u0010\t\u0002w{\u0005\u0014\u000b\u0002x",
    "{\u0005\u0018\r\u0002y{\u0005\u001c\u000f\u0002zv\u0003\u0002\u0002",
    "\u0002zw\u0003\u0002\u0002\u0002zx\u0003\u0002\u0002\u0002zy\u0003\u0002",
    "\u0002\u0002{|\u0003\u0002\u0002\u0002|z\u0003\u0002\u0002\u0002|}\u0003",
    "\u0002\u0002\u0002}\u000f\u0003\u0002\u0002\u0002~\u007f\u0007\u0017",
    "\u0002\u0002\u007f\u0084\u0005\u0012\n\u0002\u0080\u0081\u0007\u0003",
    "\u0002\u0002\u0081\u0083\u0005\u0012\n\u0002\u0082\u0080\u0003\u0002",
    "\u0002\u0002\u0083\u0086\u0003\u0002\u0002\u0002\u0084\u0082\u0003\u0002",
    "\u0002\u0002\u0084\u0085\u0003\u0002\u0002\u0002\u0085\u0011\u0003\u0002",
    "\u0002\u0002\u0086\u0084\u0003\u0002\u0002\u0002\u0087\u0088\u0005(",
    "\u0015\u0002\u0088\u0089\u0007\n\u0002\u0002\u0089\u008a\u0005 \u0011",
    "\u0002\u008a\u0013\u0003\u0002\u0002\u0002\u008b\u008c\u0007\u0018\u0002",
    "\u0002\u008c\u0091\u0005\u0016\f\u0002\u008d\u008e\u0007\u0003\u0002",
    "\u0002\u008e\u0090\u0005\u0016\f\u0002\u008f\u008d\u0003\u0002\u0002",
    "\u0002\u0090\u0093\u0003\u0002\u0002\u0002\u0091\u008f\u0003\u0002\u0002",
    "\u0002\u0091\u0092\u0003\u0002\u0002\u0002\u0092\u0015\u0003\u0002\u0002",
    "\u0002\u0093\u0091\u0003\u0002\u0002\u0002\u0094\u0095\u0005(\u0015",
    "\u0002\u0095\u0096\u0005.\u0018\u0002\u0096\u0017\u0003\u0002\u0002",
    "\u0002\u0097\u0098\u0007\u0019\u0002\u0002\u0098\u009d\u0005\u001a\u000e",
    "\u0002\u0099\u009a\u0007\u0003\u0002\u0002\u009a\u009c\u0005\u001a\u000e",
    "\u0002\u009b\u0099\u0003\u0002\u0002\u0002\u009c\u009f\u0003\u0002\u0002",
    "\u0002\u009d\u009b\u0003\u0002\u0002\u0002\u009d\u009e\u0003\u0002\u0002",
    "\u0002\u009e\u0019\u0003\u0002\u0002\u0002\u009f\u009d\u0003\u0002\u0002",
    "\u0002\u00a0\u00a1\u0005(\u0015\u0002\u00a1\u00a2\u0005.\u0018\u0002",
    "\u00a2\u001b\u0003\u0002\u0002\u0002\u00a3\u00a4\u0007\u001a\u0002\u0002",
    "\u00a4\u00a9\u0005\u001e\u0010\u0002\u00a5\u00a6\u0007\u0003\u0002\u0002",
    "\u00a6\u00a8\u0005\u001e\u0010\u0002\u00a7\u00a5\u0003\u0002\u0002\u0002",
    "\u00a8\u00ab\u0003\u0002\u0002\u0002\u00a9\u00a7\u0003\u0002\u0002\u0002",
    "\u00a9\u00aa\u0003\u0002\u0002\u0002\u00aa\u001d\u0003\u0002\u0002\u0002",
    "\u00ab\u00a9\u0003\u0002\u0002\u0002\u00ac\u00ad\u0005(\u0015\u0002",
    "\u00ad\u001f\u0003\u0002\u0002\u0002\u00ae\u00b1\u0005$\u0013\u0002",
    "\u00af\u00b1\u0005\"\u0012\u0002\u00b0\u00ae\u0003\u0002\u0002\u0002",
    "\u00b0\u00af\u0003\u0002\u0002\u0002\u00b1!\u0003\u0002\u0002\u0002",
    "\u00b2\u00b3\u0005$\u0013\u0002\u00b3\u00b4\t\u0003\u0002\u0002\u00b4",
    "\u00b5\u0005$\u0013\u0002\u00b5\u00bc\u0003\u0002\u0002\u0002\u00b6",
    "\u00b7\u0007\u0004\u0002\u0002\u00b7\u00b8\u0005\"\u0012\u0002\u00b8",
    "\u00b9\u0007\u0005\u0002\u0002\u00b9\u00ba\b\u0012\u0001\u0002\u00ba",
    "\u00bc\u0003\u0002\u0002\u0002\u00bb\u00b2\u0003\u0002\u0002\u0002\u00bb",
    "\u00b6\u0003\u0002\u0002\u0002\u00bc#\u0003\u0002\u0002\u0002\u00bd",
    "\u00c6\u0005(\u0015\u0002\u00be\u00c6\u0005.\u0018\u0002\u00bf\u00c6",
    "\u0005&\u0014\u0002\u00c0\u00c1\u0007\u0004\u0002\u0002\u00c1\u00c2",
    "\u0005$\u0013\u0002\u00c2\u00c3\u0007\u0005\u0002\u0002\u00c3\u00c4",
    "\b\u0013\u0001\u0002\u00c4\u00c6\u0003\u0002\u0002\u0002\u00c5\u00bd",
    "\u0003\u0002\u0002\u0002\u00c5\u00be\u0003\u0002\u0002\u0002\u00c5\u00bf",
    "\u0003\u0002\u0002\u0002\u00c5\u00c0\u0003\u0002\u0002\u0002\u00c6%",
    "\u0003\u0002\u0002\u0002\u00c7\u00c8\u0007\u001c\u0002\u0002\u00c8\u00c9",
    "\u0007\u0004\u0002\u0002\u00c9\u00ce\u0005$\u0013\u0002\u00ca\u00cb",
    "\u0007\u0003\u0002\u0002\u00cb\u00cd\u0005$\u0013\u0002\u00cc\u00ca",
    "\u0003\u0002\u0002\u0002\u00cd\u00d0\u0003\u0002\u0002\u0002\u00ce\u00cc",
    "\u0003\u0002\u0002\u0002\u00ce\u00cf\u0003\u0002\u0002\u0002\u00cf\u00d1",
    "\u0003\u0002\u0002\u0002\u00d0\u00ce\u0003\u0002\u0002\u0002\u00d1\u00d2",
    "\u0007\u0005\u0002\u0002\u00d2\'\u0003\u0002\u0002\u0002\u00d3\u00d7",
    "\u0005*\u0016\u0002\u00d4\u00d6\u0005,\u0017\u0002\u00d5\u00d4\u0003",
    "\u0002\u0002\u0002\u00d6\u00d9\u0003\u0002\u0002\u0002\u00d7\u00d5\u0003",
    "\u0002\u0002\u0002\u00d7\u00d8\u0003\u0002\u0002\u0002\u00d8)\u0003",
    "\u0002\u0002\u0002\u00d9\u00d7\u0003\u0002\u0002\u0002\u00da\u00db\t",
    "\u0004\u0002\u0002\u00db+\u0003\u0002\u0002\u0002\u00dc\u00dd\u0007",
    "\u0006\u0002\u0002\u00dd\u00e2\u0005*\u0016\u0002\u00de\u00df\u0007",
    "\u0007\u0002\u0002\u00df\u00e0\u0007\u001b\u0002\u0002\u00e0\u00e2\u0007",
    "\b\u0002\u0002\u00e1\u00dc\u0003\u0002\u0002\u0002\u00e1\u00de\u0003",
    "\u0002\u0002\u0002\u00e2-\u0003\u0002\u0002\u0002\u00e3\u00e4\u0007",
    "\u001e\u0002\u0002\u00e4/\u0003\u0002\u0002\u0002\u00e5\u00e6\u0007",
    "\u001d\u0002\u0002\u00e6\u00e7\u0007\u0002\u0002\u0003\u00e71\u0003",
    "\u0002\u0002\u0002\u00e8\u00e9\u0007\u001e\u0002\u0002\u00e9\u00ea\u0007",
    "\u0002\u0002\u0003\u00ea3\u0003\u0002\u0002\u0002\u00eb\u00ed\u0007",
    " \u0002\u0002\u00ec\u00eb\u0003\u0002\u0002\u0002\u00ed\u00ee\u0003",
    "\u0002\u0002\u0002\u00ee\u00ec\u0003\u0002\u0002\u0002\u00ee\u00ef\u0003",
    "\u0002\u0002\u0002\u00ef5\u0003\u0002\u0002\u0002\u0014>Qdlnz|\u0084",
    "\u0091\u009d\u00a9\u00b0\u00bb\u00c5\u00ce\u00d7\u00e1\u00ee"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "','", "'('", "')'", "'.'", "'['", "']'", null, 
                     "'='", "'<>'", "'<'", "'<='", "'>'", "'>='", "'+'", 
                     "'-'" ];

var symbolicNames = [ null, null, null, null, null, null, null, "WS", "EQ", 
                      "NE", "LT", "LE", "GT", "GE", "PLUS", "MINUS", "IN", 
                      "BETWEEN", "NOT", "AND", "OR", "SET", "ADD", "DELETE", 
                      "REMOVE", "INDEX", "ID", "ATTRIBUTE_NAME_SUB", "LITERAL_SUB", 
                      "STRING_LITERAL", "UNKNOWN" ];

var ruleNames =  [ "projection_", "projection", "condition_", "condition", 
                   "comparator_symbol", "update_", "update", "set_section", 
                   "set_action", "add_section", "add_action", "delete_section", 
                   "delete_action", "remove_section", "remove_action", "set_value", 
                   "arithmetic", "operand", "func", "path", "id", "dereference", 
                   "literal", "expression_attr_names_sub", "expression_attr_values_sub", 
                   "unknown" ];

function DynamoDbGrammarParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;

	//    private static void validateRedundantParentheses(boolean redundantParens) {
	    this.validateRedundantParentheses = function(redundantParens) {
	        if (redundantParens) {
	//            throw new RedundantParenthesesException();
	              throw new Error('RedundantParenthesesException')
	        }
	    }

    return this;
}

DynamoDbGrammarParser.prototype = Object.create(antlr4.Parser.prototype);
DynamoDbGrammarParser.prototype.constructor = DynamoDbGrammarParser;

Object.defineProperty(DynamoDbGrammarParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

DynamoDbGrammarParser.EOF = antlr4.Token.EOF;
DynamoDbGrammarParser.T__0 = 1;
DynamoDbGrammarParser.T__1 = 2;
DynamoDbGrammarParser.T__2 = 3;
DynamoDbGrammarParser.T__3 = 4;
DynamoDbGrammarParser.T__4 = 5;
DynamoDbGrammarParser.T__5 = 6;
DynamoDbGrammarParser.WS = 7;
DynamoDbGrammarParser.EQ = 8;
DynamoDbGrammarParser.NE = 9;
DynamoDbGrammarParser.LT = 10;
DynamoDbGrammarParser.LE = 11;
DynamoDbGrammarParser.GT = 12;
DynamoDbGrammarParser.GE = 13;
DynamoDbGrammarParser.PLUS = 14;
DynamoDbGrammarParser.MINUS = 15;
DynamoDbGrammarParser.IN = 16;
DynamoDbGrammarParser.BETWEEN = 17;
DynamoDbGrammarParser.NOT = 18;
DynamoDbGrammarParser.AND = 19;
DynamoDbGrammarParser.OR = 20;
DynamoDbGrammarParser.SET = 21;
DynamoDbGrammarParser.ADD = 22;
DynamoDbGrammarParser.DELETE = 23;
DynamoDbGrammarParser.REMOVE = 24;
DynamoDbGrammarParser.INDEX = 25;
DynamoDbGrammarParser.ID = 26;
DynamoDbGrammarParser.ATTRIBUTE_NAME_SUB = 27;
DynamoDbGrammarParser.LITERAL_SUB = 28;
DynamoDbGrammarParser.STRING_LITERAL = 29;
DynamoDbGrammarParser.UNKNOWN = 30;

DynamoDbGrammarParser.RULE_projection_ = 0;
DynamoDbGrammarParser.RULE_projection = 1;
DynamoDbGrammarParser.RULE_condition_ = 2;
DynamoDbGrammarParser.RULE_condition = 3;
DynamoDbGrammarParser.RULE_comparator_symbol = 4;
DynamoDbGrammarParser.RULE_update_ = 5;
DynamoDbGrammarParser.RULE_update = 6;
DynamoDbGrammarParser.RULE_set_section = 7;
DynamoDbGrammarParser.RULE_set_action = 8;
DynamoDbGrammarParser.RULE_add_section = 9;
DynamoDbGrammarParser.RULE_add_action = 10;
DynamoDbGrammarParser.RULE_delete_section = 11;
DynamoDbGrammarParser.RULE_delete_action = 12;
DynamoDbGrammarParser.RULE_remove_section = 13;
DynamoDbGrammarParser.RULE_remove_action = 14;
DynamoDbGrammarParser.RULE_set_value = 15;
DynamoDbGrammarParser.RULE_arithmetic = 16;
DynamoDbGrammarParser.RULE_operand = 17;
DynamoDbGrammarParser.RULE_func = 18;
DynamoDbGrammarParser.RULE_path = 19;
DynamoDbGrammarParser.RULE_id = 20;
DynamoDbGrammarParser.RULE_dereference = 21;
DynamoDbGrammarParser.RULE_literal = 22;
DynamoDbGrammarParser.RULE_expression_attr_names_sub = 23;
DynamoDbGrammarParser.RULE_expression_attr_values_sub = 24;
DynamoDbGrammarParser.RULE_unknown = 25;

function Projection_Context(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_projection_;
    return this;
}

Projection_Context.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Projection_Context.prototype.constructor = Projection_Context;

Projection_Context.prototype.projection = function() {
    return this.getTypedRuleContext(ProjectionContext,0);
};

Projection_Context.prototype.EOF = function() {
    return this.getToken(DynamoDbGrammarParser.EOF, 0);
};

Projection_Context.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterProjection_(this);
	}
};

Projection_Context.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitProjection_(this);
	}
};




DynamoDbGrammarParser.Projection_Context = Projection_Context;

DynamoDbGrammarParser.prototype.projection_ = function() {

    var localctx = new Projection_Context(this, this._ctx, this.state);
    this.enterRule(localctx, 0, DynamoDbGrammarParser.RULE_projection_);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 52;
        this.projection();
        this.state = 53;
        this.match(DynamoDbGrammarParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ProjectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_projection;
    return this;
}

ProjectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ProjectionContext.prototype.constructor = ProjectionContext;

ProjectionContext.prototype.path = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(PathContext);
    } else {
        return this.getTypedRuleContext(PathContext,i);
    }
};

ProjectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterProjection(this);
	}
};

ProjectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitProjection(this);
	}
};




DynamoDbGrammarParser.ProjectionContext = ProjectionContext;

DynamoDbGrammarParser.prototype.projection = function() {

    var localctx = new ProjectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, DynamoDbGrammarParser.RULE_projection);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 55;
        this.path();
        this.state = 60;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===DynamoDbGrammarParser.T__0) {
            this.state = 56;
            this.match(DynamoDbGrammarParser.T__0);
            this.state = 57;
            this.path();
            this.state = 62;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Condition_Context(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_condition_;
    return this;
}

Condition_Context.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Condition_Context.prototype.constructor = Condition_Context;

Condition_Context.prototype.condition = function() {
    return this.getTypedRuleContext(ConditionContext,0);
};

Condition_Context.prototype.EOF = function() {
    return this.getToken(DynamoDbGrammarParser.EOF, 0);
};

Condition_Context.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterCondition_(this);
	}
};

Condition_Context.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitCondition_(this);
	}
};




DynamoDbGrammarParser.Condition_Context = Condition_Context;

DynamoDbGrammarParser.prototype.condition_ = function() {

    var localctx = new Condition_Context(this, this._ctx, this.state);
    this.enterRule(localctx, 4, DynamoDbGrammarParser.RULE_condition_);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 63;
        this.condition(0);
        this.state = 64;
        this.match(DynamoDbGrammarParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConditionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_condition;
    this.hasOuterParens = false
    return this;
}

ConditionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConditionContext.prototype.constructor = ConditionContext;


 
ConditionContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
    this.hasOuterParens = ctx.hasOuterParens;
};

function OrContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

OrContext.prototype = Object.create(ConditionContext.prototype);
OrContext.prototype.constructor = OrContext;

DynamoDbGrammarParser.OrContext = OrContext;

OrContext.prototype.condition = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ConditionContext);
    } else {
        return this.getTypedRuleContext(ConditionContext,i);
    }
};

OrContext.prototype.OR = function() {
    return this.getToken(DynamoDbGrammarParser.OR, 0);
};
OrContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterOr(this);
	}
};

OrContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitOr(this);
	}
};


function NegationContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NegationContext.prototype = Object.create(ConditionContext.prototype);
NegationContext.prototype.constructor = NegationContext;

DynamoDbGrammarParser.NegationContext = NegationContext;

NegationContext.prototype.NOT = function() {
    return this.getToken(DynamoDbGrammarParser.NOT, 0);
};

NegationContext.prototype.condition = function() {
    return this.getTypedRuleContext(ConditionContext,0);
};
NegationContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterNegation(this);
	}
};

NegationContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitNegation(this);
	}
};


function InContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

InContext.prototype = Object.create(ConditionContext.prototype);
InContext.prototype.constructor = InContext;

DynamoDbGrammarParser.InContext = InContext;

InContext.prototype.operand = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(OperandContext);
    } else {
        return this.getTypedRuleContext(OperandContext,i);
    }
};

InContext.prototype.IN = function() {
    return this.getToken(DynamoDbGrammarParser.IN, 0);
};
InContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterIn(this);
	}
};

InContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitIn(this);
	}
};


function AndContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AndContext.prototype = Object.create(ConditionContext.prototype);
AndContext.prototype.constructor = AndContext;

DynamoDbGrammarParser.AndContext = AndContext;

AndContext.prototype.condition = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ConditionContext);
    } else {
        return this.getTypedRuleContext(ConditionContext,i);
    }
};

AndContext.prototype.AND = function() {
    return this.getToken(DynamoDbGrammarParser.AND, 0);
};
AndContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterAnd(this);
	}
};

AndContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitAnd(this);
	}
};


function BetweenContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

BetweenContext.prototype = Object.create(ConditionContext.prototype);
BetweenContext.prototype.constructor = BetweenContext;

DynamoDbGrammarParser.BetweenContext = BetweenContext;

BetweenContext.prototype.operand = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(OperandContext);
    } else {
        return this.getTypedRuleContext(OperandContext,i);
    }
};

BetweenContext.prototype.BETWEEN = function() {
    return this.getToken(DynamoDbGrammarParser.BETWEEN, 0);
};

BetweenContext.prototype.AND = function() {
    return this.getToken(DynamoDbGrammarParser.AND, 0);
};
BetweenContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterBetween(this);
	}
};

BetweenContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitBetween(this);
	}
};


function FunctionConditionContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionConditionContext.prototype = Object.create(ConditionContext.prototype);
FunctionConditionContext.prototype.constructor = FunctionConditionContext;

DynamoDbGrammarParser.FunctionConditionContext = FunctionConditionContext;

FunctionConditionContext.prototype.func = function() {
    return this.getTypedRuleContext(FuncContext,0);
};
FunctionConditionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterFunctionCondition(this);
	}
};

FunctionConditionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitFunctionCondition(this);
	}
};


function ComparatorContext(parser, ctx) {
	ConditionContext.call(this, parser);
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ComparatorContext.prototype = Object.create(ConditionContext.prototype);
ComparatorContext.prototype.constructor = ComparatorContext;

DynamoDbGrammarParser.ComparatorContext = ComparatorContext;

ComparatorContext.prototype.operand = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(OperandContext);
    } else {
        return this.getTypedRuleContext(OperandContext,i);
    }
};

ComparatorContext.prototype.comparator_symbol = function() {
    return this.getTypedRuleContext(Comparator_symbolContext,0);
};
ComparatorContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterComparator(this);
	}
};

ComparatorContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitComparator(this);
	}
};


function ConditionGroupingContext(parser, ctx) {
	ConditionContext.call(this, parser);
    this.c = null; // ConditionContext;
    ConditionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ConditionGroupingContext.prototype = Object.create(ConditionContext.prototype);
ConditionGroupingContext.prototype.constructor = ConditionGroupingContext;

DynamoDbGrammarParser.ConditionGroupingContext = ConditionGroupingContext;

ConditionGroupingContext.prototype.condition = function() {
    return this.getTypedRuleContext(ConditionContext,0);
};
ConditionGroupingContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterConditionGrouping(this);
	}
};

ConditionGroupingContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitConditionGrouping(this);
	}
};



DynamoDbGrammarParser.prototype.condition = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ConditionContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 6;
    this.enterRecursionRule(localctx, 6, DynamoDbGrammarParser.RULE_condition, _p);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 98;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
        switch(la_) {
        case 1:
            localctx = new ComparatorContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 67;
            this.operand();
            this.state = 68;
            this.comparator_symbol();
            this.state = 69;
            this.operand();
            break;

        case 2:
            localctx = new InContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 71;
            this.operand();
            this.state = 72;
            this.match(DynamoDbGrammarParser.IN);
            this.state = 73;
            this.match(DynamoDbGrammarParser.T__1);
            this.state = 74;
            this.operand();
            this.state = 79;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===DynamoDbGrammarParser.T__0) {
                this.state = 75;
                this.match(DynamoDbGrammarParser.T__0);
                this.state = 76;
                this.operand();
                this.state = 81;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 82;
            this.match(DynamoDbGrammarParser.T__2);
            break;

        case 3:
            localctx = new BetweenContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 84;
            this.operand();
            this.state = 85;
            this.match(DynamoDbGrammarParser.BETWEEN);
            this.state = 86;
            this.operand();
            this.state = 87;
            this.match(DynamoDbGrammarParser.AND);
            this.state = 88;
            this.operand();
            break;

        case 4:
            localctx = new FunctionConditionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 90;
            this.func();
            break;

        case 5:
            localctx = new ConditionGroupingContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 91;
            this.match(DynamoDbGrammarParser.T__1);
            this.state = 92;
            localctx.c = this.condition(0);
            this.state = 93;
            this.match(DynamoDbGrammarParser.T__2);

                        this.validateRedundantParentheses(localctx.c.hasOuterParens);
                        localctx.hasOuterParens = true
                    
            break;

        case 6:
            localctx = new NegationContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 96;
            this.match(DynamoDbGrammarParser.NOT);
            this.state = 97;
            this.condition(3);
            break;

        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 108;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,4,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 106;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new AndContext(this, new ConditionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, DynamoDbGrammarParser.RULE_condition);
                    this.state = 100;
                    if (!( this.precpred(this._ctx, 2))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
                    }
                    this.state = 101;
                    this.match(DynamoDbGrammarParser.AND);
                    this.state = 102;
                    this.condition(3);
                    break;

                case 2:
                    localctx = new OrContext(this, new ConditionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, DynamoDbGrammarParser.RULE_condition);
                    this.state = 103;
                    if (!( this.precpred(this._ctx, 1))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
                    }
                    this.state = 104;
                    this.match(DynamoDbGrammarParser.OR);
                    this.state = 105;
                    this.condition(2);
                    break;

                } 
            }
            this.state = 110;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,4,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function Comparator_symbolContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_comparator_symbol;
    return this;
}

Comparator_symbolContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Comparator_symbolContext.prototype.constructor = Comparator_symbolContext;


Comparator_symbolContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterComparator_symbol(this);
	}
};

Comparator_symbolContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitComparator_symbol(this);
	}
};




DynamoDbGrammarParser.Comparator_symbolContext = Comparator_symbolContext;

DynamoDbGrammarParser.prototype.comparator_symbol = function() {

    var localctx = new Comparator_symbolContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, DynamoDbGrammarParser.RULE_comparator_symbol);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 111;
        _la = this._input.LA(1);
        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << DynamoDbGrammarParser.EQ) | (1 << DynamoDbGrammarParser.NE) | (1 << DynamoDbGrammarParser.LT) | (1 << DynamoDbGrammarParser.LE) | (1 << DynamoDbGrammarParser.GT) | (1 << DynamoDbGrammarParser.GE))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Update_Context(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_update_;
    return this;
}

Update_Context.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Update_Context.prototype.constructor = Update_Context;

Update_Context.prototype.update = function() {
    return this.getTypedRuleContext(UpdateContext,0);
};

Update_Context.prototype.EOF = function() {
    return this.getToken(DynamoDbGrammarParser.EOF, 0);
};

Update_Context.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterUpdate_(this);
	}
};

Update_Context.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitUpdate_(this);
	}
};




DynamoDbGrammarParser.Update_Context = Update_Context;

DynamoDbGrammarParser.prototype.update_ = function() {

    var localctx = new Update_Context(this, this._ctx, this.state);
    this.enterRule(localctx, 10, DynamoDbGrammarParser.RULE_update_);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 113;
        this.update();
        this.state = 114;
        this.match(DynamoDbGrammarParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function UpdateContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_update;
    return this;
}

UpdateContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UpdateContext.prototype.constructor = UpdateContext;

UpdateContext.prototype.set_section = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Set_sectionContext);
    } else {
        return this.getTypedRuleContext(Set_sectionContext,i);
    }
};

UpdateContext.prototype.add_section = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Add_sectionContext);
    } else {
        return this.getTypedRuleContext(Add_sectionContext,i);
    }
};

UpdateContext.prototype.delete_section = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Delete_sectionContext);
    } else {
        return this.getTypedRuleContext(Delete_sectionContext,i);
    }
};

UpdateContext.prototype.remove_section = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Remove_sectionContext);
    } else {
        return this.getTypedRuleContext(Remove_sectionContext,i);
    }
};

UpdateContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterUpdate(this);
	}
};

UpdateContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitUpdate(this);
	}
};




DynamoDbGrammarParser.UpdateContext = UpdateContext;

DynamoDbGrammarParser.prototype.update = function() {

    var localctx = new UpdateContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, DynamoDbGrammarParser.RULE_update);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 120; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 120;
            switch(this._input.LA(1)) {
            case DynamoDbGrammarParser.SET:
                this.state = 116;
                this.set_section();
                break;
            case DynamoDbGrammarParser.ADD:
                this.state = 117;
                this.add_section();
                break;
            case DynamoDbGrammarParser.DELETE:
                this.state = 118;
                this.delete_section();
                break;
            case DynamoDbGrammarParser.REMOVE:
                this.state = 119;
                this.remove_section();
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
            this.state = 122; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << DynamoDbGrammarParser.SET) | (1 << DynamoDbGrammarParser.ADD) | (1 << DynamoDbGrammarParser.DELETE) | (1 << DynamoDbGrammarParser.REMOVE))) !== 0));
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Set_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_set_section;
    return this;
}

Set_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Set_sectionContext.prototype.constructor = Set_sectionContext;

Set_sectionContext.prototype.SET = function() {
    return this.getToken(DynamoDbGrammarParser.SET, 0);
};

Set_sectionContext.prototype.set_action = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Set_actionContext);
    } else {
        return this.getTypedRuleContext(Set_actionContext,i);
    }
};

Set_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterSet_section(this);
	}
};

Set_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitSet_section(this);
	}
};




DynamoDbGrammarParser.Set_sectionContext = Set_sectionContext;

DynamoDbGrammarParser.prototype.set_section = function() {

    var localctx = new Set_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, DynamoDbGrammarParser.RULE_set_section);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 124;
        this.match(DynamoDbGrammarParser.SET);
        this.state = 125;
        this.set_action();
        this.state = 130;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===DynamoDbGrammarParser.T__0) {
            this.state = 126;
            this.match(DynamoDbGrammarParser.T__0);
            this.state = 127;
            this.set_action();
            this.state = 132;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Set_actionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_set_action;
    return this;
}

Set_actionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Set_actionContext.prototype.constructor = Set_actionContext;

Set_actionContext.prototype.path = function() {
    return this.getTypedRuleContext(PathContext,0);
};

Set_actionContext.prototype.set_value = function() {
    return this.getTypedRuleContext(Set_valueContext,0);
};

Set_actionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterSet_action(this);
	}
};

Set_actionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitSet_action(this);
	}
};




DynamoDbGrammarParser.Set_actionContext = Set_actionContext;

DynamoDbGrammarParser.prototype.set_action = function() {

    var localctx = new Set_actionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, DynamoDbGrammarParser.RULE_set_action);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 133;
        this.path();
        this.state = 134;
        this.match(DynamoDbGrammarParser.EQ);
        this.state = 135;
        this.set_value();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Add_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_add_section;
    return this;
}

Add_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Add_sectionContext.prototype.constructor = Add_sectionContext;

Add_sectionContext.prototype.ADD = function() {
    return this.getToken(DynamoDbGrammarParser.ADD, 0);
};

Add_sectionContext.prototype.add_action = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Add_actionContext);
    } else {
        return this.getTypedRuleContext(Add_actionContext,i);
    }
};

Add_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterAdd_section(this);
	}
};

Add_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitAdd_section(this);
	}
};




DynamoDbGrammarParser.Add_sectionContext = Add_sectionContext;

DynamoDbGrammarParser.prototype.add_section = function() {

    var localctx = new Add_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, DynamoDbGrammarParser.RULE_add_section);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 137;
        this.match(DynamoDbGrammarParser.ADD);
        this.state = 138;
        this.add_action();
        this.state = 143;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===DynamoDbGrammarParser.T__0) {
            this.state = 139;
            this.match(DynamoDbGrammarParser.T__0);
            this.state = 140;
            this.add_action();
            this.state = 145;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Add_actionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_add_action;
    return this;
}

Add_actionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Add_actionContext.prototype.constructor = Add_actionContext;

Add_actionContext.prototype.path = function() {
    return this.getTypedRuleContext(PathContext,0);
};

Add_actionContext.prototype.literal = function() {
    return this.getTypedRuleContext(LiteralContext,0);
};

Add_actionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterAdd_action(this);
	}
};

Add_actionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitAdd_action(this);
	}
};




DynamoDbGrammarParser.Add_actionContext = Add_actionContext;

DynamoDbGrammarParser.prototype.add_action = function() {

    var localctx = new Add_actionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, DynamoDbGrammarParser.RULE_add_action);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 146;
        this.path();
        this.state = 147;
        this.literal();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Delete_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_delete_section;
    return this;
}

Delete_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Delete_sectionContext.prototype.constructor = Delete_sectionContext;

Delete_sectionContext.prototype.DELETE = function() {
    return this.getToken(DynamoDbGrammarParser.DELETE, 0);
};

Delete_sectionContext.prototype.delete_action = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Delete_actionContext);
    } else {
        return this.getTypedRuleContext(Delete_actionContext,i);
    }
};

Delete_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterDelete_section(this);
	}
};

Delete_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitDelete_section(this);
	}
};




DynamoDbGrammarParser.Delete_sectionContext = Delete_sectionContext;

DynamoDbGrammarParser.prototype.delete_section = function() {

    var localctx = new Delete_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, DynamoDbGrammarParser.RULE_delete_section);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 149;
        this.match(DynamoDbGrammarParser.DELETE);
        this.state = 150;
        this.delete_action();
        this.state = 155;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===DynamoDbGrammarParser.T__0) {
            this.state = 151;
            this.match(DynamoDbGrammarParser.T__0);
            this.state = 152;
            this.delete_action();
            this.state = 157;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Delete_actionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_delete_action;
    return this;
}

Delete_actionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Delete_actionContext.prototype.constructor = Delete_actionContext;

Delete_actionContext.prototype.path = function() {
    return this.getTypedRuleContext(PathContext,0);
};

Delete_actionContext.prototype.literal = function() {
    return this.getTypedRuleContext(LiteralContext,0);
};

Delete_actionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterDelete_action(this);
	}
};

Delete_actionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitDelete_action(this);
	}
};




DynamoDbGrammarParser.Delete_actionContext = Delete_actionContext;

DynamoDbGrammarParser.prototype.delete_action = function() {

    var localctx = new Delete_actionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, DynamoDbGrammarParser.RULE_delete_action);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 158;
        this.path();
        this.state = 159;
        this.literal();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Remove_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_remove_section;
    return this;
}

Remove_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Remove_sectionContext.prototype.constructor = Remove_sectionContext;

Remove_sectionContext.prototype.REMOVE = function() {
    return this.getToken(DynamoDbGrammarParser.REMOVE, 0);
};

Remove_sectionContext.prototype.remove_action = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Remove_actionContext);
    } else {
        return this.getTypedRuleContext(Remove_actionContext,i);
    }
};

Remove_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterRemove_section(this);
	}
};

Remove_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitRemove_section(this);
	}
};




DynamoDbGrammarParser.Remove_sectionContext = Remove_sectionContext;

DynamoDbGrammarParser.prototype.remove_section = function() {

    var localctx = new Remove_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, DynamoDbGrammarParser.RULE_remove_section);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 161;
        this.match(DynamoDbGrammarParser.REMOVE);
        this.state = 162;
        this.remove_action();
        this.state = 167;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===DynamoDbGrammarParser.T__0) {
            this.state = 163;
            this.match(DynamoDbGrammarParser.T__0);
            this.state = 164;
            this.remove_action();
            this.state = 169;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Remove_actionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_remove_action;
    return this;
}

Remove_actionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Remove_actionContext.prototype.constructor = Remove_actionContext;

Remove_actionContext.prototype.path = function() {
    return this.getTypedRuleContext(PathContext,0);
};

Remove_actionContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterRemove_action(this);
	}
};

Remove_actionContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitRemove_action(this);
	}
};




DynamoDbGrammarParser.Remove_actionContext = Remove_actionContext;

DynamoDbGrammarParser.prototype.remove_action = function() {

    var localctx = new Remove_actionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, DynamoDbGrammarParser.RULE_remove_action);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 170;
        this.path();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Set_valueContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_set_value;
    return this;
}

Set_valueContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Set_valueContext.prototype.constructor = Set_valueContext;


 
Set_valueContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function ArithmeticValueContext(parser, ctx) {
	Set_valueContext.call(this, parser);
    Set_valueContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ArithmeticValueContext.prototype = Object.create(Set_valueContext.prototype);
ArithmeticValueContext.prototype.constructor = ArithmeticValueContext;

DynamoDbGrammarParser.ArithmeticValueContext = ArithmeticValueContext;

ArithmeticValueContext.prototype.arithmetic = function() {
    return this.getTypedRuleContext(ArithmeticContext,0);
};
ArithmeticValueContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterArithmeticValue(this);
	}
};

ArithmeticValueContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitArithmeticValue(this);
	}
};


function OperandValueContext(parser, ctx) {
	Set_valueContext.call(this, parser);
    Set_valueContext.prototype.copyFrom.call(this, ctx);
    return this;
}

OperandValueContext.prototype = Object.create(Set_valueContext.prototype);
OperandValueContext.prototype.constructor = OperandValueContext;

DynamoDbGrammarParser.OperandValueContext = OperandValueContext;

OperandValueContext.prototype.operand = function() {
    return this.getTypedRuleContext(OperandContext,0);
};
OperandValueContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterOperandValue(this);
	}
};

OperandValueContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitOperandValue(this);
	}
};



DynamoDbGrammarParser.Set_valueContext = Set_valueContext;

DynamoDbGrammarParser.prototype.set_value = function() {

    var localctx = new Set_valueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, DynamoDbGrammarParser.RULE_set_value);
    try {
        this.state = 174;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,11,this._ctx);
        switch(la_) {
        case 1:
            localctx = new OperandValueContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 172;
            this.operand();
            break;

        case 2:
            localctx = new ArithmeticValueContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 173;
            this.arithmetic();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ArithmeticContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_arithmetic;
    this.hasOuterParens = false
    return this;
}

ArithmeticContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ArithmeticContext.prototype.constructor = ArithmeticContext;


 
ArithmeticContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
    this.hasOuterParens = ctx.hasOuterParens;
};


function PlusMinusContext(parser, ctx) {
	ArithmeticContext.call(this, parser);
    ArithmeticContext.prototype.copyFrom.call(this, ctx);
    return this;
}

PlusMinusContext.prototype = Object.create(ArithmeticContext.prototype);
PlusMinusContext.prototype.constructor = PlusMinusContext;

DynamoDbGrammarParser.PlusMinusContext = PlusMinusContext;

PlusMinusContext.prototype.operand = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(OperandContext);
    } else {
        return this.getTypedRuleContext(OperandContext,i);
    }
};
PlusMinusContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterPlusMinus(this);
	}
};

PlusMinusContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitPlusMinus(this);
	}
};


function ArithmeticParensContext(parser, ctx) {
	ArithmeticContext.call(this, parser);
    this.a = null; // ArithmeticContext;
    ArithmeticContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ArithmeticParensContext.prototype = Object.create(ArithmeticContext.prototype);
ArithmeticParensContext.prototype.constructor = ArithmeticParensContext;

DynamoDbGrammarParser.ArithmeticParensContext = ArithmeticParensContext;

ArithmeticParensContext.prototype.arithmetic = function() {
    return this.getTypedRuleContext(ArithmeticContext,0);
};
ArithmeticParensContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterArithmeticParens(this);
	}
};

ArithmeticParensContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitArithmeticParens(this);
	}
};



DynamoDbGrammarParser.ArithmeticContext = ArithmeticContext;

DynamoDbGrammarParser.prototype.arithmetic = function() {

    var localctx = new ArithmeticContext(this, this._ctx, this.state);
    this.enterRule(localctx, 32, DynamoDbGrammarParser.RULE_arithmetic);
    var _la = 0; // Token type
    try {
        this.state = 185;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,12,this._ctx);
        switch(la_) {
        case 1:
            localctx = new PlusMinusContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 176;
            this.operand();
            this.state = 177;
            _la = this._input.LA(1);
            if(!(_la===DynamoDbGrammarParser.PLUS || _la===DynamoDbGrammarParser.MINUS)) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            this.state = 178;
            this.operand();
            break;

        case 2:
            localctx = new ArithmeticParensContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 180;
            this.match(DynamoDbGrammarParser.T__1);
            this.state = 181;
            localctx.a = this.arithmetic();
            this.state = 182;
            this.match(DynamoDbGrammarParser.T__2);

                        this.validateRedundantParentheses(localctx.a.hasOuterParens);
                        localctx.hasOuterParens = true
                    
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function OperandContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_operand;
    this.hasOuterParens = false
    return this;
}

OperandContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
OperandContext.prototype.constructor = OperandContext;


 
OperandContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
    this.hasOuterParens = ctx.hasOuterParens;
};


function PathOperandContext(parser, ctx) {
	OperandContext.call(this, parser);
    OperandContext.prototype.copyFrom.call(this, ctx);
    return this;
}

PathOperandContext.prototype = Object.create(OperandContext.prototype);
PathOperandContext.prototype.constructor = PathOperandContext;

DynamoDbGrammarParser.PathOperandContext = PathOperandContext;

PathOperandContext.prototype.path = function() {
    return this.getTypedRuleContext(PathContext,0);
};
PathOperandContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterPathOperand(this);
	}
};

PathOperandContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitPathOperand(this);
	}
};


function LiteralOperandContext(parser, ctx) {
	OperandContext.call(this, parser);
    OperandContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LiteralOperandContext.prototype = Object.create(OperandContext.prototype);
LiteralOperandContext.prototype.constructor = LiteralOperandContext;

DynamoDbGrammarParser.LiteralOperandContext = LiteralOperandContext;

LiteralOperandContext.prototype.literal = function() {
    return this.getTypedRuleContext(LiteralContext,0);
};
LiteralOperandContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterLiteralOperand(this);
	}
};

LiteralOperandContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitLiteralOperand(this);
	}
};


function FunctionOperandContext(parser, ctx) {
	OperandContext.call(this, parser);
    OperandContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionOperandContext.prototype = Object.create(OperandContext.prototype);
FunctionOperandContext.prototype.constructor = FunctionOperandContext;

DynamoDbGrammarParser.FunctionOperandContext = FunctionOperandContext;

FunctionOperandContext.prototype.func = function() {
    return this.getTypedRuleContext(FuncContext,0);
};
FunctionOperandContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterFunctionOperand(this);
	}
};

FunctionOperandContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitFunctionOperand(this);
	}
};


function ParenOperandContext(parser, ctx) {
	OperandContext.call(this, parser);
    this.o = null; // OperandContext;
    OperandContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ParenOperandContext.prototype = Object.create(OperandContext.prototype);
ParenOperandContext.prototype.constructor = ParenOperandContext;

DynamoDbGrammarParser.ParenOperandContext = ParenOperandContext;

ParenOperandContext.prototype.operand = function() {
    return this.getTypedRuleContext(OperandContext,0);
};
ParenOperandContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterParenOperand(this);
	}
};

ParenOperandContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitParenOperand(this);
	}
};



DynamoDbGrammarParser.OperandContext = OperandContext;

DynamoDbGrammarParser.prototype.operand = function() {

    var localctx = new OperandContext(this, this._ctx, this.state);
    this.enterRule(localctx, 34, DynamoDbGrammarParser.RULE_operand);
    try {
        this.state = 195;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,13,this._ctx);
        switch(la_) {
        case 1:
            localctx = new PathOperandContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 187;
            this.path();
            break;

        case 2:
            localctx = new LiteralOperandContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 188;
            this.literal();
            break;

        case 3:
            localctx = new FunctionOperandContext(this, localctx);
            this.enterOuterAlt(localctx, 3);
            this.state = 189;
            this.func();
            break;

        case 4:
            localctx = new ParenOperandContext(this, localctx);
            this.enterOuterAlt(localctx, 4);
            this.state = 190;
            this.match(DynamoDbGrammarParser.T__1);
            this.state = 191;
            localctx.o = this.operand();
            this.state = 192;
            this.match(DynamoDbGrammarParser.T__2);

                        this.validateRedundantParentheses(localctx.o.hasOuterParens);
                        localctx.hasOuterParens = true
                    
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FuncContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_func;
    return this;
}

FuncContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FuncContext.prototype.constructor = FuncContext;


 
FuncContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function FunctionCallContext(parser, ctx) {
	FuncContext.call(this, parser);
    FuncContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionCallContext.prototype = Object.create(FuncContext.prototype);
FunctionCallContext.prototype.constructor = FunctionCallContext;

DynamoDbGrammarParser.FunctionCallContext = FunctionCallContext;

FunctionCallContext.prototype.ID = function() {
    return this.getToken(DynamoDbGrammarParser.ID, 0);
};

FunctionCallContext.prototype.operand = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(OperandContext);
    } else {
        return this.getTypedRuleContext(OperandContext,i);
    }
};
FunctionCallContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterFunctionCall(this);
	}
};

FunctionCallContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitFunctionCall(this);
	}
};



DynamoDbGrammarParser.FuncContext = FuncContext;

DynamoDbGrammarParser.prototype.func = function() {

    var localctx = new FuncContext(this, this._ctx, this.state);
    this.enterRule(localctx, 36, DynamoDbGrammarParser.RULE_func);
    var _la = 0; // Token type
    try {
        localctx = new FunctionCallContext(this, localctx);
        this.enterOuterAlt(localctx, 1);
        this.state = 197;
        this.match(DynamoDbGrammarParser.ID);
        this.state = 198;
        this.match(DynamoDbGrammarParser.T__1);
        this.state = 199;
        this.operand();
        this.state = 204;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===DynamoDbGrammarParser.T__0) {
            this.state = 200;
            this.match(DynamoDbGrammarParser.T__0);
            this.state = 201;
            this.operand();
            this.state = 206;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 207;
        this.match(DynamoDbGrammarParser.T__2);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function PathContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_path;
    return this;
}

PathContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PathContext.prototype.constructor = PathContext;

PathContext.prototype.id = function() {
    return this.getTypedRuleContext(IdContext,0);
};

PathContext.prototype.dereference = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(DereferenceContext);
    } else {
        return this.getTypedRuleContext(DereferenceContext,i);
    }
};

PathContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterPath(this);
	}
};

PathContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitPath(this);
	}
};




DynamoDbGrammarParser.PathContext = PathContext;

DynamoDbGrammarParser.prototype.path = function() {

    var localctx = new PathContext(this, this._ctx, this.state);
    this.enterRule(localctx, 38, DynamoDbGrammarParser.RULE_path);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 209;
        this.id();
        this.state = 213;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,15,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 210;
                this.dereference(); 
            }
            this.state = 215;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,15,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function IdContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_id;
    return this;
}

IdContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
IdContext.prototype.constructor = IdContext;

IdContext.prototype.ID = function() {
    return this.getToken(DynamoDbGrammarParser.ID, 0);
};

IdContext.prototype.ATTRIBUTE_NAME_SUB = function() {
    return this.getToken(DynamoDbGrammarParser.ATTRIBUTE_NAME_SUB, 0);
};

IdContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterId(this);
	}
};

IdContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitId(this);
	}
};




DynamoDbGrammarParser.IdContext = IdContext;

DynamoDbGrammarParser.prototype.id = function() {

    var localctx = new IdContext(this, this._ctx, this.state);
    this.enterRule(localctx, 40, DynamoDbGrammarParser.RULE_id);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 216;
        _la = this._input.LA(1);
        if(!(_la===DynamoDbGrammarParser.ID || _la===DynamoDbGrammarParser.ATTRIBUTE_NAME_SUB)) {
        this._errHandler.recoverInline(this);
        }
        else {
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function DereferenceContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_dereference;
    return this;
}

DereferenceContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DereferenceContext.prototype.constructor = DereferenceContext;


 
DereferenceContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function ListAccessContext(parser, ctx) {
	DereferenceContext.call(this, parser);
    DereferenceContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ListAccessContext.prototype = Object.create(DereferenceContext.prototype);
ListAccessContext.prototype.constructor = ListAccessContext;

DynamoDbGrammarParser.ListAccessContext = ListAccessContext;

ListAccessContext.prototype.INDEX = function() {
    return this.getToken(DynamoDbGrammarParser.INDEX, 0);
};
ListAccessContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterListAccess(this);
	}
};

ListAccessContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitListAccess(this);
	}
};


function MapAccessContext(parser, ctx) {
	DereferenceContext.call(this, parser);
    DereferenceContext.prototype.copyFrom.call(this, ctx);
    return this;
}

MapAccessContext.prototype = Object.create(DereferenceContext.prototype);
MapAccessContext.prototype.constructor = MapAccessContext;

DynamoDbGrammarParser.MapAccessContext = MapAccessContext;

MapAccessContext.prototype.id = function() {
    return this.getTypedRuleContext(IdContext,0);
};
MapAccessContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterMapAccess(this);
	}
};

MapAccessContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitMapAccess(this);
	}
};



DynamoDbGrammarParser.DereferenceContext = DereferenceContext;

DynamoDbGrammarParser.prototype.dereference = function() {

    var localctx = new DereferenceContext(this, this._ctx, this.state);
    this.enterRule(localctx, 42, DynamoDbGrammarParser.RULE_dereference);
    try {
        this.state = 223;
        switch(this._input.LA(1)) {
        case DynamoDbGrammarParser.T__3:
            localctx = new MapAccessContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 218;
            this.match(DynamoDbGrammarParser.T__3);
            this.state = 219;
            this.id();
            break;
        case DynamoDbGrammarParser.T__4:
            localctx = new ListAccessContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 220;
            this.match(DynamoDbGrammarParser.T__4);
            this.state = 221;
            this.match(DynamoDbGrammarParser.INDEX);
            this.state = 222;
            this.match(DynamoDbGrammarParser.T__5);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function LiteralContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_literal;
    return this;
}

LiteralContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LiteralContext.prototype.constructor = LiteralContext;


 
LiteralContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function LiteralSubContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LiteralSubContext.prototype = Object.create(LiteralContext.prototype);
LiteralSubContext.prototype.constructor = LiteralSubContext;

DynamoDbGrammarParser.LiteralSubContext = LiteralSubContext;

LiteralSubContext.prototype.LITERAL_SUB = function() {
    return this.getToken(DynamoDbGrammarParser.LITERAL_SUB, 0);
};
LiteralSubContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterLiteralSub(this);
	}
};

LiteralSubContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitLiteralSub(this);
	}
};



DynamoDbGrammarParser.LiteralContext = LiteralContext;

DynamoDbGrammarParser.prototype.literal = function() {

    var localctx = new LiteralContext(this, this._ctx, this.state);
    this.enterRule(localctx, 44, DynamoDbGrammarParser.RULE_literal);
    try {
        localctx = new LiteralSubContext(this, localctx);
        this.enterOuterAlt(localctx, 1);
        this.state = 225;
        this.match(DynamoDbGrammarParser.LITERAL_SUB);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_attr_names_subContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_expression_attr_names_sub;
    return this;
}

Expression_attr_names_subContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_attr_names_subContext.prototype.constructor = Expression_attr_names_subContext;

Expression_attr_names_subContext.prototype.ATTRIBUTE_NAME_SUB = function() {
    return this.getToken(DynamoDbGrammarParser.ATTRIBUTE_NAME_SUB, 0);
};

Expression_attr_names_subContext.prototype.EOF = function() {
    return this.getToken(DynamoDbGrammarParser.EOF, 0);
};

Expression_attr_names_subContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterExpression_attr_names_sub(this);
	}
};

Expression_attr_names_subContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitExpression_attr_names_sub(this);
	}
};




DynamoDbGrammarParser.Expression_attr_names_subContext = Expression_attr_names_subContext;

DynamoDbGrammarParser.prototype.expression_attr_names_sub = function() {

    var localctx = new Expression_attr_names_subContext(this, this._ctx, this.state);
    this.enterRule(localctx, 46, DynamoDbGrammarParser.RULE_expression_attr_names_sub);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 227;
        this.match(DynamoDbGrammarParser.ATTRIBUTE_NAME_SUB);
        this.state = 228;
        this.match(DynamoDbGrammarParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_attr_values_subContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_expression_attr_values_sub;
    return this;
}

Expression_attr_values_subContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_attr_values_subContext.prototype.constructor = Expression_attr_values_subContext;

Expression_attr_values_subContext.prototype.LITERAL_SUB = function() {
    return this.getToken(DynamoDbGrammarParser.LITERAL_SUB, 0);
};

Expression_attr_values_subContext.prototype.EOF = function() {
    return this.getToken(DynamoDbGrammarParser.EOF, 0);
};

Expression_attr_values_subContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterExpression_attr_values_sub(this);
	}
};

Expression_attr_values_subContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitExpression_attr_values_sub(this);
	}
};




DynamoDbGrammarParser.Expression_attr_values_subContext = Expression_attr_values_subContext;

DynamoDbGrammarParser.prototype.expression_attr_values_sub = function() {

    var localctx = new Expression_attr_values_subContext(this, this._ctx, this.state);
    this.enterRule(localctx, 48, DynamoDbGrammarParser.RULE_expression_attr_values_sub);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 230;
        this.match(DynamoDbGrammarParser.LITERAL_SUB);
        this.state = 231;
        this.match(DynamoDbGrammarParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function UnknownContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = DynamoDbGrammarParser.RULE_unknown;
    return this;
}

UnknownContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UnknownContext.prototype.constructor = UnknownContext;

UnknownContext.prototype.UNKNOWN = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(DynamoDbGrammarParser.UNKNOWN);
    } else {
        return this.getToken(DynamoDbGrammarParser.UNKNOWN, i);
    }
};


UnknownContext.prototype.enterRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.enterUnknown(this);
	}
};

UnknownContext.prototype.exitRule = function(listener) {
    if(listener instanceof DynamoDbGrammarListener ) {
        listener.exitUnknown(this);
	}
};




DynamoDbGrammarParser.UnknownContext = UnknownContext;

DynamoDbGrammarParser.prototype.unknown = function() {

    var localctx = new UnknownContext(this, this._ctx, this.state);
    this.enterRule(localctx, 50, DynamoDbGrammarParser.RULE_unknown);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 234; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 233;
            this.match(DynamoDbGrammarParser.UNKNOWN);
            this.state = 236; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while(_la===DynamoDbGrammarParser.UNKNOWN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


DynamoDbGrammarParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 3:
			return this.condition_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

DynamoDbGrammarParser.prototype.condition_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 2);
		case 1:
			return this.precpred(this._ctx, 1);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.DynamoDbGrammarParser = DynamoDbGrammarParser;
