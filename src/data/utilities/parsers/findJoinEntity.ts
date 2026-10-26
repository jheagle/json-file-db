import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

// Only straight after the entity (findCommand leaves `.joined ...`): a `.` later on is a number's (`1.5`) or a
// condition's `entity.field`, not the join
const joinEntityMatch: RegExp = /^\.([a-z0-9_-]+)/i

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
