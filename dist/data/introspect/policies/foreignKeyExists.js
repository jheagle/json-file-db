'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.foreignKeyExists = void 0
const _retrieveRecords = require('../../utilities/retrieveRecords')
const _where = require('../../queries/where')
/**
 * Check whether any record in the referenced entity has the given property set to the given
 * value - the mirror image of keyUnique(), which checks that no record already has a value.
 * @param entity
 * @param property
 * @param value
 */
const foreignKeyExists = async (entity, property, value) => {
  const records = await (0, _retrieveRecords.retrieveRecords)(entity)
  const found = (0, _where.where)(records, {
    property,
    comparator: '=',
    value
  })
  return found.length > 0
}
exports.foreignKeyExists = foreignKeyExists
