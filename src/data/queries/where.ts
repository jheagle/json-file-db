import { compareAs, sameValue } from '../utilities/compareAs'
import { ConditionNode, isCondition } from '../utilities/conditionTree'

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
 * SQL's three-valued logic: a condition is true, false, or unknown (null here), see makeCondition.
 */
export type Truth = boolean | null

/**
 * Equality (=, !=, <>, in) compares by the field's declared type when given one (see sameValue), so
 * '3' and 3 match in a string or int field. Ordering (>, >=, <, <=, between) compares by it too (see compareAs): a
 * string field orders as text ('10' < '9'), an int field as numbers. like compares the raw values.
 *
 * Null and missing are their own cases, as in SQL: a comparison on a field that is null or missing is unknown (null),
 * neither true nor false, so it matches nothing (not even `!=`) and `not` doesn't turn it into a match. A null never
 * equals anything, not even another null. Only these test for them, and they are never unknown:
 * - `is null`: the field is there and holds null
 * - `is not null`: the field is there and holds a value (so a missing field doesn't match either)
 * - `exists` / `does not exist`: the field is there (null counts) / is missing
 * @param data
 * @param property
 * @param comparator
 * @param value
 * @param type
 */
const makeCondition = (data, property, comparator, value, type = undefined): Truth => {
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
    return null
  }
  const dataValue = data[property]
  const typedValue = compareAs(type, dataValue)
  switch (comparator) {
    case '=':
      return sameValue(type, dataValue, value)
    case '!=':
    case '<>':
      return !sameValue(type, dataValue, value)
    case '>':
      return typedValue > compareAs(type, value)
    case '>=':
      return typedValue >= compareAs(type, value)
    case '<':
      return typedValue < compareAs(type, value)
    case '<=':
      return typedValue <= compareAs(type, value)
    case 'in':
      return Array.isArray(value) && (type ? value.some(item => sameValue(type, dataValue, item)) : value.includes(dataValue))
    case 'between':
      // A null bound would act as 0 in >= / <=: it bounds nothing, so nothing matches (the parser refuses it)
      return Array.isArray(value) && value.length === 2 && !value.includes(null) && typedValue >= compareAs(type, value[0]) && typedValue <= compareAs(type, value[1])
    case 'like':
      return likeMatch(dataValue, value)
  }
  return false
}

/**
 * One condition on one row: true, false or unknown (shared by where and whereTree).
 * @param data
 * @param condition
 */
const conditionTruth = (
  data,
  {
    property = '',
    joinEntity = undefined,
    comparator = '=',
    value = null,
    type = undefined
  }: { property?: string, joinEntity?: string, comparator?: string, value?: any, type?: string } = {}
): Truth => makeCondition(data, joinEntity ? `${joinEntity}.${property}` : property, comparator, value, type)

/**
 * The rows for which one condition is true (unknown, from a null or missing field, isn't).
 * @param dataSet
 * @param condition
 */
export const where = (dataSet = [], condition = {}) => dataSet.filter(data => conditionTruth(data, condition) === true)

/**
 * A where-clause tree on one row, with SQL's three-valued logic: unknown (null) stays unknown through `not`, and
 * `and` / `or` decide on it only when another child settles the result.
 *
 * | | result |
 * |---|---|
 * | `not unknown` | unknown |
 * | `false and unknown` | false |
 * | `true and unknown` | unknown |
 * | `true or unknown` | true |
 * | `false or unknown` | unknown |
 * @param data
 * @param node
 */
export const treeTruth = (data, node: ConditionNode): Truth => {
  if (isCondition(node)) {
    return conditionTruth(data, node)
  }
  if ('not' in node) {
    const truth = treeTruth(data, node.not)
    return truth === null ? null : !truth
  }
  // and: false wins, then unknown; or: true wins, then unknown
  const settles = !('and' in node)
  let result: Truth = !settles
  for (const child of 'and' in node ? node.and : node.or) {
    const truth = treeTruth(data, child)
    if (truth === settles) {
      return settles
    }
    if (truth === null) {
      result = null
    }
  }
  return result
}

/**
 * The rows that match a where-clause tree (see ConditionNode): only those for which the whole tree is true, so
 * `not (n = 5)` returns the same rows as `n != 5` (neither returns a row where n is null or missing). Every row when
 * there is no where clause.
 * @param dataSet
 * @param node
 */
export const whereTree = (dataSet = [], node: ConditionNode | undefined = undefined) => {
  if (typeof node === 'undefined') {
    return dataSet
  }
  return dataSet.filter(data => treeTruth(data, node) === true)
}
