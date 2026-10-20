export const sortBy = (dataSet = [], sortClauses = []) => {
  if (!sortClauses.length) {
    return dataSet
  }
  dataSet.sort((a, b) => {
    for (const sortClause of sortClauses) {
      const property = sortClause.property
      const direction = sortClause.direction
      // Loose on purpose: writes are coerced to the schema's declared type, but stored values may not match it (ids
      // declared string are stored as numbers), so the same value can be '3' in one record and 3 in another.
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
