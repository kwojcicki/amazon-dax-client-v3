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
const self = this;
// Type encoding sizes measured in bits.
self.SIZE_8 = 0b00011000;
self.SIZE_16 = 0b00011001;
self.SIZE_32 = 0b00011010;
self.SIZE_64 = 0b00011011;
self.SIZE_ILLEGAL_1 = 0b00011100;
self.SIZE_ILLEGAL_2 = 0b00011101;
self.SIZE_ILLEGAL_3 = 0b00011110;
self.SIZE_STREAM = 0b00011111;

// Upper 3 bits of type header defines the major type.
self.MAJOR_TYPE_MASK = 0b11100000;

// Lower 5 bits of type header defines the minor type.
self.MINOR_TYPE_MASK = 0b00011111;

// Positive integer types.
self.TYPE_POSINT = 0b00000000; // 0..23
self.TYPE_POSINT_8 = self.TYPE_POSINT + self.SIZE_8;
self.TYPE_POSINT_16 = self.TYPE_POSINT + self.SIZE_16;
self.TYPE_POSINT_32 = self.TYPE_POSINT + self.SIZE_32;
self.TYPE_POSINT_64 = self.TYPE_POSINT + self.SIZE_64;

// Negative integer types.
self.TYPE_NEGINT = 0b00100000; // -1..-24
self.TYPE_NEGINT_8 = self.TYPE_NEGINT + self.SIZE_8;
self.TYPE_NEGINT_16 = self.TYPE_NEGINT + self.SIZE_16;
self.TYPE_NEGINT_32 = self.TYPE_NEGINT + self.SIZE_32;
self.TYPE_NEGINT_64 = self.TYPE_NEGINT + self.SIZE_64;

// Byte string types.
self.TYPE_BYTES = 0b01000000; // 0..23 bytes in length
self.TYPE_BYTES_8 = self.TYPE_BYTES + self.SIZE_8;
self.TYPE_BYTES_16 = self.TYPE_BYTES + self.SIZE_16;
self.TYPE_BYTES_32 = self.TYPE_BYTES + self.SIZE_32;
self.TYPE_BYTES_64 = self.TYPE_BYTES + self.SIZE_64;
self.TYPE_BYTES_STREAM = self.TYPE_BYTES + self.SIZE_STREAM;

// UTF-8 string types.
self.TYPE_UTF = 0b01100000; // 0..23 bytes in length
self.TYPE_UTF_8 = self.TYPE_UTF + self.SIZE_8;
self.TYPE_UTF_16 = self.TYPE_UTF + self.SIZE_16;
self.TYPE_UTF_32 = self.TYPE_UTF + self.SIZE_32;
self.TYPE_UTF_64 = self.TYPE_UTF + self.SIZE_64;
self.TYPE_UTF_STREAM = self.TYPE_UTF + self.SIZE_STREAM;

// Array types.
self.TYPE_ARRAY = 0b10000000; // 0..23 elements
self.TYPE_ARRAY_8 = self.TYPE_ARRAY + self.SIZE_8;
self.TYPE_ARRAY_16 = self.TYPE_ARRAY + self.SIZE_16;
self.TYPE_ARRAY_32 = self.TYPE_ARRAY + self.SIZE_32;
self.TYPE_ARRAY_64 = self.TYPE_ARRAY + self.SIZE_64;
self.TYPE_ARRAY_STREAM = self.TYPE_ARRAY + self.SIZE_STREAM;

// Map types.
self.TYPE_MAP = 0b10100000; // 0..23 element pairs
self.TYPE_MAP_8 = self.TYPE_MAP + self.SIZE_8;
self.TYPE_MAP_16 = self.TYPE_MAP + self.SIZE_16;
self.TYPE_MAP_32 = self.TYPE_MAP + self.SIZE_32;
self.TYPE_MAP_64 = self.TYPE_MAP + self.SIZE_64;
self.TYPE_MAP_STREAM = self.TYPE_MAP + self.SIZE_STREAM;

// Tagged types.
self.TYPE_TAG = 0b11000000; // for tag type 0..23
self.TYPE_TAG_8 = self.TYPE_TAG + self.SIZE_8;
self.TYPE_TAG_16 = self.TYPE_TAG + self.SIZE_16;
self.TYPE_TAG_32 = self.TYPE_TAG + self.SIZE_32;
self.TYPE_TAG_64 = self.TYPE_TAG + self.SIZE_64;

// Simple and special types.
self.TYPE_SIMPLE = 0b11100000; // not a real type
self.TYPE_FALSE = self.TYPE_SIMPLE + 0b00010100;
self.TYPE_TRUE = self.TYPE_SIMPLE + 0b00010101;
self.TYPE_NULL = self.TYPE_SIMPLE + 0b00010110;
self.TYPE_UNDEFINED = self.TYPE_SIMPLE + 0b00010111;
self.TYPE_SIMPLE_8 = self.TYPE_SIMPLE + self.SIZE_8; // next byte specifies type 32..255
self.TYPE_FLOAT_16 = self.TYPE_SIMPLE + self.SIZE_16;
self.TYPE_FLOAT_32 = self.TYPE_SIMPLE + self.SIZE_32;
self.TYPE_FLOAT_64 = self.TYPE_SIMPLE + self.SIZE_64;
self.TYPE_BREAK = self.TYPE_SIMPLE + self.SIZE_STREAM;

// A few standard tags.
self.TAG_DATETIME = 0; // string
self.TAG_TIMESTAMP = 1; // seconds from epoch
self.TAG_POSBIGINT = 2;
self.TAG_NEGBIGINT = 3;
self.TAG_DECIMAL = 4;
self.TAG_BIGFLOAT = 5;

// return type
self.RET_INT = 0;
self.RET_UTF = 1;
self.RET_BUF = 2;
self.RET_BIGINT = 3;
self.RET_BIGDEC = 4;
self.RET_FLOAT = 5;
self.RET_TAG = 6;
self.RET_BOOL = 7;
self.RET_NULL = 8;
self.RET_UNDEFINED = 9;
self.RET_MAP_HEADER = 10;
self.RET_ARR_HEADER = 11;
self.RET_STREAM_BREAK = 12;

self.majorType = (v) => v & self.MAJOR_TYPE_MASK;
self.minorType = (v) => v & self.MINOR_TYPE_MASK;
self.isMajorType = (v, t) => (v & self.MAJOR_TYPE_MASK) === t;
