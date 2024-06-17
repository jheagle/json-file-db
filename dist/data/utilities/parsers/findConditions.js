'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findConditions = void 0
var _removeFromQuery = require('./removeFromQuery')
const conditionMatch = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig
/**
 * Extract condition clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findConditions = (parsed, query) => {
  const conditionsFound = query.matchAll(conditionMatch)
  // @ts-ignore
  for (const condition of conditionsFound) {
    parsed.conditions.push({
      property: condition[3],
      comparator: condition[4],
      value: condition[6]
    })
    query = (0, _removeFromQuery.removeFromQuery)(condition[0], query)
  }
  return query
}
exports.findConditions = findConditions
