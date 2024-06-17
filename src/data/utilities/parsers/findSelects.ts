import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const selectClausesMatch: RegExp = /select\s+([a-z0-9=._-]+\s*(as\s+)?([a-z0-9_-]+)?)+\s*(,\s*[a-z0-9=._-]+\s*(as\s*[a-z0-9_-]+)?)*/i
const selectClauseMatch: RegExp = /(select)?\s*,?\s*([a-z0-9=._-]+)\s*(as\s+)?([a-z0-9_-]+)?/ig

/**
 * Store the select as an object.
 * @typedef {Object} ParsedSelect
 * @property {string} property
 * @property {string|undefined} alias
 */
export type ParsedSelect = {
  property: string
  alias: string | undefined
}

/**
 * Extract select clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findSelects = (parsed: ParsedQuery, query: string): string => {
  const selectsFound: RegExpMatchArray = query.match(selectClausesMatch)
  if (selectsFound) {
    const selectClausesFound: IterableIterator<RegExpMatchArray> = selectsFound[0].matchAll(selectClauseMatch)
    // @ts-ignore
    for (let selectClause of selectClausesFound) {
      parsed['selectClauses'].push({
        property: selectClause[2],
        alias: selectClause[4],
      })
    }
    return removeFromQuery(selectsFound[0], query)
  }
  return query
}