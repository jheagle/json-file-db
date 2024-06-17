export const sortBy = (dataSet = [], sortClauses = []) => {
  if (!sortClauses.length) {
    return dataSet
  }
  dataSet.sort((a, b) => {
    for (let sortClause of sortClauses) {
      const property = sortClause.property
      const direction = sortClause.direction
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