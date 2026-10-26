import { removeFromQuery } from './removeFromQuery'
import { numberSource, parseLiteralValue, LiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'
import { arraySource, placeholderSource } from './maskStrings'

// `and`/`or`/`where` count only as whole words: in `on t.x = u.color where ...` the `or` is part of the name `color`
const conditionMatch: RegExp = new RegExp(`(^|[^a-z0-9._-])(?:(and|or)\\s+)?(where)\\s+([a-z0-9_-]+\\.?[a-z0-9_-]*)\\s+(=|!=|>|<|>=|<=|in|between|like)\\s+(${placeholderSource}|(${numberSource})|${arraySource}|(null)|(true)|(false))`, 'ig')

export type ConditionValue = LiteralValue

export type ParsedCondition = {
  property: string
  comparator: string
  value: ConditionValue
  // The field's declared type, resolved from its record when the condition runs (see where)
  type?: string
}

/**
 * Extract condition clauses from the query: `where <field> <comparator> <value>`, each further one joined with
 * `and where`. `or where` is refused until or is built (TASKS: the where-clauses epic): it used to be read the same as
 * `and where`, which silently returned the wrong rows.
 * @param parsed
 * @param query
 * @throws {Error} For `or where`.
 */
export const findConditions = (parsed: ParsedQuery, query: string): string => {
  const conditionsFound: IterableIterator<RegExpMatchArray> = query.matchAll(conditionMatch)
  // @ts-ignore
  for (const condition of conditionsFound) {
    if (typeof condition[2] !== 'undefined' && condition[2].toLowerCase() === 'or') {
      throw new Error('`or where` is not supported yet: use `and where`, or run one query per alternative')
    }
    parsed['conditions'].push({
      property: condition[4],
      comparator: condition[5],
      value: parseLiteralValue(condition, 7)
    })
    // Leave out the character before the condition (group 1): it isn't part of it, and an earlier removal may have trimmed it
    query = removeFromQuery(condition[0].slice(condition[1].length), query)
  }
  return query
}
