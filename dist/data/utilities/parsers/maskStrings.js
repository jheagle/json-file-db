"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unmaskStrings = exports.placeholderSource = exports.maskStrings = exports.maskArrays = exports.fromPlaceholder = exports.arraySource = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.some.js");
var _scanQuery = require("./scanQuery");
/**
 * Regex source matching one placeholder from maskStrings, with the hex-encoded value as its only group. The
 * find* parsers use it where they would otherwise match a quoted string.
 */
const placeholderSource = exports.placeholderSource = '\\u0000([0-9a-f]*)\\u0000';
const placeholderMatch = new RegExp(placeholderSource, 'g');
/**
 * Regex source matching one placeholder from maskArrays, with the hex-encoded JSON of the array as its only group.
 * The find* parsers use it where they would otherwise match `[...]`.
 */
const arraySource = exports.arraySource = '\\u0001([0-9a-f]*)\\u0001';
const arrayMatch = new RegExp(arraySource, 'g');
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
 * @throws {Error} For an unclosed string, comment or bracket, or a NUL or SOH character outside a string (which
 * could otherwise pass for a placeholder).
 */
exports.fromPlaceholder = fromPlaceholder;
const maskStrings = query => {
  const {
    strings
  } = (0, _scanQuery.assertClosed)((0, _scanQuery.scanQuery)(query));
  for (const [character, name] of [['\u0000', 'NUL'], ['\u0001', 'SOH']]) {
    for (let index = query.indexOf(character); index !== -1; index = query.indexOf(character, index + 1)) {
      if (!strings.some(({
        start,
        end
      }) => start < index && index < end)) {
        throw new Error(`Unexpected ${name} character at position ${index}`);
      }
    }
  }
  return strings.reduceRight((masked, {
    start,
    end,
    value
  }) => `${masked.slice(0, start)}\u0000${toHex(value)}\u0000${masked.slice(end)}`, query);
};
/**
 * Put every placeholder back the way it would be written in a query: strings quoted, arrays as JSON. For error
 * messages, and for reading an array's text as JSON.
 * @param text
 * @param quote - wrap strings with JSON's double quotes (the default) or with single quotes
 */
exports.maskStrings = maskStrings;
const unmaskStrings = (text, quote = 'json') => text.replace(placeholderMatch, (placeholder, hex) => {
  const value = fromPlaceholder(hex);
  return quote === 'json' ? JSON.stringify(value) : `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
}).replace(arrayMatch, (placeholder, hex) => fromPlaceholder(hex));
/**
 * Read one array's text (its strings already placeholders) as JSON, so it is checked once, here, with a clear error.
 * @param text
 */
exports.unmaskStrings = unmaskStrings;
const arrayJson = text => {
  try {
    return JSON.stringify(JSON.parse(unmaskStrings(text)));
  } catch (e) {
    throw new Error(`Invalid array ${unmaskStrings(text, '\'')}: ${e.message}`);
  }
};
/**
 * Replace every array (outermost brackets only, so a nested array stays inside its parent) with a placeholder holding
 * its JSON, so that the find* parsers never have to find where an array ends, and nothing inside one (a `.`, a `]`,
 * a keyword) can be matched by them. Run it on the output of maskStrings, where no `[` or `]` is inside a string.
 * @param masked
 * @throws {Error} For an array which is not valid JSON once its strings are put back.
 */
const maskArrays = masked => {
  let result = '';
  let depth = 0;
  let start = 0;
  for (let index = 0; index < masked.length; index++) {
    const char = masked[index];
    if (char === '[') {
      if (depth === 0) {
        start = index;
      }
      depth++;
    } else if (char === ']' && depth > 0) {
      depth--;
      if (depth === 0) {
        result += `\u0001${toHex(arrayJson(masked.slice(start, index + 1)))}\u0001`;
        continue;
      }
    }
    if (depth === 0) {
      result += char;
    }
  }
  return depth > 0 ? result + masked.slice(start) : result;
};
exports.maskArrays = maskArrays;