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
 *
 * Null and missing are their own cases, as in SQL: a field that is null or missing matches no comparison (not even
 * `!=`), and a null never equals anything, not even another null. Only these test for them:
 * - `is null`: the field is there and holds null
 * - `is not null`: the field is there and holds a value (so a missing field doesn't match either)
 * - `exists` / `does not exist`: the field is there (null counts) / is missing
 * @param data
 * @param property
 * @param comparator
 * @param value
 * @param type
 */
const makeCondition = (data, property, comparator, value, type = undefined) => {
  const exists = Object.prototype.hasOwnProperty.call(data, property)
  switch (comparator) {
    case 'exists':
      return exists
    case 'does not exist':
      return !exists
    case 'is null':
      return exists && data[property] === null
    case 'is not null':
      return exists && data[property] !== null
  }
  if (!exists || data[property] === null || value === null) {
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
      // A null bound would act as 0 in >= / <=: it bounds nothing, so nothing matches (the parser refuses it)
      return Array.isArray(value) && value.length === 2 && !value.includes(null) && dataValue >= value[0] && dataValue <= value[1]
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
