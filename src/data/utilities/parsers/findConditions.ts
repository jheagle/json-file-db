import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const conditionMatch: RegExp = /(and|or)?\s*(where)\s+([a-z0-9_-]+\.?[a-z0-9_-]*)\s+(=|!=|>|<|>=|<=|in|between|like)\s+(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/ig

export type ConditionValue = string | number | boolean | null | any[]

export type ParsedCondition = {
  property: string
  comparator: string
  value: ConditionValue
}

/**
 * The value alternation in conditionMatch captures one of six literal shapes into groups 6-11
 * (quoted string, number, array, null, true, false); pick whichever one matched and give it its
 * real JS type, since only the quoted-string case was ever a usable value before this.
 * @param match
 */
const parseConditionValue = (match: RegExpMatchArray): ConditionValue => {
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
export const findConditions = (parsed: ParsedQuery, query: string): string => {
  const conditionsFound: IterableIterator<RegExpMatchArray> = query.matchAll(conditionMatch)
  // @ts-ignore
  for (let condition of conditionsFound) {
    parsed['conditions'].push({
      property: condition[3],
      comparator: condition[4],
      value: parseConditionValue(condition)
    })
    query = removeFromQuery(condition[0], query)
  }
  return query
}