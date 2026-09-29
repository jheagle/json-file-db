import { removeFromQuery } from './removeFromQuery'
import { parseLiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'

const literal = '(?:["\'][^"\']*[\'"]|[0-9]+|\\[.*?]|null|true|false)'
const setClauseMatch: RegExp = new RegExp(`(set)\\s+([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i')
const assignmentMatch: RegExp = /([a-z0-9_-]+)\s*=\s*(["'](.*?)['"]|([0-9]+)|(\[.*?])|(null)|(true)|(false))/ig

export type ParsedUpdateValues = { [field: string]: any }

/**
 * Extract an update's "set field = value, field2 = value2" clause from the query. Uses a two-pass
 * match, unlike the other parsers here: the set clause's own boundary is found first (so it can
 * be removed from the query as a whole, and so the comma-separated list doesn't get confused with
 * anything that follows, like a where clause), then each individual assignment is parsed out of
 * that captured substring.
 * @param parsed
 * @param query
 */
export const findUpdateValues = (parsed: ParsedQuery, query: string): string => {
  const clauseFound: RegExpMatchArray = query.match(setClauseMatch)
  parsed['updateValues'] = {}
  if (!clauseFound) {
    return query
  }
  const assignmentsFound: IterableIterator<RegExpMatchArray> = clauseFound[2].matchAll(assignmentMatch)
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    parsed['updateValues'][assignment[1]] = parseLiteralValue(assignment, 3)
  }
  return removeFromQuery(clauseFound[0], query)
}
