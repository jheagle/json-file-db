'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.create = void 0
require('core-js/modules/es.json.stringify.js')
const _testFilesystem = require('test-filesystem')
const _record = require('./definitions/record')
const __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt (value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
        resolve(value)
      })
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled (value) {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    function rejected (value) {
      try {
        step(generator.throw(value))
      } catch (e) {
        reject(e)
      }
    }
    function step (result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next())
  })
}
/**
 * Create a new record.
 * @param {recordPath} recordName
 * @param {Array<fieldProperties>} definition
 * @param {Array<keyProperties>} keys
 * @returns {Promise}
 */
const create = (recordName_1, ...args_1) => __awaiter(void 0, [recordName_1, ...args_1], void 0, function * (recordName, definition = [], keys = []) {
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
  const recordContent = (0, _record.record)({
    path: recordName,
    definition,
    keys
  })
  yield writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent, null, 2))
  yield mkdir(`${databasePath}${recordName}`, {
    recursive: true
  })
  return recordContent
})
exports.create = create
