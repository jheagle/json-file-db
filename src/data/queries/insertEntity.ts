import { retrieveRecord } from '../utilities/retrieveRecord'
import { updateIndex } from '../utilities/updateIndex'
import { keyGenerate } from '../introspect/policies/keyGenerate'
import { keyUnique } from '../introspect/policies/keyUnique'
import { useDefault } from '../introspect/policies/useDefault'
import { typeCheck } from '../introspect/policies/typeCheck'
import { foreignKeyExists } from '../introspect/policies/foreignKeyExists'
import { splitEntityProperty } from '../utilities/parsers/splitEntityProperty'
import { recordDefinition } from '../introspect/definitions/record'
import { getSetting } from '../utilities/config'

const { writeFile } = require('fs/promises')

/**
 * Build one entity's stored values from the raw input values, generating any autoGenerate
 * fields and applying field defaults, then throw if a required field still has no value.
 * @param entity
 * @param record
 * @param rowValues
 */
const buildEntityValues = async (entity: string, record: recordDefinition, rowValues: Object = {}): Promise<Object> => {
  const entityValues = {}
  for (const field of record.definition) {
    let value = rowValues[field.name]
    if (field.autoGenerate) {
      value = await keyGenerate(entity, [field.name])
    } else if (Object.prototype.hasOwnProperty.call(field, 'default')) {
      value = useDefault(field['default'], value)
    }
    if (typeof value === 'undefined') {
      if (!field.optional) {
        throw new Error(`Missing required field "${field.name}" for ${entity}`)
      }
      continue
    }
    entityValues[field.name] = typeCheck(field.type, value)
  }
  return entityValues
}

/**
 * Reject the insert if it collides with an existing primary or unique single-field key value.
 * @param entity
 * @param record
 * @param entityValues
 */
const assertUnique = async (entity: string, record: recordDefinition, entityValues: Object): Promise<void> => {
  for (const key of record.keys) {
    if ((key.type !== 'primary' && key.type !== 'unique') || key.fields.length !== 1) {
      continue
    }
    const isUnique = await keyUnique(entity, key.fields, entityValues[key.fields[0]])
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
const assertForeignKeys = async (entity: string, record: recordDefinition, entityValues: Object): Promise<void> => {
  for (const key of record.keys) {
    if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
      continue
    }
    const field = key.fields[0]
    if (!Object.prototype.hasOwnProperty.call(entityValues, field)) {
      continue
    }
    const { entity: refEntity, property: refProperty } = splitEntityProperty(key.references[0].fields[0])
    const exists = await foreignKeyExists(refEntity, refProperty, entityValues[field])
    if (!exists) {
      throw new Error(`Foreign key "${field}" on ${entity} references a nonexistent ${refEntity}.${refProperty} = ${entityValues[field]}`)
    }
  }
}

export const insertEntity = async (entity: string = '', values: Object[] = [], dataSet: Object = {}): Promise<Object> => {
  const databasePath = getSetting('databasePath', 'database/')
  const record = await retrieveRecord(entity)
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
        await updateIndex(record.path, key, entityValues[key.fields[0]], fileName)
      }
    }

    dataSet[entity].push(entityValues)
  }

  return dataSet
}
