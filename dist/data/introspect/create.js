'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.create = void 0
require('core-js/modules/esnext.async-iterator.map.js')
require('core-js/modules/esnext.iterator.map.js')
var _testFilesystem = require('test-filesystem')
var _field = require('./definitions/field')
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt (value) {
    return value instanceof P ? value : new P(function (resolve) {
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
const create = function (record_1) {
  for (var _len = arguments.length, args_1 = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args_1[_key - 1] = arguments[_key]
  }
  return __awaiter(void 0, [record_1, ...args_1], void 0, function (record) {
    const definition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
    return (function * () {
      const gulpConfig = require('js-build-tools/gulp.config')
      const {
        writeFile,
        mkdir
      } = require('fs/promises')
      const databasePath = gulpConfig.get('databasePath', 'database/')
      if (record === '__RECORDS') {
        return null
      }
      if ((0, _testFilesystem.fileExists)(`${databasePath}${record}.json`)) {
        return null
      }
      const recordContent = {
        path: record,
        definition: definition.map(_field.field),
        entries: []
      }
      yield writeFile(`${databasePath}${record}.json`, JSON.stringify(recordContent, null, 2))
      return yield mkdir(`${databasePath}${record}`, {
        recursive: true
      })
    }())
  })
}
exports.create = create
