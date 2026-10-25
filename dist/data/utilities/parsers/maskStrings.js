"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unmaskStrings = exports.placeholderSource = exports.maskStrings = exports.fromPlaceholder = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _scanQuery = require("./scanQuery");
/**
 * Regex source matching one placeholder from maskStrings, with the hex-encoded value as its only group. The
 * find* parsers use it where they would otherwise match a quoted string.
 */
const placeholderSource = exports.placeholderSource = '\\u0000([0-9a-f]*)\\u0000';
const placeholderMatch = new RegExp(placeholderSource, 'g');
/**
 * Encode a value as hex, four digits per UTF-16 code unit: only 0-9 and a-f, so no keyword, quote, space or
 * bracket a parser looks for can appear in it.
 * @param value
 */
const toHex = value => value.split('').map(char => char.charCodeAt(0).toString(16).padStart(4, '0')).join('');
/**
 * Turn the hex of a placeholder back into the string's value.
 * @param hex
 */
const fromPlaceholder = hex => (hex.match(/.{4}/g) || []).map(code => String.fromCharCode(parseInt(code, 16))).join('');
/**
 * Replace every quoted string in a query with a placeholder holding its value (with the escapes applied), so that
 * nothing inside a string (a keyword, a quote, `and`, a `]`) can be matched by the find* parsers.
 * @param query
 * @throws {Error} For an unclosed string, comment or bracket.
 */
exports.fromPlaceholder = fromPlaceholder;
const maskStrings = query => (0, _scanQuery.assertClosed)((0, _scanQuery.scanQuery)(query)).strings.reduceRight((masked, {
  start,
  end,
  value
}) => `${masked.slice(0, start)}\u0000${toHex(value)}\u0000${masked.slice(end)}`, query);
/**
 * Put every placeholder back as a quoted string, the way it would be written in a query: for error messages, and
 * for array literals read as JSON.
 * @param text
 * @param quote - wrap with JSON's double quotes (the default) or with single quotes
 */
exports.maskStrings = maskStrings;
const unmaskStrings = (text, quote = 'json') => text.replace(placeholderMatch, (placeholder, hex) => {
  const value = fromPlaceholder(hex);
  return quote === 'json' ? JSON.stringify(value) : `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
});
exports.unmaskStrings = unmaskStrings;