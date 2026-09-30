import { ParsedSelect } from '../utilities/parsers/findSelects'

const shapeRow = (row: Object, selectClauses: ParsedSelect[]): Object => selectClauses.reduce(
  (shaped: Object, { property, alias }: ParsedSelect) => {
    shaped[alias || property] = row[property]
    return shaped
  },
  {}
)

/**
 * Shape each row down to only the selected properties (aliased, when given). dataSet is either a plain array of
 * rows, or (once groupBy has run) a plain object keyed by group value, each value an array of rows - both are
 * shaped the same way, row by row.
 * @param dataSet
 * @param selectClauses
 */
export const selectFields = (dataSet: Object[] | Object = [], selectClauses: ParsedSelect[] = []): Object[] | Object => {
  if (!selectClauses.length) {
    return dataSet
  }
  if (Array.isArray(dataSet)) {
    return dataSet.map((row: Object) => shapeRow(row, selectClauses))
  }
  return Object.keys(dataSet).reduce((shaped: Object, key: string) => {
    shaped[key] = dataSet[key].map((row: Object) => shapeRow(row, selectClauses))
    return shaped
  }, {})
}
