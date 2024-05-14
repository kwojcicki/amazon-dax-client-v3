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
/**
 * Tokens for DynamoDB Grammar
 */
lexer grammar Tokens;

/* Whitespace */
WS : [ \t\n\r]+ -> channel(HIDDEN) ;

/* Operators */
EQ : '=' ;
NE : '<>' ;
LT : '<' ;
LE : '<=' ;
GT : '>' ;
GE : '>=' ;
PLUS : '+' ;
MINUS : '-' ;

/* Keywords */
IN : I N ;
BETWEEN : B E T W E E N ;
NOT : N O T ;
AND : A N D ;
OR : O R ;
SET : S E T ;
ADD : A D D ;
DELETE : D E L E T E ;
REMOVE : R E M O V E ;

/* Index */
INDEX
  : '0'
  | POS_DIGIT (DIGIT)*
  ;

/* Identifiers */
ID : ID_START_CHAR (ID_CHAR)* ;
// SYSTEM_ID : '_' (ID_CHAR)+ ;

/* Substitutions */
ATTRIBUTE_NAME_SUB : '#' (ID_CHAR)+ ;
LITERAL_SUB : ':' (ID_CHAR)+;

/**
 * Fragments to help parse tokens
 */

fragment ID_START_CHAR : [a-zA-Z] ;
fragment ID_CHAR : [a-zA-Z_0-9] ;

fragment POS_DIGIT : [1-9] ;
fragment DIGIT : [0-9] ;

fragment A : [aA];
fragment B : [bB];
fragment C : [cC];
fragment D : [dD];
fragment E : [eE];
fragment F : [fF];
fragment G : [gG];
fragment H : [hH];
fragment I : [iI];
fragment J : [jJ];
fragment K : [kK];
fragment L : [lL];
fragment M : [mM];
fragment N : [nN];
fragment O : [oO];
fragment P : [pP];
fragment Q : [qQ];
fragment R : [rR];
fragment S : [sS];
fragment T : [tT];
fragment U : [uU];
fragment V : [vV];
fragment W : [wW];
fragment X : [xX];
fragment Y : [yY];
fragment Z : [zZ];

/* LITERAL tokens */
STRING_LITERAL
  : '"' ('\\"' |.)*? '"'
  | '\'' ('\\\'' | .)*? '\''
  ;

/********** MAKE SURE THIS IS THE LAST TOKEN **********/
UNKNOWN : . ;
