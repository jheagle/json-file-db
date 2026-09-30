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
const _computeKeyValue = require('../utilities/computeKeyValue')
const _config = require('../utilities/config')
const {
  rm,
  writeFile
} = require('fs/promises')
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
const removeMatchingEntries = async (entity, record, primaryKey, deletedValues) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  const remainingEntries = []
  for (const fileName of record.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`)
    if (!deletedValues.has((0, _computeKeyValue.computeKeyValue)(primaryKey.fields, data))) {
      remainingEntries.push(fileName)
      continue
    }
    await rm(`${databasePath}${record.path}/${fileName}`)
    for (const key of record.keys) {
      await (0, _removeFromIndex.removeFromIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, data), fileName)
    }
  }
  return remainingEntries
}
const deleteEntity = async (entity = '', dataSet = {}) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  const record = await (0, _retrieveRecord.retrieveRecord)(entity)
  const primaryKey = record.keys.find(key => key.type === 'primary')
  if (!primaryKey) {
    throw new Error(`Cannot delete from "${entity}" without a primary key`)
  }
  const toDelete = dataSet[entity] || []
  if (!toDelete.length) {
    return dataSet
  }
  const deletedValues = new Set(toDelete.map(row => (0, _computeKeyValue.computeKeyValue)(primaryKey.fields, row)))
  record.entries = await removeMatchingEntries(entity, record, primaryKey, deletedValues)
  await writeFile(`${databasePath}${record.path}.json`, JSON.stringify(record, null, 2))
  return dataSet
}
exports.deleteEntity = deleteEntity
