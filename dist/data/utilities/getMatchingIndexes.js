'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.getMatchingIndexes = void 0
require('core-js/modules/es.array.includes.js')
const _retrieveIndexes = require('./retrieveIndexes')
const getMatchingIndexes = async (entity, property, recordData, clause, dataSet, indexed, cb = null) => {
  let isIndexed = false
  for (const key of recordData[entity].keys) {
    if (key.fields.includes(property)) {
      dataSet[entity] = []
      if (!Object.prototype.hasOwnProperty.call(indexed, entity)) {
        indexed[entity] = {}
      }
      if (!Object.prototype.hasOwnProperty.call(indexed[entity], property)) {
        indexed[entity][property] = (await (0, _retrieveIndexes.retrieveIndexes)(entity, [property], recordData))[property]
      }
      if (typeof cb === 'function') {
        await cb(entity, property, recordData, clause, dataSet, indexed)
      }
      isIndexed = true
    }
  }
  return isIndexed
}
exports.getMatchingIndexes = getMatchingIndexes
