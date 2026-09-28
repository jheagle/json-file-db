'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.keyUnique = void 0
const _retrieveRecords = require('../../utilities/retrieveRecords')
const _where = require('../../queries/where')
const keyUnique = async (entity, references = [], checkKey = null) => {
  if (references.length !== 1) {
    return false
  }
  const records = await (0, _retrieveRecords.retrieveRecords)(entity)
  const found = (0, _where.where)(records, {
    property: references[0],
    comparator: '=',
    value: checkKey
  })
  return !found.length
}
exports.keyUnique = keyUnique
