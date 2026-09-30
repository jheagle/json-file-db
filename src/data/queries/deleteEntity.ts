import { retrieveRecord } from '../utilities/retrieveRecord'
import { retrieveFile } from '../utilities/retrieveFile'
import { removeFromIndex } from '../utilities/removeFromIndex'
import { computeKeyValue } from '../utilities/computeKeyValue'
import { hasDependents } from '../introspect/policies/hasDependents'
import { recordDefinition } from '../introspect/definitions/record'
import { keyDefinition } from '../introspect/definitions/key'
import { getSetting } from '../utilities/config'

const { rm, writeFile } = require('fs/promises')

/**
 * RESTRICT: reject the whole delete (before removing anything) if any row being deleted is still
 * referenced by a single-field foreign key elsewhere. Only meaningful for a single-field primary
 * key, since foreign key support itself is single-field only - a composite primary key can't be
 * the target of one yet, so there's nothing to check.
 * @param entity
 * @param primaryKey
 * @param toDelete
 */
const assertNoDependents = async (entity: string, primaryKey: keyDefinition, toDelete: Object[]): Promise<void> => {
  if (!getSetting('enforceForeignKeys', true) || primaryKey.fields.length !== 1) {
    return
  }
  const property = primaryKey.fields[0]
  for (const row of toDelete) {
    if (await hasDependents(entity, property, row[property])) {
      throw new Error(`Cannot delete from "${entity}" where "${property}" = ${row[property]} - other records still reference it`)
    }
  }
}

/**
 * A record object carries no memory of which entry file it was read from, and files are not
 * guaranteed to be named after any field's value, so the only reliable way to find a record's
 * file is to re-scan every entry and match it by its primary key value(s) - a single field, or a
 * composite of several for a multi-field primary key.
 * @param entity
 * @param record
 * @param primaryKey
 * @param deletedValues
 */
const removeMatchingEntries = async (entity: string, record: recordDefinition, primaryKey: keyDefinition, deletedValues: Set<any>): Promise<string[]> => {
  const databasePath = getSetting('databasePath', 'database/')
  const remainingEntries = []
  for (const fileName of record.entries) {
    const data = await retrieveFile(`${record.path}/${fileName}`)
    if (!deletedValues.has(computeKeyValue(primaryKey.fields, data))) {
      remainingEntries.push(fileName)
      continue
    }
    await rm(`${databasePath}${record.path}/${fileName}`)
    for (const key of record.keys) {
      await removeFromIndex(record.path, key, computeKeyValue(key.fields, data), fileName)
    }
  }
  return remainingEntries
}

export const deleteEntity = async (entity: string = '', dataSet: Object = {}): Promise<Object> => {
  const databasePath = getSetting('databasePath', 'database/')
  const record = await retrieveRecord(entity)
  const primaryKey = record.keys.find(key => key.type === 'primary')
  if (!primaryKey) {
    throw new Error(`Cannot delete from "${entity}" without a primary key`)
  }

  const toDelete = dataSet[entity] || []
  if (!toDelete.length) {
    return dataSet
  }
  await assertNoDependents(entity, primaryKey, toDelete)
  const deletedValues = new Set(toDelete.map(row => computeKeyValue(primaryKey.fields, row)))

  record.entries = await removeMatchingEntries(entity, record, primaryKey, deletedValues)
  await writeFile(`${databasePath}${record.path}.json`, JSON.stringify(record, null, 2))

  return dataSet
}
