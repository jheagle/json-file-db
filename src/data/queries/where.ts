import { sameValue } from '../utilities/compareAs'

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

/**
 * Equality (=, !=, <>, in) compares by the field's declared type when given one (see sameValue), so
 * '3' and 3 match in a string or int field. Ordering (>, <, between, like) compares the raw values.
 * @param data
 * @param property
 * @param comparator
 * @param value
 * @param type
 */
const makeCondition = (data, property, comparator, value, type = undefined) => {
  if (!Object.prototype.hasOwnProperty.call(data, property)) {
    return false
  }
  const dataValue = data[property]
  switch (comparator) {
    case '=':
      return sameValue(type, dataValue, value)
    case '!=':
    case '<>':
      return !sameValue(type, dataValue, value)
    case '>':
      return dataValue > value
    case '>=':
      return dataValue >= value
    case '<':
      return dataValue < value
    case '<=':
      return dataValue <= value
    case 'in':
      return Array.isArray(value) && (type ? value.some(item => sameValue(type, dataValue, item)) : value.includes(dataValue))
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
    value = null,
    type = undefined
  } = {}
) => {
  return dataSet.filter((data) => {
    const testProperty = joinEntity ? `${joinEntity}.${property}` : property
    return makeCondition(data, testProperty, comparator, value, type)
  })
}
