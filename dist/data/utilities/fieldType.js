"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyValueType = exports.fieldType = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
/**
 * The declared type of one of a record's fields, or undefined when the record or field is unknown.
 * @param record
 * @param property
 */
const fieldType = (record, property) => record?.definition?.find(field => field.name === property)?.type;
/**
 * The declared type of the value a key indexes: its field's type for a single-field key. A
 * multi-field key's value is a composite (see computeKeyValue), so it has no single declared type.
 * @param record
 * @param key
 */
exports.fieldType = fieldType;
const keyValueType = (record, key) => key.fields.length === 1 ? fieldType(record, key.fields[0]) : undefined;
exports.keyValueType = keyValueType;