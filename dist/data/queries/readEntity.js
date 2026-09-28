'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.readEntity = void 0
const _retrieveRecords = require('../utilities/retrieveRecords')
const readEntity = async (entity = '', dataSet = {}) => {
  if (!dataSet.hasOwnProperty(entity) || !dataSet[entity].length) {
    dataSet[entity] = await (0, _retrieveRecords.retrieveRecords)(entity)
  }
  return dataSet
}
exports.readEntity = readEntity
