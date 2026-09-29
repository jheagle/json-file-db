'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findConditions = void 0
const _removeFromQuery = require('./removeFromQuery')
const conditionMatch = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig
/**
 * The value alternation in conditionMatch captures one of six literal shapes into groups 6-11
 * (quoted string, number, array, null, true, false); pick whichever one matched and give it its
 * real JS type, since only the quoted-string case was ever a usable value before this.
 * @param match
 */
const parseConditionValue = match => {
  if (typeof match[6] !== 'undefined') {
    return match[6]
  }
  if (typeof match[7] !== 'undefined') {
    return Number(match[7])
  }
  if (typeof match[8] !== 'undefined') {
    return JSON.parse(match[8])
  }
  if (typeof match[9] !== 'undefined') {
    return null
  }
  if (typeof match[10] !== 'undefined') {
    return true
  }
  return false
}
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
const findConditions = (parsed, query) => {
  const conditionsFound = query.matchAll(conditionMatch)
  // @ts-ignore
  for (const condition of conditionsFound) {
    parsed.conditions.push({
      property: condition[3],
      comparator: condition[4],
      value: parseConditionValue(condition)
    })
    query = (0, _removeFromQuery.removeFromQuery)(condition[0], query)
  }
  return query
}
exports.findConditions = findConditions
