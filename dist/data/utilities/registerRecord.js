'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.registerRecord = void 0
require('core-js/modules/es.array.includes.js')
require('core-js/modules/es.json.stringify.js')
const gulpConfig = require('js-build-tools/gulp.config')
const {
  readFile,
  writeFile
} = require('fs/promises')
/**
 * __RECORDS is itself an ordinary record - path/definition/keys/entries - whose entries are the
 * filenames of every other record that has been created. This is the schema it's given the first
 * time a record is registered and no __RECORDS.json exists yet, matching what a hand-authored
 * database (see test-data/__RECORDS.json) already expects to find.
 */
const defaultRegistry = () => ({
  path: '',
  definition: [{
    name: 'path',
    type: 'string',
    optional: false,
    autoGenerate: false
  }, {
    name: 'definition',
    type: 'object',
    optional: false,
    autoGenerate: false
  }, {
    name: 'keys',
    type: 'array',
    optional: false,
    autoGenerate: false
  }, {
    name: 'entries',
    type: 'array',
    optional: false,
    autoGenerate: false
  }],
  keys: [],
  entries: []
})
/**
 * Add a record's filename to the __RECORDS registry, creating the registry file the first time
 * a record is created if it doesn't already exist.
 * @param recordName
 */
const registerRecord = async recordName => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const registryPath = `${databasePath}__RECORDS.json`
  let registry
  try {
    registry = JSON.parse(await readFile(registryPath, 'utf8'))
  } catch (err) {
    registry = defaultRegistry()
  }
  const fileName = `${recordName}.json`
  if (!registry.entries.includes(fileName)) {
    registry.entries.push(fileName)
  }
  await writeFile(registryPath, JSON.stringify(registry, null, 2))
  return registry
}
exports.registerRecord = registerRecord
