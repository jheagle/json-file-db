import { ParsedQuery } from './parseQuery'

const groupMatch: RegExp = /^[a-z0-9._-]+/i
// More fields after the first (`a, b`): nested groups, not supported yet
const moreFieldsMatch: RegExp = /^,\s*([a-z0-9._-]+(?:\s*,\s*[a-z0-9._-]+)*)$/i

export type ParsedGroupBy = string

/**
 * Read a group by clause body (one field, see splitClauses).
 * @param parsed
 * @param body
 * @returns The rest of the body, after the field.
 * @throws {Error} For more than one field: grouping by a, then by b (nested groups) isn't supported yet, and 2.x
 * silently grouped every row under "undefined" instead.
 */
export const findGroupBy = (parsed: ParsedQuery, body: string): string => {
  const groupFound: RegExpMatchArray = body.match(groupMatch)
  if (groupFound) {
    const rest = body.slice(groupFound[0].length).trim()
    const moreFields = rest.match(moreFieldsMatch)
    if (moreFields) {
      const fields = [groupFound[0], ...moreFields[1].split(/\s*,\s*/)]
      throw new Error(`group by takes one field for now: grouping by ${fields.join(', then by ')} isn't supported yet`)
    }
    parsed['groupBy'] = groupFound[0]
    return rest
  }
  return body
}
