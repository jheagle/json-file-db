'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.create = void 0
require('core-js/modules/es.json.stringify.js')
const _testFilesystem = require('test-filesystem')
const _record = require('./definitions/record')
const _registerRecord = require('../utilities/registerRecord')
/**
 * Create a new record.
 * @param recordName
 * @param definition
 * @param keys
 */
const create = async (recordName, definition = [], keys = []) => {
  const gulpConfig = require('js-build-tools/gulp.config')
  const {
    writeFile,
    mkdir
  } = require('fs/promises')
  const databasePath = gulpConfig.get('databasePath', 'database/')
  if (recordName === '__RECORDS') {
    return null
  }
  if ((0, _testFilesystem.fileExists)(`${databasePath}${recordName}.json`)) {
    return null
  }
  await mkdir(databasePath, {
    recursive: true
  })
  const recordContent = (0, _record.record)({
    path: recordName,
    definition,
    keys
  })
  await writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent, null, 2))
  await mkdir(`${databasePath}${recordName}`, {
    recursive: true
  })
  await (0, _registerRecord.registerRecord)(recordName)
  return recordContent
}
exports.create = create
