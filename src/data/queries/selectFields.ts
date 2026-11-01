import { ParsedSelect } from '../utilities/parsers/findSelects'
import { Group } from './groupBy'

const shapeRow = (row: Object, selectClauses: ParsedSelect[]): Object => selectClauses.reduce(
  (shaped: Object, { property, alias }: ParsedSelect) => {
    shaped[alias || property] = row[property]
    return shaped
  },
  {}
)

const shapeGroup = (group: Group, selectClauses: ParsedSelect[]): Group => group.groups
  ? { ...group, groups: group.groups.map((inner: Group) => shapeGroup(inner, selectClauses)) }
  : { ...group, rows: group.rows.map((row: Object) => shapeRow(row, selectClauses)) }

/**
 * Shape each row down to only the selected properties (aliased, when given). dataSet is either a list of rows, or
 * (once groupBy has run) a list of groups, whose rows are shaped the same way at any depth; the groups keep their
 * field and value, selected or not.
 * @param dataSet
 * @param selectClauses
 * @param grouped Whether dataSet is a list of groups (see groupBy)
 */
export const selectFields = (dataSet: Object[] | Group[] = [], selectClauses: ParsedSelect[] = [], grouped: boolean = false): Object[] | Group[] => {
  if (!selectClauses.length) {
    return dataSet
  }
  if (grouped) {
    return (dataSet as Group[]).map((group: Group) => shapeGroup(group, selectClauses))
  }
  return dataSet.map((row: Object) => shapeRow(row, selectClauses))
}
