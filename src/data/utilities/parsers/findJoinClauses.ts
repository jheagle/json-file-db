import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const joinClauseMatch: RegExp = /(and)?\s*on\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+(=|!=|>|<|>=|<=|in|between|like)\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig

/**
 * Store the join clause as an object.
 * @typedef {Object} ParsedJoinClause
 * @property {string} propertyA
 * @property {string} comparator
 * @property {string} propertyB
 */
export type ParsedJoinClause = {
  propertyA: string
  comparator: string
  propertyB: string
}

/**
 * Extract condition clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
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