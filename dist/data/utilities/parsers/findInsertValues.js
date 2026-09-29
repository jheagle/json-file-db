'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findInsertValues = void 0
const _removeFromQuery = require('./removeFromQuery')
const _parseLiteralValue = require('./parseLiteralValue')
const literal = '(?:["\'][^"\']*[\'"]|[0-9]+|\\[.*?]|null|true|false)'
const valuesClauseMatch = new RegExp(`(values)\\s+([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i')
const assignmentMatch = /([a-z0-9_-]+)\s*=\s*(["'](.*?)['"]|([0-9]+)|(\[.*?])|(null)|(true)|(false))/ig
/**
 * Extract an insert's "values field = value, field2 = value2" clause from the query, the same way
 * findUpdateValues() does for "set". insertEntity() accepts an array of rows for bulk inserts, but
 * a query string only describes a single row for now - wrapped in a one-element array to match.
 * @param parsed
 * @param query
 */
const findInsertValues = (parsed, query) => {
  const clauseFound = query.match(valuesClauseMatch)
  parsed.insertValues = []
  if (!clauseFound) {
    return query
  }
  const row = {}
  const assignmentsFound = clauseFound[2].matchAll(assignmentMatch)
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    row[assignment[1]] = (0, _parseLiteralValue.parseLiteralValue)(assignment, 3)
  }
  parsed.insertValues = [row]
  return (0, _removeFromQuery.removeFromQuery)(clauseFound[0], query)
}
exports.findInsertValues = findInsertValues
