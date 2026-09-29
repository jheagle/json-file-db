'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveIndexes = void 0
require('core-js/modules/es.array.includes.js')
const _retrieveFile = require('./retrieveFile')
const _retrieveRecord = require('./retrieveRecord')
const retrieveIndexes = async (entity = '', properties = [], recordData = {}) => {
  if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
    recordData[entity] = await (0, _retrieveRecord.retrieveRecord)(entity)
  }
  const indexSet = {}
  for (const property of properties) {
    for (const key of recordData[entity].keys) {
      if (key.fields.includes(property)) {
        indexSet[property] = await (0, _retrieveFile.retrieveFile)(`__indexes/${entity}/${key.lookup}`)
      }
    }
  }
  return indexSet
}
exports.retrieveIndexes = retrieveIndexes
