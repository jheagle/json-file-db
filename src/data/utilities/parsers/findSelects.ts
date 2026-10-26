import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

// One field is a name, then optionally `as <alias>` (`as` as a whole word); fields are separated by commas. The first
// field used to accept an alias without `as`, so in `select name where a = 1` the word `where` became the alias.
const selectField = '[a-z0-9=._-]+(?:\\s+as\\s+[a-z0-9_-]+)?'
const selectClausesMatch: RegExp = new RegExp(`select\\s+${selectField}(?:\\s*,\\s*${selectField})*`, 'i')
const selectClauseMatch: RegExp = /(select)?\s*,?\s*([a-z0-9=._-]+)(?:\s+as\s+([a-z0-9_-]+))?/ig

export type ParsedSelect = {
  property: string
  alias: string | undefined
}

/**
 * Extract select clauses from the query.
 * @param parsed
 * @param query
 */
export const findSelects = (parsed: ParsedQuery, query: string): string => {
  const selectsFound: RegExpMatchArray = query.match(selectClausesMatch)
  if (selectsFound) {
    const selectClausesFound: IterableIterator<RegExpMatchArray> = selectsFound[0].matchAll(selectClauseMatch)
    // @ts-ignore
    for (const selectClause of selectClausesFound) {
      parsed['selectClauses'].push({
        property: selectClause[2],
        alias: selectClause[3],
      })
    }
    return removeFromQuery(selectsFound[0], query)
  }
  return query
}
