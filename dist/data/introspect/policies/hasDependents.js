'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.hasDependents = void 0
const _describe = require('../describe')
const _retrieveRecord = require('../../utilities/retrieveRecord')
const _retrieveRecords = require('../../utilities/retrieveRecords')
const _where = require('../../queries/where')
const _splitEntityProperty = require('../../utilities/parsers/splitEntityProperty')
/**
 * Check whether any other record, in any entity, still has a single-field foreign key pointing
 * at entity.property = value - the mirror image of foreignKeyExists(), which checks the opposite
 * direction (that a new/updated foreign key value points at something real). Used to RESTRICT a
 * delete or update that would otherwise leave a dangling reference behind. Scans every record in
 * the database via the __RECORDS registry, the same "no index needed, just look" approach as
 * keyUnique()/foreignKeyExists() - correctness over speed, matching this project's overall scale.
 * @param entity
 * @param property
 * @param value
 */
const hasDependents = async (entity, property, value) => {
  const entityFiles = await (0, _describe.describe)()
  for (const entityFile of entityFiles) {
    const otherEntity = entityFile.replace(/\.json$/, '')
    const otherRecord = await (0, _retrieveRecord.retrieveRecord)(otherEntity)
    for (const key of otherRecord.keys) {
      if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
        continue
      }
      const {
        entity: refEntity,
        property: refProperty
      } = (0, _splitEntityProperty.splitEntityProperty)(key.references[0].fields[0])
      if (refEntity !== entity || refProperty !== property) {
        continue
      }
      const records = await (0, _retrieveRecords.retrieveRecords)(otherEntity)
      const found = (0, _where.where)(records, {
        property: key.fields[0],
        comparator: '=',
        value
      })
      if (found.length) {
        return true
      }
    }
  }
  return false
}
exports.hasDependents = hasDependents
