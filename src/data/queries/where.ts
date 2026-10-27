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
 * Equality (=, !=, <>, in) compares by the field's declared type when given one (see sameValue), so
 * '3' and 3 match in a string or int field. Ordering (>, >=, <, <=, between) compares by it too (see compareAs): a
 * string field orders as text ('10' < '9'), an int field as numbers. like compares the raw values.
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
 * Whether one row matches one condition (shared by where and whereTree).
 * @param data
 * @param condition
 */
const matchesCondition = (
  data,
  {
    property = '',
    joinEntity = undefined,
    comparator = '=',
    value = null,
    type = undefined
  }: { property?: string, joinEntity?: string, comparator?: string, value?: any, type?: string } = {}
): boolean => makeCondition(data, joinEntity ? `${joinEntity}.${property}` : property, comparator, value, type)

export const where = (dataSet = [], condition = {}) => dataSet.filter(data => matchesCondition(data, condition))

/**
 * Whether one row matches a where-clause tree.
 * @param data
 * @param node
 * @throws {Error} For `or` and `not`, which nothing produces yet (the where-clauses epic adds them with SQL's
 * three-valued logic).
 */
const matchesTree = (data, node: ConditionNode): boolean => {
  if (isCondition(node)) {
    return matchesCondition(data, node)
  }
  if ('and' in node) {
    return node.and.every(child => matchesTree(data, child))
  }
  throw new Error(`\`${'or' in node ? 'or' : 'not'}\` conditions are not supported yet`)
}

/**
 * The rows that match a where-clause tree (see ConditionNode); every row when there is no where clause.
 * @param dataSet
 * @param node
 */
export const whereTree = (dataSet = [], node: ConditionNode | undefined = undefined) =>
  typeof node === 'undefined' ? dataSet : dataSet.filter(data => matchesTree(data, node))
