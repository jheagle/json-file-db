'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findGroupBy = void 0
var _removeFromQuery = require('./removeFromQuery')
const groupMatch = /group\s+by\s+(,?[a-z0-9._-]+)+/i
/**
 * Extract the group by clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findGroupBy = (parsed, query) => {
  const groupFound = query.match(groupMatch)
  if (groupFound) {
    parsed.groupBy = groupFound ? groupFound[1] : undefined
    return (0, _removeFromQuery.removeFromQuery)(groupFound[0], query)
  }
  return query
}
exports.findGroupBy = findGroupBy
