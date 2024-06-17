'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findLimit = void 0
var _removeFromQuery = require('./removeFromQuery')
const limitMatch = /limit\s*(\d+)/i
/**
 * Extract the limit clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findLimit = (parsed, query) => {
  const limitFound = query.match(limitMatch)
  if (limitFound) {
    parsed.limit = limitFound ? parseInt(limitFound[1]) : undefined
    return (0, _removeFromQuery.removeFromQuery)(limitFound[0], query)
  }
  return query
}
exports.findLimit = findLimit
