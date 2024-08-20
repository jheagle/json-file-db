import { fileExists } from 'test-filesystem'
import { record, recordDefinition } from './definitions/record'
import { keyProperties } from './definitions/key'
import { fieldProperties } from './definitions/field'

/**
 * Create a new record.
 * @param {recordPath} recordName
 * @param {Array<fieldProperties>} definition
 * @param {Array<keyProperties>} keys
 * @returns {Promise}
 */
export const create = async (recordName: string, definition: fieldProperties[] = [], keys: keyProperties[] = []): Promise<recordDefinition | null> => {
  const gulpConfig = require('js-build-tools/gulp.config')
  const { writeFile, mkdir } = require('fs/promises')
  const databasePath = gulpConfig.get('databasePath', 'database/')
  if (recordName === '__RECORDS') {
    return null
  }
  if (fileExists(`${databasePath}${recordName}.json`)) {
    return null
  }
  const recordContent = record({ path: recordName, definition: definition, keys: keys })
  await writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent, null, 2))
  await mkdir(`${databasePath}${recordName}`, { recursive: true })
  return recordContent
}
