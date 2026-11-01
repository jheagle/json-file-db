import { ParsedQuery } from './parseQuery'

const groupMatch: RegExp = /^(,?[a-z0-9._-]+)+/i

export type ParsedGroupBy = string

/**
 * Read a group by clause body (a field, see splitClauses).
 * @param parsed
 * @param body
 * @returns The rest of the body, after the field.
 */
export const findGroupBy = (parsed: ParsedQuery, body: string): string => {
  const groupFound: RegExpMatchArray = body.match(groupMatch)
  if (groupFound) {
    parsed['groupBy'] = groupFound ? groupFound[1] : undefined
    return body.slice(groupFound[0].length).trim()
  }
  return body
}
