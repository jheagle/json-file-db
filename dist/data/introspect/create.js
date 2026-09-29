'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.create = void 0
require('core-js/modules/es.json.stringify.js')
const _record = require('./definitions/record')
const _registerRecord = require('../utilities/registerRecord')
const _config = require('../utilities/config')
/**
 * Create a new record.
 * @param recordName
 * @param definition
 * @param keys
 */
const create = async (recordName, definition = [], keys = []) => {
  const {
    writeFile,
    mkdir
  } = require('fs/promises')
  const {
    existsSync
  } = require('fs')
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  if (recordName === '__RECORDS') {
    return null
  }
  if (existsSync(`${databasePath}${recordName}.json`)) {
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
