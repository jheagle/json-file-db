import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

// One rule is a field, then optionally asc or desc as a whole word. Rules are separated by commas, so the list ends
// at the first word that doesn't follow a comma: in `sort a limit 1`, `limit` starts the next clause.
const sortRule = '[a-z0-9._-]+(?:\\s+(?:asc|desc)(?![a-z0-9._-]))?'
const sortMatch: RegExp = new RegExp(`sort\\s+${sortRule}(?:\\s*,\\s*${sortRule})*`, 'i')
const sortRuleMatch: RegExp = /(sort)?\s*,?\s*([a-z0-9._-]+)(?:\s+(asc|desc)(?![a-z0-9._-]))?/ig

export type ParsedSortClause = {
  property: string
  direction: string | 'asc' | 'desc'
}

/**
 * Extract sort clauses from the query.
 * @param parsed
 * @param query
 */
export const findSortClauses = (parsed: ParsedQuery, query: string): string => {
  const sortFound: RegExpMatchArray = query.match(sortMatch)
  if (sortFound) {
    const sortRulesFound: IterableIterator<RegExpMatchArray> = sortFound[0].matchAll(sortRuleMatch)
    // @ts-ignore
    for (const sortClause of sortRulesFound) {
      parsed['sortClauses'].push({
        property: sortClause[2],
        direction: sortClause[3] || 'asc',
      })
    }
    return removeFromQuery(sortFound[0], query)
  }
  return query
}
