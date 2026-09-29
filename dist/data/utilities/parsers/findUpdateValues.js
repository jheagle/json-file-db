'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findUpdateValues = void 0
const _removeFromQuery = require('./removeFromQuery')
const _parseLiteralValue = require('./parseLiteralValue')
const literal = '(?:["\'][^"\']*[\'"]|[0-9]+|\\[.*?]|null|true|false)'
const setClauseMatch = new RegExp(`(set)\\s+([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i')
const assignmentMatch = /([a-z0-9_-]+)\s*=\s*(["'](.*?)['"]|([0-9]+)|(\[.*?])|(null)|(true)|(false))/ig
/**
 * Extract an update's "set field = value, field2 = value2" clause from the query. Uses a two-pass
 * match, unlike the other parsers here: the set clause's own boundary is found first (so it can
 * be removed from the query as a whole, and so the comma-separated list doesn't get confused with
 * anything that follows, like a where clause), then each individual assignment is parsed out of
 * that captured substring.
 * @param parsed
 * @param query
 */
const findUpdateValues = (parsed, query) => {
  const clauseFound = query.match(setClauseMatch)
  parsed.updateValues = {}
  if (!clauseFound) {
    return query
  }
  const assignmentsFound = clauseFound[2].matchAll(assignmentMatch)
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    parsed.updateValues[assignment[1]] = (0, _parseLiteralValue.parseLiteralValue)(assignment, 3)
  }
  return (0, _removeFromQuery.removeFromQuery)(clauseFound[0], query)
}
exports.findUpdateValues = findUpdateValues
