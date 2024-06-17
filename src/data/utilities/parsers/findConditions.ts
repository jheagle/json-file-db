import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const conditionMatch: RegExp = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig

/**
 * Store the condition as an object.
 * @typedef {Object} ParsedCondition
 * @property {string} property
 * @property {string} comparator
 * @property {string} value
 */
export type ParsedCondition = {
  property: string
  comparator: string
  value: string
}

/**
 * Extract condition clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findConditions = (parsed: ParsedQuery, query: string): string => {
  const conditionsFound: IterableIterator<RegExpMatchArray> = query.matchAll(conditionMatch)
  // @ts-ignore
  for (let condition of conditionsFound) {
    parsed['conditions'].push({
      property: condition[3],
      comparator: condition[4],
      value: condition[6]
    })
    query = removeFromQuery(condition[0], query)
  }
  return query
}