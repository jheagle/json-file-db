import { keyDefinition } from '../introspect/definitions/key'
import { recordPath } from '../introspect/definitions/record'
import { indexEntry } from './updateIndex'

const gulpConfig = require('js-build-tools/gulp.config')
const { readFile, writeFile } = require('fs/promises')

/**
 * Remove a single entry file from the index that backs one of a record's keys, dropping a value
 * entirely once its last file is removed. A key with no lookup, or an index file that doesn't
 * exist yet, is left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 */
export const removeFromIndex = async (path: recordPath = '', key: keyDefinition = null, value: any = undefined, fileName: string = ''): Promise<indexEntry[] | null> => {
  if (!key || !key.lookup) {
    return null
  }
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const indexPath = `${databasePath}__indexes/${path}/${key.lookup}`
  let index: indexEntry[] = []
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'))
  } catch (err) {
    return null
  }
  index = index
    .map(entry => entry.value == value ? { value: entry.value, record: entry.record.filter(record => record !== fileName) } : entry)
    .filter(entry => entry.record.length)
  await writeFile(indexPath, JSON.stringify(index, null, 2))
  return index
}
