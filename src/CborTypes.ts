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
/* eslint no-invalid-this: ["off"]*/
'use strict';
// const self = this;
// Type encoding sizes measured in bits.
export const SIZE_8 = 0b00011000;
export const SIZE_16 = 0b00011001;
export const SIZE_32 = 0b00011010;
export const SIZE_64 = 0b00011011;
export const SIZE_ILLEGAL_1 = 0b00011100;
export const SIZE_ILLEGAL_2 = 0b00011101;
export const SIZE_ILLEGAL_3 = 0b00011110;
export const SIZE_STREAM = 0b00011111;

// Upper 3 bits of type header defines the major type.
export const MAJOR_TYPE_MASK = 0b11100000;

// Lower 5 bits of type header defines the minor type.
export const MINOR_TYPE_MASK = 0b00011111;

// Positive integer types.
export const TYPE_POSINT = 0b00000000; // 0..23
export const TYPE_POSINT_8 = TYPE_POSINT + SIZE_8;
export const TYPE_POSINT_16 = TYPE_POSINT + SIZE_16;
export const TYPE_POSINT_32 = TYPE_POSINT + SIZE_32;
export const TYPE_POSINT_64 = TYPE_POSINT + SIZE_64;

// Negative integer types.
export const TYPE_NEGINT = 0b00100000; // -1..-24
export const TYPE_NEGINT_8 = TYPE_NEGINT + SIZE_8;
export const TYPE_NEGINT_16 = TYPE_NEGINT + SIZE_16;
export const TYPE_NEGINT_32 = TYPE_NEGINT + SIZE_32;
export const TYPE_NEGINT_64 = TYPE_NEGINT + SIZE_64;

// Byte string types.
export const TYPE_BYTES = 0b01000000; // 0..23 bytes in length
export const TYPE_BYTES_8 = TYPE_BYTES + SIZE_8;
export const TYPE_BYTES_16 = TYPE_BYTES + SIZE_16;
export const TYPE_BYTES_32 = TYPE_BYTES + SIZE_32;
export const TYPE_BYTES_64 = TYPE_BYTES + SIZE_64;
export const TYPE_BYTES_STREAM = TYPE_BYTES + SIZE_STREAM;

// UTF-8 string types.
export const TYPE_UTF = 0b01100000; // 0..23 bytes in length
export const TYPE_UTF_8 = TYPE_UTF + SIZE_8;
export const TYPE_UTF_16 = TYPE_UTF + SIZE_16;
export const TYPE_UTF_32 = TYPE_UTF + SIZE_32;
export const TYPE_UTF_64 = TYPE_UTF + SIZE_64;
export const TYPE_UTF_STREAM = TYPE_UTF + SIZE_STREAM;

// Array types.
export const TYPE_ARRAY = 0b10000000; // 0..23 elements
export const TYPE_ARRAY_8 = TYPE_ARRAY + SIZE_8;
export const TYPE_ARRAY_16 = TYPE_ARRAY + SIZE_16;
export const TYPE_ARRAY_32 = TYPE_ARRAY + SIZE_32;
export const TYPE_ARRAY_64 = TYPE_ARRAY + SIZE_64;
export const TYPE_ARRAY_STREAM = TYPE_ARRAY + SIZE_STREAM;

// Map types.
export const TYPE_MAP = 0b10100000; // 0..23 element pairs
export const TYPE_MAP_8 = TYPE_MAP + SIZE_8;
export const TYPE_MAP_16 = TYPE_MAP + SIZE_16;
export const TYPE_MAP_32 = TYPE_MAP + SIZE_32;
export const TYPE_MAP_64 = TYPE_MAP + SIZE_64;
export const TYPE_MAP_STREAM = TYPE_MAP + SIZE_STREAM;

// Tagged types.
export const TYPE_TAG = 0b11000000; // for tag type 0..23
export const TYPE_TAG_8 = TYPE_TAG + SIZE_8;
export const TYPE_TAG_16 = TYPE_TAG + SIZE_16;
export const TYPE_TAG_32 = TYPE_TAG + SIZE_32;
export const TYPE_TAG_64 = TYPE_TAG + SIZE_64;

// Simple and special types.
export const TYPE_SIMPLE = 0b11100000; // not a real type
export const TYPE_FALSE = TYPE_SIMPLE + 0b00010100;
export const TYPE_TRUE = TYPE_SIMPLE + 0b00010101;
export const TYPE_NULL = TYPE_SIMPLE + 0b00010110;
export const TYPE_UNDEFINED = TYPE_SIMPLE + 0b00010111;
export const TYPE_SIMPLE_8 = TYPE_SIMPLE + SIZE_8; // next byte specifies type 32..255
export const TYPE_FLOAT_16 = TYPE_SIMPLE + SIZE_16;
export const TYPE_FLOAT_32 = TYPE_SIMPLE + SIZE_32;
export const TYPE_FLOAT_64 = TYPE_SIMPLE + SIZE_64;
export const TYPE_BREAK = TYPE_SIMPLE + SIZE_STREAM;

// A few standard tags.
export const TAG_DATETIME = 0; // string
export const TAG_TIMESTAMP = 1; // seconds from epoch
export const TAG_POSBIGINT = 2;
export const TAG_NEGBIGINT = 3;
export const TAG_DECIMAL = 4;
export const TAG_BIGFLOAT = 5;

// return type
export const RET_INT = 0;
export const RET_UTF = 1;
export const RET_BUF = 2;
export const RET_BIGINT = 3;
export const RET_BIGDEC = 4;
export const RET_FLOAT = 5;
export const RET_TAG = 6;
export const RET_BOOL = 7;
export const RET_NULL = 8;
export const RET_UNDEFINED = 9;
export const RET_MAP_HEADER = 10;
export const RET_ARR_HEADER = 11;
export const RET_STREAM_BREAK = 12;

export const majorType = (v) => v & MAJOR_TYPE_MASK;
export const minorType = (v) => v & MINOR_TYPE_MASK;
export const isMajorType = (v, t) => (v & MAJOR_TYPE_MASK) === t;
