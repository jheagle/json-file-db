'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findSelects = void 0
var _removeFromQuery = require('./removeFromQuery')
const selectClausesMatch = /select\s+([a-z0-9=._-]+\s*(as\s+)?([a-z0-9_-]+)?)+\s*(,\s*[a-z0-9=._-]+\s*(as\s*[a-z0-9_-]+)?)*/i
const selectClauseMatch = /(select)?\s*,?\s*([a-z0-9=._-]+)\s*(as\s+)?([a-z0-9_-]+)?/ig
/**
 * Extract select clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findSelects = (parsed, query) => {
  const selectsFound = query.match(selectClausesMatch)
  if (selectsFound) {
    const selectClausesFound = selectsFound[0].matchAll(selectClauseMatch)
    // @ts-ignore
    for (const selectClause of selectClausesFound) {
      parsed.selectClauses.push({
        property: selectClause[2],
        alias: selectClause[4]
      })
    }
    return (0, _removeFromQuery.removeFromQuery)(selectsFound[0], query)
  }
  return query
}
exports.findSelects = findSelects
