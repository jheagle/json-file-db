'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findOffset = void 0
var _removeFromQuery = require('./removeFromQuery')
const offsetMatch = /offset\s*(\d+)/i
/**
 * Extract the offset clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findOffset = (parsed, query) => {
  const offsetFound = query.match(offsetMatch)
  if (offsetFound) {
    parsed.offset = offsetFound ? parseInt(offsetFound[1]) : undefined
    return (0, _removeFromQuery.removeFromQuery)(offsetFound[0], query)
  }
  return query
}
exports.findOffset = findOffset
