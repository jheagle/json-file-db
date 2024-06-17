const makeCondition = (data, property, comparator, value) => {
  if (!data.hasOwnProperty(property)) {
    return false
  }
  switch (comparator) {
    case '=':
      return data[property] == value
    case '!=':
    case '<>':
      break
    case '>':
      break
    case '>=':
      break
    case '<':
      break
    case '<=':
      break
    case 'in':
      break
    case 'between':
      break
    case 'like':
      break
  }
  return false
}

export const where = (
  dataSet = [],
  {
    property = '',
    joinEntity = undefined,
    comparator = '=',
    value = null
  } = {}
) => {
  return dataSet.filter((data) => {
    const testProperty = joinEntity ? `${joinEntity}.${property}` : property
    return makeCondition(data, testProperty, comparator, value)
  })
}
