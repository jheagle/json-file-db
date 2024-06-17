import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const joinEntityMatch: RegExp = /\.([a-z0-9_-]+)/i

/**
 * The main join entity for this query.
 * @typedef {string} ParsedJoinEntity
 */
export type ParsedJoinEntity = string

/**
 * Extract the main join entity from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findJoinEntity = (parsed: ParsedQuery, query: string): string => {
  const joinEntityFound: RegExpMatchArray = query.match(joinEntityMatch)
  if (joinEntityFound) {
    parsed['joinEntity'] = joinEntityFound ? joinEntityFound[1] : undefined
    return removeFromQuery(joinEntityFound[0], query)
  }
  return query
}