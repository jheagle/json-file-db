'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findJoinClauses = void 0
var _removeFromQuery = require('./removeFromQuery')
const joinClauseMatch = /(and)?\s*on\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+(=|!=|>|<|>=|<=|in|between|like)\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig
/**
 * Extract condition clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findJoinClauses = (parsed, query) => {
  const joinClausesFound = query.matchAll(joinClauseMatch)
  // @ts-ignore
  for (const joinClause of joinClausesFound) {
    parsed.joinClauses.push({
      propertyA: joinClause[2],
      comparator: joinClause[3],
      propertyB: joinClause[4]
    })
    query = (0, _removeFromQuery.removeFromQuery)(joinClause[0], query)
  }
  return query
}
exports.findJoinClauses = findJoinClauses
