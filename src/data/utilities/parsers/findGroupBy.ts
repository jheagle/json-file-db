import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const groupMatch: RegExp = /group\s+by\s+(,?[a-z0-9._-]+)+/i

export type ParsedGroupBy = string

/**
 * Extract the group by clauses from the query.
 * @param parsed
 * @param query
 */
export const findGroupBy = (parsed: ParsedQuery, query: string): string => {
  const groupFound: RegExpMatchArray = query.match(groupMatch)
  if (groupFound) {
    parsed['groupBy'] = groupFound ? groupFound[1] : undefined
    return removeFromQuery(groupFound[0], query)
  }
  return query
}