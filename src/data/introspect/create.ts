import { record, recordDefinition } from './definitions/record'
import { keyProperties } from './definitions/key'
import { fieldProperties } from './definitions/field'
import { registerRecord } from '../utilities/registerRecord'
import { getSetting } from '../utilities/config'

/**
 * Create a new record.
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
  await mkdir(databasePath, { recursive: true })
  const recordContent = record({ path: recordName, definition: definition, keys: keys })
  await writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent, null, 2))
  await mkdir(`${databasePath}${recordName}`, { recursive: true })
  await registerRecord(recordName)
  return recordContent
}
