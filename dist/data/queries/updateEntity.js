'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.updateEntity = void 0
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.find.js')
require('core-js/modules/esnext.iterator.map.js')
require('core-js/modules/esnext.iterator.some.js')
const _retrieveRecord = require('../utilities/retrieveRecord')
const _retrieveFile = require('../utilities/retrieveFile')
const _updateIndex = require('../utilities/updateIndex')
const _removeFromIndex = require('../utilities/removeFromIndex')
const _computeKeyValue = require('../utilities/computeKeyValue')
const _keyUnique = require('../introspect/policies/keyUnique')
const _typeCheck = require('../introspect/policies/typeCheck')
const _foreignKeyExists = require('../introspect/policies/foreignKeyExists')
const _splitEntityProperty = require('../utilities/parsers/splitEntityProperty')
const _config = require('../utilities/config')
const {
  writeFile
} = require('fs/promises')
/**
 * Same reasoning as deleteEntity: a record object carries no memory of which entry file it came
 * from, so re-scan entries[] and match by the record's own primary key value(s) - a single field,
 * or a composite of several for a multi-field primary key.
 * @param record
 * @param primaryKey
 * @param primaryValue
 */
const findEntryFile = async (record, primaryKey, primaryValue) => {
  for (const fileName of record.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`)
    if ((0, _computeKeyValue.computeKeyValue)(primaryKey.fields, data) == primaryValue) {
      return fileName
    }
  }
  return null
}
/**
 * True if the update actually changes at least one of this key's fields - a key none of whose
 * fields appear in newValues, or whose given values are all unchanged, doesn't need re-checking.
 * @param key
 * @param oldData
 * @param newValues
 */
const keyFieldsChanged = (key, oldData, newValues) => key.fields.some(field => Object.prototype.hasOwnProperty.call(newValues, field) && newValues[field] != oldData[field])
/**
 * Only check uniqueness for a primary/unique key (single-field, or composite) whose value is
 * actually changing - checking an unchanged value would find the record's own existing entry and
 * wrongly report it as a duplicate of itself.
 * @param entity
 * @param record
 * @param oldData
 * @param newData
 * @param newValues
 */
const assertUniqueForUpdate = async (entity, record, oldData, newData, newValues) => {
  for (const key of record.keys) {
    if (key.type !== 'primary' && key.type !== 'unique' || !keyFieldsChanged(key, oldData, newValues)) {
      continue
    }
    const checkKeys = key.fields.map(field => newData[field])
    const isUnique = await (0, _keyUnique.keyUnique)(entity, key.fields, checkKeys)
    if (!isUnique) {
      throw new Error(`Duplicate value for ${key.type} key "${key.fields.join(', ')}" on ${entity}`)
    }
  }
}
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
    if (!Object.prototype.hasOwnProperty.call(newValues, field) || newValues[field] == oldData[field]) {
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
/**
 * Move a key's index entry (single-field, or a composite for a multi-field key) from the old
 * value to the new one wherever the update actually changed one of its fields.
 * @param record
 * @param oldData
 * @param newData
 * @param newValues
 * @param fileName
 */
const reconcileIndexes = async (record, oldData, newData, newValues, fileName) => {
  for (const key of record.keys) {
    if (!keyFieldsChanged(key, oldData, newValues)) {
      continue
    }
    await (0, _removeFromIndex.removeFromIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, oldData), fileName)
    await (0, _updateIndex.updateIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, newData), fileName)
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
    if (Object.prototype.hasOwnProperty.call(typedValues, field.name)) {
      typedValues[field.name] = (0, _typeCheck.typeCheck)(field.type, typedValues[field.name])
    }
  }
  return typedValues
}
const updateEntity = async (entity = '', values = {}, dataSet = {}) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  const record = await (0, _retrieveRecord.retrieveRecord)(entity)
  const primaryKey = record.keys.find(key => key.type === 'primary')
  if (!primaryKey) {
    throw new Error(`Cannot update "${entity}" without a primary key`)
  }
  const typedValues = applyFieldTypes(record, values)
  const toUpdate = dataSet[entity] || []
  const updatedRows = []
  for (const row of toUpdate) {
    const fileName = await findEntryFile(record, primaryKey, (0, _computeKeyValue.computeKeyValue)(primaryKey.fields, row))
    if (!fileName) {
      throw new Error(`Could not find entry for ${entity} where "${primaryKey.fields.join(', ')}" = ${(0, _computeKeyValue.computeKeyValue)(primaryKey.fields, row)}`)
    }
    const oldData = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`)
    const newData = Object.assign({}, oldData, typedValues)
    await assertUniqueForUpdate(entity, record, oldData, newData, typedValues)
    await assertForeignKeysForUpdate(entity, record, oldData, typedValues)
    assertRequiredFields(entity, record, newData)
    await reconcileIndexes(record, oldData, newData, typedValues, fileName)
    await writeFile(`${databasePath}${record.path}/${fileName}`, JSON.stringify(newData, null, 2))
    updatedRows.push(newData)
  }
  dataSet[entity] = updatedRows
  return dataSet
}
exports.updateEntity = updateEntity
