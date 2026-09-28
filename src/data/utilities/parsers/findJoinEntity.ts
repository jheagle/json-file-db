import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const joinEntityMatch: RegExp = /\.([a-z0-9_-]+)/i

export type ParsedJoinEntity = string

/**
 * Extract the main join entity from the query.
 * @param parsed
 * @param query
 */
export const findJoinEntity = (parsed: ParsedQuery, query: string): string => {
  const joinEntityFound: RegExpMatchArray = query.match(joinEntityMatch)
  if (joinEntityFound) {
    parsed['joinEntity'] = joinEntityFound ? joinEntityFound[1] : undefined
    return removeFromQuery(joinEntityFound[0], query)
  }
  return query
}