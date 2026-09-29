import { removeFromQuery } from './removeFromQuery'
import { parseLiteralValue, LiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'

const conditionMatch: RegExp = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig

export type ConditionValue = LiteralValue

export type ParsedCondition = {
  property: string
  comparator: string
  value: ConditionValue
}

/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export const findConditions = (parsed: ParsedQuery, query: string): string => {
  const conditionsFound: IterableIterator<RegExpMatchArray> = query.matchAll(conditionMatch)
  // @ts-ignore
  for (let condition of conditionsFound) {
    parsed['conditions'].push({
      property: condition[3],
      comparator: condition[4],
      value: parseLiteralValue(condition, 6)
    })
    query = removeFromQuery(condition[0], query)
  }
  return query
}