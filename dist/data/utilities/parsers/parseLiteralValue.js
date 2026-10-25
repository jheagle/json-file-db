"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseLiteralValue = void 0;
var _maskStrings = require("./maskStrings");
/**
 * Several parsers (findConditions, findInsertValues, findUpdateValues) capture a query-string
 * literal into one of six consecutive alternation groups depending on its shape - quoted string
 * (by then a placeholder from maskStrings, holding the string's value as hex),
 * number, array, null, true, false - since a single regex can't otherwise tell them apart. Given
 * the match and the index of the first of those six groups (which shifts depending on how many
 * groups come before it in the parent regex), return the literal with its real JS type.
 * @param match
 * @param baseIndex
 */
const parseLiteralValue = (match, baseIndex) => {
  if (typeof match[baseIndex] !== 'undefined') {
    return (0, _maskStrings.fromPlaceholder)(match[baseIndex]);
  }
  if (typeof match[baseIndex + 1] !== 'undefined') {
    return Number(match[baseIndex + 1]);
  }
  if (typeof match[baseIndex + 2] !== 'undefined') {
    // Strings inside the array are placeholders too: put them back as JSON strings first
    return JSON.parse((0, _maskStrings.unmaskStrings)(match[baseIndex + 2]));
  }
  if (typeof match[baseIndex + 3] !== 'undefined') {
    return null;
  }
  if (typeof match[baseIndex + 4] !== 'undefined') {
    return true;
  }
  return false;
};
exports.parseLiteralValue = parseLiteralValue;