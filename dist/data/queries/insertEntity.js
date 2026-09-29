'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.insertEntity = void 0
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.find.js')
const _retrieveRecord = require('../utilities/retrieveRecord')
const _updateIndex = require('../utilities/updateIndex')
const _keyGenerate = require('../introspect/policies/keyGenerate')
const _keyUnique = require('../introspect/policies/keyUnique')
const _useDefault = require('../introspect/policies/useDefault')
const _typeCheck = require('../introspect/policies/typeCheck')
const _foreignKeyExists = require('../introspect/policies/foreignKeyExists')
const _splitEntityProperty = require('../utilities/parsers/splitEntityProperty')
const gulpConfig = require('js-build-tools/gulp.config')
const {
  writeFile
} = require('fs/promises')
/**
 * Build one entity's stored values from the raw input values, generating any autoGenerate
 * fields and applying field defaults, then throw if a required field still has no value.
 * @param entity
 * @param record
 * @param rowValues
 */
const buildEntityValues = async (entity, record, rowValues = {}) => {
  const entityValues = {}
  for (const field of record.definition) {
    let value = rowValues[field.name]
    if (field.autoGenerate) {
      value = await (0, _keyGenerate.keyGenerate)(entity, [field.name])
    } else if (Object.prototype.hasOwnProperty.call(field, 'default')) {
      value = (0, _useDefault.useDefault)(field.default, value)
    }
    if (typeof value === 'undefined') {
      if (!field.optional) {
        throw new Error(`Missing required field "${field.name}" for ${entity}`)
      }
      continue
    }
    entityValues[field.name] = (0, _typeCheck.typeCheck)(field.type, value)
  }
  return entityValues
}
/**
 * Reject the insert if it collides with an existing primary or unique single-field key value.
 * @param entity
 * @param record
 * @param entityValues
 */
const assertUnique = async (entity, record, entityValues) => {
  for (const key of record.keys) {
    if (key.type !== 'primary' && key.type !== 'unique' || key.fields.length !== 1) {
      continue
    }
    const isUnique = await (0, _keyUnique.keyUnique)(entity, key.fields, entityValues[key.fields[0]])
    if (!isUnique) {
      throw new Error(`Duplicate value for ${key.type} key "${key.fields[0]}" on ${entity}`)
    }
  }
}
/**
 * Reject the insert if a single-field foreign key's value doesn't exist in the record it
 * references.
 * @param entity
 * @param record
 * @param entityValues
 */
const assertForeignKeys = async (entity, record, entityValues) => {
  for (const key of record.keys) {
    if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!Object.prototype.hasOwnProperty.call(entityValues, field)) {
      continue
    }
    const {
      entity: refEntity,
      property: refProperty
    } = (0, _splitEntityProperty.splitEntityProperty)(key.references[0].fields[0])
    const exists = await (0, _foreignKeyExists.foreignKeyExists)(refEntity, refProperty, entityValues[field])
    if (!exists) {
      throw new Error(`Foreign key "${field}" on ${entity} references a nonexistent ${refEntity}.${refProperty} = ${entityValues[field]}`)
    }
  }
}
const insertEntity = async (entity = '', values = [], dataSet = {}) => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const record = await (0, _retrieveRecord.retrieveRecord)(entity)
  const primaryKey = record.keys.find(key => key.type === 'primary' && key.fields.length === 1)
  if (!Object.prototype.hasOwnProperty.call(dataSet, entity)) {
    dataSet[entity] = []
  }
  for (const rowValues of values) {
    const entityValues = await buildEntityValues(entity, record, rowValues)
    await assertUnique(entity, record, entityValues)
    await assertForeignKeys(entity, record, entityValues)
    const fileName = `${primaryKey ? entityValues[primaryKey.fields[0]] : crypto.randomUUID()}.json`
    await writeFile(`${databasePath}${record.path}/${fileName}`, JSON.stringify(entityValues, null, 2))
    record.entries.push(fileName)
    await writeFile(`${databasePath}${record.path}.json`, JSON.stringify(record, null, 2))
    for (const key of record.keys) {
      if (key.fields.length === 1) {
        await (0, _updateIndex.updateIndex)(record.path, key, entityValues[key.fields[0]], fileName)
      }
    }
    dataSet[entity].push(entityValues)
  }
  return dataSet
}
exports.insertEntity = insertEntity
