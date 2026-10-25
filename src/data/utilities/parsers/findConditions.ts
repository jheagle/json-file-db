import { removeFromQuery } from './removeFromQuery'
import { parseLiteralValue, LiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'
import { placeholderSource } from './maskStrings'

const conditionMatch: RegExp = new RegExp(`(and|or)?\\s*(where)\\s+([a-z0-9_-]+\\.?[a-z0-9_-]*)\\s+(=|!=|>|<|>=|<=|in|between|like)\\s+(${placeholderSource}|([0-9]+)|(\\[.*])|(null)|(true)|(false))`, 'ig')

export type ConditionValue = LiteralValue

export type ParsedCondition = {
  property: string
  comparator: string
  value: ConditionValue
  // The field's declared type, resolved from its record when the condition runs (see where)
  type?: string
}

/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export const findConditions = (parsed: ParsedQuery, query: string): string => {
  const conditionsFound: IterableIterator<RegExpMatchArray> = query.matchAll(conditionMatch)
  // @ts-ignore
  for (const condition of conditionsFound) {
    parsed['conditions'].push({
      property: condition[3],
      comparator: condition[4],
      value: parseLiteralValue(condition, 6)
    })
    query = removeFromQuery(condition[0], query)
  }
  return query
}
