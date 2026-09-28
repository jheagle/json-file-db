import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const limitMatch: RegExp = /limit\s*(\d+)/i

export type ParsedLimit = number

/**
 * Extract the limit clauses from the query.
 * @param parsed
 * @param query
 */
export const findLimit = (parsed: ParsedQuery, query: string): string => {
  const limitFound: RegExpMatchArray = query.match(limitMatch)
  if (limitFound) {
    parsed['limit'] = limitFound ? parseInt(limitFound[1]) : undefined
    return removeFromQuery(limitFound[0], query)
  }
  return query
}