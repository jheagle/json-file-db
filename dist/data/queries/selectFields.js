'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.selectFields = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.map.js')
require('core-js/modules/esnext.iterator.reduce.js')
const shapeRow = (row, selectClauses) => selectClauses.reduce((shaped, {
  property,
  alias
}) => {
  shaped[alias || property] = row[property]
  return shaped
}, {})
/**
 * Shape each row down to only the selected properties (aliased, when given). dataSet is either a plain array of
 * rows, or (once groupBy has run) a plain object keyed by group value, each value an array of rows - both are
 * shaped the same way, row by row.
 * @param dataSet
 * @param selectClauses
 */
const selectFields = (dataSet = [], selectClauses = []) => {
  if (!selectClauses.length) {
    return dataSet
  }
  if (Array.isArray(dataSet)) {
    return dataSet.map(row => shapeRow(row, selectClauses))
  }
  return Object.keys(dataSet).reduce((shaped, key) => {
    shaped[key] = dataSet[key].map(row => shapeRow(row, selectClauses))
    return shaped
  }, {})
}
exports.selectFields = selectFields
