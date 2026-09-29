import { recordDefinition } from '../introspect/definitions/record'
import { getSetting } from './config'

const { readFile, writeFile } = require('fs/promises')

/**
 * Remove a record's filename from the __RECORDS registry. A missing registry file is left
 * untouched rather than created, since there's nothing to remove from it.
 * @param recordName
 */
export const deregisterRecord = async (recordName: string): Promise<recordDefinition | null> => {
  const databasePath = getSetting('databasePath', 'database/')
  const registryPath = `${databasePath}__RECORDS.json`
  let registry: recordDefinition
  try {
    registry = JSON.parse(await readFile(registryPath, 'utf8'))
  } catch (err) {
    return null
  }
  const fileName = `${recordName}.json`
  registry.entries = registry.entries.filter(entry => entry !== fileName)
  await writeFile(registryPath, JSON.stringify(registry, null, 2))
  return registry
}
