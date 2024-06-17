'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findMergeJoins = void 0
var _removeFromQuery = require('./removeFromQuery')
const mergeJoinMatch = /(and)?\s*merge\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+with\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig
/**
 * Extract merge-join clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findMergeJoins = (parsed, query) => {
  const mergeJoinsFound = query.matchAll(mergeJoinMatch)
  // @ts-ignore
  for (const mergeJoin of mergeJoinsFound) {
    parsed.mergeJoins.push({
      propertyA: mergeJoin[2],
      propertyB: mergeJoin[3]
    })
    query = (0, _removeFromQuery.removeFromQuery)(mergeJoin[0].trim(), query)
  }
  return query
}
exports.findMergeJoins = findMergeJoins
