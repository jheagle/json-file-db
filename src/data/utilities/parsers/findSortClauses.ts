import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const sortMatch: RegExp = /sort\s+([a-z0-9._-]+\s*(asc|desc)?)+\s*(,\s*[a-z0-9._-]+\s*(asc|desc)?)*/i
const sortRuleMatch: RegExp = /(sort)?\s*,?\s*([a-z0-9._-]+)\s*(asc|desc)?/ig

/**
 * Store the sort clause as an object.
 * @typedef {Object} ParsedSortClause
 * @property {string} property
 * @property {string} direction
 */
export type ParsedSortClause = {
  property: string
  direction: string | 'asc' | 'desc'
}

/**
 * Extract sort clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findSortClauses = (parsed: ParsedQuery, query: string): string => {
  const sortFound: RegExpMatchArray = query.match(sortMatch)
  if (sortFound) {
    const sortRulesFound: IterableIterator<RegExpMatchArray> = sortFound[0].matchAll(sortRuleMatch)
    // @ts-ignore
    for (let sortClause of sortRulesFound) {
      parsed['sortClauses'].push({
        property: sortClause[2],
        direction: sortClause[3] || 'asc',
      })
    }
    return removeFromQuery(sortFound[0], query)
  }
  return query
}