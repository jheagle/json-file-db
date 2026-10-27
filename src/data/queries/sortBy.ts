import { compareAs } from '../utilities/compareAs'

// Where a value sorts before any other, ascending: missing first, then null, then the values (MySQL's null placement,
// with missing below null). Descending reverses it.
const presence = (data, property) => {
  if (!Object.prototype.hasOwnProperty.call(data, property)) {
    return 0
  }
  return data[property] === null ? 1 : 2
}

/**
 * Sort by each clause in turn: missing, then null, then the values, compared by the field's declared type when the
 * clause has one (see compareAs), so a string field sorts as text ('10' before '9') and an int field as numbers.
 * @param dataSet
 * @param sortClauses
 */
export const sortBy = (dataSet = [], sortClauses = []) => {
  if (!sortClauses.length) {
    return dataSet
  }
  dataSet.sort((a, b) => {
    for (const sortClause of sortClauses) {
      const property = sortClause.property
      const direction = sortClause.direction
      const rankA = presence(a, property)
      const rankB = presence(b, property)
      if (rankA !== rankB) {
        return direction === 'asc' ? rankA - rankB : rankB - rankA
      }
      // Values compare by the declared type, so numeric ids in a string field sort as text ('10' before '9'). Loose so
      // '3' and 3 still tie in an untyped field, as do two nulls or two missing.
      const valueA = compareAs(sortClause.type, a[property])
      const valueB = compareAs(sortClause.type, b[property])
      // eslint-disable-next-line eqeqeq
      if (valueA == valueB) {
        continue
      }
      const result = valueA < valueB ? -1 : 1
      return direction === 'asc' ? result : result * -1
    }
    return 0
  })
  return dataSet
}
