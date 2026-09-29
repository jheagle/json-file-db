const likeMatch = (dataValue, pattern) => {
  if (typeof dataValue !== 'string' || typeof pattern !== 'string') {
    return false
  }
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.')
  return new RegExp(`^${regexPattern}$`, 'i').test(dataValue)
}

const makeCondition = (data, property, comparator, value) => {
  if (!data.hasOwnProperty(property)) {
    return false
  }
  const dataValue = data[property]
  switch (comparator) {
    case '=':
      return dataValue == value
    case '!=':
    case '<>':
      return dataValue != value
    case '>':
      return dataValue > value
    case '>=':
      return dataValue >= value
    case '<':
      return dataValue < value
    case '<=':
      return dataValue <= value
    case 'in':
      return Array.isArray(value) && value.includes(dataValue)
    case 'between':
      return Array.isArray(value) && value.length === 2 && dataValue >= value[0] && dataValue <= value[1]
    case 'like':
      return likeMatch(dataValue, value)
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
