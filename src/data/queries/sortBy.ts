// Where a value sorts before any other, ascending: missing first, then null, then the values (MySQL's null placement,
// with missing below null). Descending reverses it.
const presence = (data, property) => {
  if (!Object.prototype.hasOwnProperty.call(data, property)) {
    return 0
  }
  return data[property] === null ? 1 : 2
}

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
      // Ordering compares the raw stored values, not by declared type (that's only for equality, see where), so
      // numeric ids in a string field still sort numerically. Loose so '3' and 3 still tie, as do two nulls or two missing.
      // eslint-disable-next-line eqeqeq
      if (a[property] == b[property]) {
        continue
      }
      const result = a[property] < b[property] ? -1 : 1
      return direction === 'asc' ? result : result * -1
    }
    return 0
  })
  return dataSet
}
