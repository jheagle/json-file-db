import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const offsetMatch: RegExp = /offset\s*(\d+)/i

/**
 * Store the limit clause as an object.
 * @typedef {number} ParsedOffset
 */
export type ParsedOffset = number

/**
 * Extract the offset clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findOffset = (parsed: ParsedQuery, query: string): string => {
  const offsetFound: RegExpMatchArray = query.match(offsetMatch)
  if (offsetFound) {
    parsed['offset'] = offsetFound ? parseInt(offsetFound[1]) : undefined
    return removeFromQuery(offsetFound[0], query)
  }
  return query
}