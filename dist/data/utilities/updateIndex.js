'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.updateIndex = void 0
require('core-js/modules/es.array.includes.js')
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.find.js')
const _config = require('./config')
const {
  readFile,
  writeFile,
  mkdir
} = require('fs/promises')
/**
 * Add a single entry file to the index that backs one of a record's keys, creating the index
 * file (and its __indexes/{record} directory) the first time a value is indexed. Keys with no
 * lookup (multi-field keys are not indexed here) are left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 */
const updateIndex = async (path = '', key = null, value = undefined, fileName = '') => {
  if (!key || !key.lookup) {
    return null
  }
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  const indexDir = `${databasePath}__indexes/${path}`
  const indexPath = `${indexDir}/${key.lookup}`
  let index = []
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
    index.push({
      value,
      record: [fileName]
    })
  }
  await mkdir(indexDir, {
    recursive: true
  })
  await writeFile(indexPath, JSON.stringify(index, null, 2))
  return index
}
exports.updateIndex = updateIndex
