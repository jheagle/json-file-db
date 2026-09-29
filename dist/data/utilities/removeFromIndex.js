'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.removeFromIndex = void 0
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.filter.js')
require('core-js/modules/esnext.iterator.map.js')
const _config = require('./config')
const {
  readFile,
  writeFile
} = require('fs/promises')
/**
 * Remove a single entry file from the index that backs one of a record's keys, dropping a value
 * entirely once its last file is removed. A key with no lookup, or an index file that doesn't
 * exist yet, is left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 */
const removeFromIndex = async (path = '', key = null, value = undefined, fileName = '') => {
  if (!key || !key.lookup) {
    return null
  }
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  const indexPath = `${databasePath}__indexes/${path}/${key.lookup}`
  let index = []
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'))
  } catch (err) {
    return null
  }
  index = index.map(entry => entry.value == value
    ? {
        value: entry.value,
        record: entry.record.filter(record => record !== fileName)
      }
    : entry).filter(entry => entry.record.length)
  await writeFile(indexPath, JSON.stringify(index, null, 2))
  return index
}
exports.removeFromIndex = removeFromIndex
