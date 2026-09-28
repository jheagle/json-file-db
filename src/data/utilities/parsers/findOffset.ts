import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const offsetMatch: RegExp = /offset\s*(\d+)/i

export type ParsedOffset = number

/**
 * Extract the offset clauses from the query.
 * @param parsed
 * @param query
 */
export const findOffset = (parsed: ParsedQuery, query: string): string => {
  const offsetFound: RegExpMatchArray = query.match(offsetMatch)
  if (offsetFound) {
    parsed['offset'] = offsetFound ? parseInt(offsetFound[1]) : undefined
    return removeFromQuery(offsetFound[0], query)
  }
  return query
}