'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.updateEntity = void 0
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.find.js')
const _retrieveRecord = require('../utilities/retrieveRecord')
const _retrieveFile = require('../utilities/retrieveFile')
const _updateIndex = require('../utilities/updateIndex')
const _removeFromIndex = require('../utilities/removeFromIndex')
const _keyUnique = require('../introspect/policies/keyUnique')
const _typeCheck = require('../introspect/policies/typeCheck')
const _foreignKeyExists = require('../introspect/policies/foreignKeyExists')
const _splitEntityProperty = require('../utilities/parsers/splitEntityProperty')
const gulpConfig = require('js-build-tools/gulp.config')
const {
  writeFile
} = require('fs/promises')
/**
 * Same reasoning as deleteEntity: a record object carries no memory of which entry file it came
 * from, so re-scan entries[] and match by the record's own primary key value.
 * @param record
 * @param primaryField
 * @param primaryValue
 */
const findEntryFile = async (record, primaryField, primaryValue) => {
  for (const fileName of record.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`)
    if (data[primaryField] == primaryValue) {
      return fileName
    }
  }
  return null
}
/**
 * Only check uniqueness for a single-field primary/unique key whose value is actually changing -
 * checking an unchanged value would find the record's own existing entry and wrongly report it
 * as a duplicate of itself.
 * @param entity
 * @param record
 * @param oldData
 * @param newValues
 */
const assertUniqueForUpdate = async (entity, record, oldData, newValues) => {
  for (const key of record.keys) {
    if (key.type !== 'primary' && key.type !== 'unique' || key.fields.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!newValues.hasOwnProperty(field) || newValues[field] == oldData[field]) {
      continue
    }
    const isUnique = await (0, _keyUnique.keyUnique)(entity, key.fields, newValues[field])
    if (!isUnique) {
      throw new Error(`Duplicate value for ${key.type} key "${field}" on ${entity}`)
    }
  }
}
/**
 * Move a single-field key's index entry from the old value to the new one wherever the update
 * actually changed that field.
 * @param record
 * @param oldData
 * @param newData
 * @param newValues
 * @param fileName
 */
/**
 * Same "only if it actually changed" scoping as assertUniqueForUpdate: re-checking an unchanged
 * foreign key value would re-validate a reference this update never touches, which could fail an
 * unrelated field's update if that parent record happened to be deleted since.
 * @param entity
 * @param record
 * @param oldData
 * @param newValues
 */
const assertForeignKeysForUpdate = async (entity, record, oldData, newValues) => {
  for (const key of record.keys) {
    if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!newValues.hasOwnProperty(field) || newValues[field] == oldData[field]) {
      continue
    }
    const {
      entity: refEntity,
      property: refProperty
    } = (0, _splitEntityProperty.splitEntityProperty)(key.references[0].fields[0])
    const exists = await (0, _foreignKeyExists.foreignKeyExists)(refEntity, refProperty, newValues[field])
    if (!exists) {
      throw new Error(`Foreign key "${field}" on ${entity} references a nonexistent ${refEntity}.${refProperty} = ${newValues[field]}`)
    }
  }
}
const reconcileIndexes = async (record, oldData, newData, newValues, fileName) => {
  for (const key of record.keys) {
    if (key.fields.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!newValues.hasOwnProperty(field) || newValues[field] == oldData[field]) {
      continue
    }
    await (0, _removeFromIndex.removeFromIndex)(record.path, key, oldData[field], fileName)
    await (0, _updateIndex.updateIndex)(record.path, key, newData[field], fileName)
  }
}
const assertRequiredFields = (entity, record, newData) => {
  for (const field of record.definition) {
    if (!field.optional && typeof newData[field.name] === 'undefined') {
      throw new Error(`Missing required field "${field.name}" for ${entity}`)
    }
  }
}
/**
 * Type-check (and coerce) only the fields actually present in an update's values, never the rest
 * of the merged record - a field whose already-stored value doesn't match its declared type
 * (nothing enforced this before typeCheck() existed) must not block an update that never touches
 * that field.
 * @param record
 * @param values
 */
const applyFieldTypes = (record, values) => {
  const typedValues = Object.assign({}, values)
  for (const field of record.definition) {
    if (typedValues.hasOwnProperty(field.name)) {
      typedValues[field.name] = (0, _typeCheck.typeCheck)(field.type, typedValues[field.name])
    }
  }
  return typedValues
}
const updateEntity = async (entity = '', values = {}, dataSet = {}) => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const record = await (0, _retrieveRecord.retrieveRecord)(entity)
  const primaryKey = record.keys.find(key => key.type === 'primary' && key.fields.length === 1)
  if (!primaryKey) {
    throw new Error(`Cannot update "${entity}" without a single-field primary key`)
  }
  const primaryField = primaryKey.fields[0]
  const typedValues = applyFieldTypes(record, values)
  const toUpdate = dataSet[entity] || []
  const updatedRows = []
  for (const row of toUpdate) {
    const fileName = await findEntryFile(record, primaryField, row[primaryField])
    if (!fileName) {
      throw new Error(`Could not find entry for ${entity} where "${primaryField}" = ${row[primaryField]}`)
    }
    const oldData = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`)
    await assertUniqueForUpdate(entity, record, oldData, typedValues)
    await assertForeignKeysForUpdate(entity, record, oldData, typedValues)
    const newData = Object.assign({}, oldData, typedValues)
    assertRequiredFields(entity, record, newData)
    await reconcileIndexes(record, oldData, newData, typedValues, fileName)
    await writeFile(`${databasePath}${record.path}/${fileName}`, JSON.stringify(newData, null, 2))
    updatedRows.push(newData)
  }
  dataSet[entity] = updatedRows
  return dataSet
}
exports.updateEntity = updateEntity
