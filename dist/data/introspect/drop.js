'use strict'

require('core-js/modules/esnext.async-iterator.constructor.js')
require('core-js/modules/esnext.async-iterator.drop.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.drop.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.drop = void 0
var _retrieveFile = require('../utilities/retrieveFile')
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
const gulpConfig = require('js-build-tools/gulp.config')
const {
  rm
} = require('fs/promises')
const databasePath = gulpConfig.get('databasePath', 'database/')
const drop = record => __awaiter(void 0, void 0, void 0, function * () {
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = yield (0, _retrieveFile.retrieveFile)(`${record}.json`)
  for (const file of recordFile.entries) {
    yield rm(`${databasePath}${recordFile.path}/${file}`)
  }
})
exports.drop = drop
