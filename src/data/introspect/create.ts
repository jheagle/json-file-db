import { record, recordDefinition } from './definitions/record'
import { keyProperties } from './definitions/key'
import { fieldProperties } from './definitions/field'
import { registerRecord } from '../utilities/registerRecord'
import { getSetting } from '../utilities/config'
import { typeCheck } from './policies/typeCheck'

/**
 * Reject a definition that could never be written correctly, before anything is created: a
 * default that fails its field's type check (otherwise every insert leaving that field out would
 * fail instead), including a null default on a field that isn't nullable, and a nullable field in
 * the primary key (an entry's file name comes from its primary key value).
 * @param recordName
 * @param recordContent
 */
const assertValidDefinition = (recordName: string, recordContent: recordDefinition): void => {
  for (const field of recordContent.definition) {
    if (!Object.prototype.hasOwnProperty.call(field, 'default')) {
      continue
    }
    try {
      typeCheck(field.type, field['default'], field.nullable)
    } catch (err) {
      throw new Error(`Invalid default for field "${field.name}" of ${recordName}: ${(err as Error).message}`)
    }
  }
  const primaryKey = recordContent.keys.find(key => key.type === 'primary')
  for (const fieldName of primaryKey ? primaryKey.fields : []) {
    if (recordContent.definition.some(field => field.name === fieldName && field.nullable)) {
      throw new Error(`Primary key field "${fieldName}" of ${recordName} can't be nullable`)
    }
  }
}

/**
 * Create a new record. Throws if the definition is invalid (see assertValidDefinition).
 * @param recordName
 * @param definition
 * @param keys
 */
export const create = async (recordName: string, definition: fieldProperties[] = [], keys: keyProperties[] = []): Promise<recordDefinition | null> => {
  const { writeFile, mkdir } = require('fs/promises')
  const { existsSync } = require('fs')
  const databasePath = getSetting('databasePath', 'database/')
  if (recordName === '__RECORDS') {
    return null
  }
  if (existsSync(`${databasePath}${recordName}.json`)) {
    return null
  }
  const recordContent = record({ path: recordName, definition, keys })
  assertValidDefinition(recordName, recordContent)
  await mkdir(databasePath, { recursive: true })
  await writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent, null, 2))
  await mkdir(`${databasePath}${recordName}`, { recursive: true })
  await registerRecord(recordName)
  return recordContent
}
