import { keyDefinition } from '../introspect/definitions/key'
import { recordPath } from '../introspect/definitions/record'
import { indexEntry } from './updateIndex'
import { getSetting } from './config'
import { sameValue } from './compareAs'

const { readFile, writeFile } = require('fs/promises')

/**
 * Remove a single entry file from the index that backs one of a record's keys, dropping a value
 * entirely once its last file is removed. A key with no lookup, or an index file that doesn't
 * exist yet, is left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 * @param type - The declared type of the indexed value (see keyValueType), so '3' and 3 are one entry.
 */
export const removeFromIndex = async (path: recordPath = '', key: keyDefinition = null, value: any = undefined, fileName: string = '', type: string = undefined): Promise<indexEntry[] | null> => {
  if (!key || !key.lookup) {
    return null
  }
  const databasePath = getSetting('databasePath', 'database/')
  const indexPath = `${databasePath}__indexes/${path}/${key.lookup}`
  let index: indexEntry[] = []
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'))
  } catch (err) {
    return null
  }
  index = index
    .map(entry => sameValue(type, entry.value, value) ? { value: entry.value, record: entry.record.filter(record => record !== fileName) } : entry)
    .filter(entry => entry.record.length)
  await writeFile(indexPath, JSON.stringify(index, null, 2))
  return index
}
