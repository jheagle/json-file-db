import { keyDefinition } from '../introspect/definitions/key'
import { recordPath } from '../introspect/definitions/record'
import { getSetting } from './config'

const { readFile, writeFile, mkdir } = require('fs/promises')

export type indexEntry = {
  value: any
  record: string[]
}

/**
 * Add a single entry file to the index that backs one of a record's keys, creating the index
 * file (and its __indexes/{record} directory) the first time a value is indexed. Keys with no
 * lookup (multi-field keys are not indexed here) are left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 */
export const updateIndex = async (path: recordPath = '', key: keyDefinition = null, value: any = undefined, fileName: string = ''): Promise<indexEntry[] | null> => {
  if (!key || !key.lookup) {
    return null
  }
  const databasePath = getSetting('databasePath', 'database/')
  const indexDir = `${databasePath}__indexes/${path}`
  const indexPath = `${indexDir}/${key.lookup}`
  let index: indexEntry[] = []
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'))
  } catch (err) {
    index = []
  }
  const existingEntry = index.find(entry => entry.value == value)
  if (existingEntry) {
    if (!existingEntry.record.includes(fileName)) {
      existingEntry.record.push(fileName)
    }
  } else {
    index.push({ value, record: [fileName] })
  }
  await mkdir(indexDir, { recursive: true })
  await writeFile(indexPath, JSON.stringify(index, null, 2))
  return index
}
