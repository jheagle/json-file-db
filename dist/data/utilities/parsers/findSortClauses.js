'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findSortClauses = void 0
var _removeFromQuery = require('./removeFromQuery')
const sortMatch = /sort\s+([a-z0-9._-]+\s*(asc|desc)?)+\s*(,\s*[a-z0-9._-]+\s*(asc|desc)?)*/i
const sortRuleMatch = /(sort)?\s*,?\s*([a-z0-9._-]+)\s*(asc|desc)?/ig
/**
 * Extract sort clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findSortClauses = (parsed, query) => {
  const sortFound = query.match(sortMatch)
  if (sortFound) {
    const sortRulesFound = sortFound[0].matchAll(sortRuleMatch)
    // @ts-ignore
    for (const sortClause of sortRulesFound) {
      parsed.sortClauses.push({
        property: sortClause[2],
        direction: sortClause[3] || 'asc'
      })
    }
    return (0, _removeFromQuery.removeFromQuery)(sortFound[0], query)
  }
  return query
}
exports.findSortClauses = findSortClauses
