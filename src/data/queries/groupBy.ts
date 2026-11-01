/**
 * One group of a grouped read: the field and the value its rows share, then either the rows themselves or, for
 * `group by a, b`, the groups within it by the next field. A group of rows missing the field has `missing: true`
 * and no value; `null` is a value of its own (see Null and missing fields in the README).
 */
export type Group = {
  field: string
  value?: any
  missing?: true
  rows?: Object[]
  groups?: Group[]
}

// Rows share a group when their values are the same, type included: 1 and '1' are two groups, as are null and missing
const groupKey = (row: Object, field: string): string => {
  if (!Object.prototype.hasOwnProperty.call(row, field)) {
    return 'missing'
  }
  const value = row[field]
  return value !== null && typeof value === 'object' ? `json:${JSON.stringify(value)}` : `${typeof value}:${String(value)}`
}

/**
 * Group rows by each field in turn. The groups are a list in the order their first row came, so a sort before
 * grouping orders the groups too (and the rows within each one).
 * @param dataSet
 * @param fields
 * @returns The rows as they were when there's no field, otherwise the groups.
 */
export const groupBy = (dataSet: Object[] = [], fields: string[] = []): Object[] | Group[] => {
  if (!fields.length) {
    return dataSet
  }
  const [field, ...rest] = fields
  const groups = new Map<string, Group & { rows: Object[] }>()
  for (const row of dataSet) {
    const key = groupKey(row, field)
    if (!groups.has(key)) {
      groups.set(key, key === 'missing' ? { field, missing: true, rows: [] } : { field, value: row[field], rows: [] })
    }
    groups.get(key).rows.push(row)
  }
  return [...groups.values()].map(({ rows, ...group }) => rest.length
    ? { ...group, groups: groupBy(rows, rest) as Group[] }
    : { ...group, rows })
}
