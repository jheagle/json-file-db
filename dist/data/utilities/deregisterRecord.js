'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.deregisterRecord = void 0
require('core-js/modules/es.json.stringify.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.filter.js')
const gulpConfig = require('js-build-tools/gulp.config')
const {
  readFile,
  writeFile
} = require('fs/promises')
/**
 * Remove a record's filename from the __RECORDS registry. A missing registry file is left
 * untouched rather than created, since there's nothing to remove from it.
 * @param recordName
 */
const deregisterRecord = async recordName => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const registryPath = `${databasePath}__RECORDS.json`
  let registry
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
exports.deregisterRecord = deregisterRecord
