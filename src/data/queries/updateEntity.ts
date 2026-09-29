import { retrieveRecord } from '../utilities/retrieveRecord'
import { retrieveFile } from '../utilities/retrieveFile'
import { updateIndex } from '../utilities/updateIndex'
import { removeFromIndex } from '../utilities/removeFromIndex'
import { keyUnique } from '../introspect/policies/keyUnique'
import { typeCheck } from '../introspect/policies/typeCheck'
import { foreignKeyExists } from '../introspect/policies/foreignKeyExists'
import { splitEntityProperty } from '../utilities/parsers/splitEntityProperty'
import { recordDefinition } from '../introspect/definitions/record'

const gulpConfig = require('js-build-tools/gulp.config')
const { writeFile } = require('fs/promises')

/**
 * Same reasoning as deleteEntity: a record object carries no memory of which entry file it came
 * from, so re-scan entries[] and match by the record's own primary key value.
 * @param record
 * @param primaryField
 * @param primaryValue
 */
const findEntryFile = async (record: recordDefinition, primaryField: string, primaryValue: any): Promise<string | null> => {
  for (const fileName of record.entries) {
    const data = await retrieveFile(`${record.path}/${fileName}`)
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
const assertUniqueForUpdate = async (entity: string, record: recordDefinition, oldData: Object, newValues: Object): Promise<void> => {
  for (const key of record.keys) {
    if ((key.type !== 'primary' && key.type !== 'unique') || key.fields.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!Object.prototype.hasOwnProperty.call(newValues, field) || newValues[field] == oldData[field]) {
      continue
    }
    const isUnique = await keyUnique(entity, key.fields, newValues[field])
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
const assertForeignKeysForUpdate = async (entity: string, record: recordDefinition, oldData: Object, newValues: Object): Promise<void> => {
  for (const key of record.keys) {
    if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!Object.prototype.hasOwnProperty.call(newValues, field) || newValues[field] == oldData[field]) {
      continue
    }
    const { entity: refEntity, property: refProperty } = splitEntityProperty(key.references[0].fields[0])
    const exists = await foreignKeyExists(refEntity, refProperty, newValues[field])
    if (!exists) {
      throw new Error(`Foreign key "${field}" on ${entity} references a nonexistent ${refEntity}.${refProperty} = ${newValues[field]}`)
    }
  }
}

const reconcileIndexes = async (record: recordDefinition, oldData: Object, newData: Object, newValues: Object, fileName: string): Promise<void> => {
  for (const key of record.keys) {
    if (key.fields.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!Object.prototype.hasOwnProperty.call(newValues, field) || newValues[field] == oldData[field]) {
      continue
    }
    await removeFromIndex(record.path, key, oldData[field], fileName)
    await updateIndex(record.path, key, newData[field], fileName)
  }
}

const assertRequiredFields = (entity: string, record: recordDefinition, newData: Object): void => {
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
const applyFieldTypes = (record: recordDefinition, values: Object): Object => {
  const typedValues = Object.assign({}, values)
  for (const field of record.definition) {
    if (Object.prototype.hasOwnProperty.call(typedValues, field.name)) {
      typedValues[field.name] = typeCheck(field.type, typedValues[field.name])
    }
  }
  return typedValues
}

export const updateEntity = async (entity: string = '', values: Object = {}, dataSet: Object = {}): Promise<Object> => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const record = await retrieveRecord(entity)
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
    const oldData = await retrieveFile(`${record.path}/${fileName}`)
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
