"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parser = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _splitQueries = require("../utilities/parsers/splitQueries");
var _parseQuery = require("../utilities/parsers/parseQuery");
const parser = (queries = '') => {
  const queryArray = (0, _splitQueries.splitQueries)(queries);
  return queryArray.map((query, index) => {
    try {
      return (0, _parseQuery.parseQuery)(query);
    } catch (e) {
      const which = queryArray.length > 1 ? ` query ${index + 1} of ${queryArray.length}` : '';
      throw new Error(`Failed to interpret${which}: ${query} (${e.message})`);
    }
  });
};
exports.parser = parser;