import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const groupMatch: RegExp = /group\s+by\s+(,?[a-z0-9._-]+)+/i

/**
 * Store the group by clause as an object.
 * @typedef {string} ParsedGroupBy
 */
export type ParsedGroupBy = string

/**
 * Extract the group by clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findGroupBy = (parsed: ParsedQuery, query: string): string => {
  const groupFound: RegExpMatchArray = query.match(groupMatch)
  if (groupFound) {
    parsed['groupBy'] = groupFound ? groupFound[1] : undefined
    return removeFromQuery(groupFound[0], query)
  }
  return query
}