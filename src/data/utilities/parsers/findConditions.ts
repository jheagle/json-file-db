import { removeFromQuery } from './removeFromQuery'
import { numberSource, parseLiteralValue, LiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'
import { arraySource, placeholderSource } from './maskStrings'

// `and`/`or`/`where` count only as whole words: in `on t.x = u.color where ...` the `or` is part of the name `color`
const conditionMatch: RegExp = new RegExp(`(^|[^a-z0-9._-])(?:(and|or)\\s+)?(where)\\s+([a-z0-9_-]+\\.?[a-z0-9_-]*)\\s+(?:(is\\s+not\\s+null|is\\s+null|exists|does\\s+not\\s+exist)(?![a-z0-9_.-])|(=|!=|>|<|>=|<=|in|between|like)\\s+(${placeholderSource}|(${numberSource})|${arraySource}|(null)|(true)|(false)))`, 'ig')

export type ConditionValue = LiteralValue

export type ParsedCondition = {
  property: string
  comparator: string
  value: ConditionValue
  // The field's declared type, resolved from its record when the condition runs (see where)
  type?: string
}

/**
 * Extract condition clauses from the query: `where <field> <comparator> <value>`, or `where <field> is null`,
 * `is not null`, `exists` or `does not exist` (no value), each further one joined with `and where`. A comparison
 * with the literal null (`= null`) is refused: it would never match, as null equals nothing (see where). `or where` is refused until or is built (TASKS: the where-clauses epic): it used to be read the same as
 * `and where`, which silently returned the wrong rows.
 * @param parsed
 * @param query
 * @throws {Error} For `or where`, and for a comparison with null.
 */
export const findConditions = (parsed: ParsedQuery, query: string): string => {
  const conditionsFound: IterableIterator<RegExpMatchArray> = query.matchAll(conditionMatch)
  // @ts-ignore
  for (const condition of conditionsFound) {
    if (typeof condition[2] !== 'undefined' && condition[2].toLowerCase() === 'or') {
      throw new Error('`or where` is not supported yet: use `and where`, or run one query per alternative')
    }
    if (typeof condition[5] !== 'undefined') {
      parsed['conditions'].push({
        property: condition[4],
        comparator: condition[5].toLowerCase().replace(/\s+/g, ' '),
        value: null
      })
    } else {
      const value = parseLiteralValue(condition, 8)
      if (value === null) {
        throw new Error(`\`${condition[4]} ${condition[6]} null\` never matches (null equals nothing, as in SQL): use \`${condition[4]} is null\` or \`${condition[4]} is not null\``)
      }
      parsed['conditions'].push({
        property: condition[4],
        comparator: condition[6],
        value
      })
    }
    // Leave out the character before the condition (group 1): it isn't part of it, and an earlier removal may have trimmed it
    query = removeFromQuery(condition[0].slice(condition[1].length), query)
  }
  return query
}
