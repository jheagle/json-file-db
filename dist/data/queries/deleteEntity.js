'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.deleteEntity = void 0
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.find.js')
require('core-js/modules/esnext.iterator.map.js')
require('core-js/modules/esnext.set.add-all.js')
require('core-js/modules/esnext.set.delete-all.js')
require('core-js/modules/esnext.set.difference.js')
require('core-js/modules/esnext.set.every.js')
require('core-js/modules/esnext.set.filter.js')
require('core-js/modules/esnext.set.find.js')
require('core-js/modules/esnext.set.intersection.js')
require('core-js/modules/esnext.set.is-disjoint-from.js')
require('core-js/modules/esnext.set.is-subset-of.js')
require('core-js/modules/esnext.set.is-superset-of.js')
require('core-js/modules/esnext.set.join.js')
require('core-js/modules/esnext.set.map.js')
require('core-js/modules/esnext.set.reduce.js')
require('core-js/modules/esnext.set.some.js')
require('core-js/modules/esnext.set.symmetric-difference.js')
require('core-js/modules/esnext.set.union.js')
const _retrieveRecord = require('../utilities/retrieveRecord')
const _retrieveFile = require('../utilities/retrieveFile')
const _removeFromIndex = require('../utilities/removeFromIndex')
const gulpConfig = require('js-build-tools/gulp.config')
const {
  rm,
  writeFile
} = require('fs/promises')
/**
 * A record object carries no memory of which entry file it was read from, and files are not
 * guaranteed to be named after any field's value, so the only reliable way to find a record's
 * file is to re-scan every entry and match it by its primary key value.
 * @param entity
 * @param record
 * @param primaryField
 * @param deletedValues
 */
const removeMatchingEntries = async (entity, record, primaryField, deletedValues) => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const remainingEntries = []
  for (const fileName of record.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`)
    if (!deletedValues.has(data[primaryField])) {
      remainingEntries.push(fileName)
      continue
    }
    await rm(`${databasePath}${record.path}/${fileName}`)
    for (const key of record.keys) {
      if (key.fields.length === 1) {
        await (0, _removeFromIndex.removeFromIndex)(record.path, key, data[key.fields[0]], fileName)
      }
    }
  }
  return remainingEntries
}
const deleteEntity = async (entity = '', dataSet = {}) => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const record = await (0, _retrieveRecord.retrieveRecord)(entity)
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
exports.deleteEntity = deleteEntity
