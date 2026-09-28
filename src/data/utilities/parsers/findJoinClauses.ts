import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const joinClauseMatch: RegExp = /(and)?\s*on\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+(=|!=|>|<|>=|<=|in|between|like)\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig

export type ParsedJoinClause = {
  propertyA: string
  comparator: string
  propertyB: string
}

/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export const findJoinClauses = (parsed: ParsedQuery, query: string): string => {
  const joinClausesFound: IterableIterator<RegExpMatchArray> = query.matchAll(joinClauseMatch)
  // @ts-ignore
  for (let joinClause of joinClausesFound) {
    parsed['joinClauses'].push({
      propertyA: joinClause[2],
      comparator: joinClause[3],
      propertyB: joinClause[4]
    })
    query = removeFromQuery(joinClause[0], query)
  }
  return query
}