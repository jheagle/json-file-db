import { numberSource, parseLiteralValue } from './parseLiteralValue'
import { ParsedQuery } from './parseQuery'
import { arraySource, placeholderSource } from './maskStrings'

const literal = `(?:${placeholderSource.replace('(', '(?:')}|${numberSource}|${arraySource.replace('(', '(?:')}|null|true|false)`
const valuesMatch: RegExp = new RegExp(`^([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i')
const assignmentMatch: RegExp = new RegExp(`([a-z0-9_-]+)\\s*=\\s*(${placeholderSource}|(${numberSource})|${arraySource}|(null)|(true)|(false))`, 'ig')

export type ParsedInsertRow = { [field: string]: any }

/**
 * Read an insert's values clause body (`field = value, field2 = value2`, see splitClauses), the same way
 * findUpdateValues() does for "set". insertEntity() accepts an array of rows for bulk inserts, but
 * a query string only describes a single row for now - wrapped in a one-element array to match.
 * @param parsed
 * @param body
 * @returns The rest of the body, after the last assignment.
 */
export const findInsertValues = (parsed: ParsedQuery, body: string): string => {
  const clauseFound: RegExpMatchArray = body.match(valuesMatch)
  parsed['insertValues'] = []
  if (!clauseFound) {
    return body
  }
  const row = {}
  const assignmentsFound: IterableIterator<RegExpMatchArray> = clauseFound[1].matchAll(assignmentMatch)
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    row[assignment[1]] = parseLiteralValue(assignment, 3)
  }
  parsed['insertValues'] = [row]
  return body.slice(clauseFound[0].length).trim()
}
