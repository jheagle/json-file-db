'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.where = void 0
require('core-js/modules/esnext.async-iterator.filter.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.filter.js')
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
const where = function () {
  const dataSet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const {
    property = '',
    joinEntity = undefined,
    comparator = '=',
    value = null
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
  return dataSet.filter(data => {
    const testProperty = joinEntity ? `${joinEntity}.${property}` : property
    return makeCondition(data, testProperty, comparator, value)
  })
}
exports.where = where
