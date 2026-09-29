import { retrieveRecord } from '../utilities/retrieveRecord'
import { retrieveFile } from '../utilities/retrieveFile'
import { removeFromIndex } from '../utilities/removeFromIndex'
import { recordDefinition } from '../introspect/definitions/record'
import { getSetting } from '../utilities/config'

const { rm, writeFile } = require('fs/promises')

/**
 * A record object carries no memory of which entry file it was read from, and files are not
 * guaranteed to be named after any field's value, so the only reliable way to find a record's
 * file is to re-scan every entry and match it by its primary key value.
 * @param entity
 * @param record
 * @param primaryField
 * @param deletedValues
 */
const removeMatchingEntries = async (entity: string, record: recordDefinition, primaryField: string, deletedValues: Set<any>): Promise<string[]> => {
  const databasePath = getSetting('databasePath', 'database/')
  const remainingEntries = []
  for (const fileName of record.entries) {
    const data = await retrieveFile(`${record.path}/${fileName}`)
    if (!deletedValues.has(data[primaryField])) {
      remainingEntries.push(fileName)
      continue
    }
    await rm(`${databasePath}${record.path}/${fileName}`)
    for (const key of record.keys) {
      if (key.fields.length === 1) {
        await removeFromIndex(record.path, key, data[key.fields[0]], fileName)
      }
    }
  }
  return remainingEntries
}

export const deleteEntity = async (entity: string = '', dataSet: Object = {}): Promise<Object> => {
  const databasePath = getSetting('databasePath', 'database/')
  const record = await retrieveRecord(entity)
  const primaryKey = record.keys.find(key => key.type === 'primary' && key.fields.length === 1)
  if (!primaryKey) {
    throw new Error(`Cannot delete from "${entity}" without a single-field primary key`)
  }
  const primaryField = primaryKey.fields[0]

  const toDelete = dataSet[entity] || []
  if (!toDelete.length) {
    return dataSet
  }
  const deletedValues = new Set(toDelete.map(row => row[primaryField]))

  record.entries = await removeMatchingEntries(entity, record, primaryField, deletedValues)
  await writeFile(`${databasePath}${record.path}.json`, JSON.stringify(record, null, 2))

  return dataSet
}
