'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.groupBy = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
const groupBy = (dataSet = [], groupProperty = '') => {
  if (!groupProperty) {
    return dataSet
  }
  return dataSet.reduce((groupedData, data) => {
    const property = data[groupProperty]
    if (!Object.prototype.hasOwnProperty.call(groupedData, property)) {
      groupedData[property] = []
    }
    groupedData[property].push(data)
    return groupedData
  }, {})
}
exports.groupBy = groupBy
