'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.mergeJoins = void 0
const _mergeJoin = require('../utilities/mergeJoin')
const _reconcileJoins = require('../utilities/reconcileJoins')
const mergeJoins = async (dataSet = {}, merges = []) => {
  if (!merges.length) {
    return dataSet
  }
  for (const merge of merges) {
    dataSet = await (0, _mergeJoin.mergeJoin)(merge.propertyA, merge.propertyB, dataSet)
    dataSet = (0, _reconcileJoins.reconcileJoins)(merge.propertyA, merge.propertyB, dataSet)
  }
  return dataSet
}
exports.mergeJoins = mergeJoins
