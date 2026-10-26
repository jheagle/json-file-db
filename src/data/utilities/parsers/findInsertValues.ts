import { removeFromQuery } from './removeFromQuery'
import { numberSource, parseLiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'
import { arraySource, placeholderSource } from './maskStrings'

const literal = `(?:${placeholderSource.replace('(', '(?:')}|${numberSource}|${arraySource.replace('(', '(?:')}|null|true|false)`
const valuesClauseMatch: RegExp = new RegExp(`(values)\\s+([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i')
const assignmentMatch: RegExp = new RegExp(`([a-z0-9_-]+)\\s*=\\s*(${placeholderSource}|(${numberSource})|${arraySource}|(null)|(true)|(false))`, 'ig')

export type ParsedInsertRow = { [field: string]: any }

/**
 * Extract an insert's "values field = value, field2 = value2" clause from the query, the same way
 * findUpdateValues() does for "set". insertEntity() accepts an array of rows for bulk inserts, but
 * a query string only describes a single row for now - wrapped in a one-element array to match.
 * @param parsed
 * @param query
 */
export const findInsertValues = (parsed: ParsedQuery, query: string): string => {
  const clauseFound: RegExpMatchArray = query.match(valuesClauseMatch)
  parsed['insertValues'] = []
  if (!clauseFound) {
    return query
  }
  const row = {}
  const assignmentsFound: IterableIterator<RegExpMatchArray> = clauseFound[2].matchAll(assignmentMatch)
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    row[assignment[1]] = parseLiteralValue(assignment, 3)
  }
  parsed['insertValues'] = [row]
  return removeFromQuery(clauseFound[0], query)
}
