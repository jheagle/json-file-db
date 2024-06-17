'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveRecords = void 0
var _retrieveFile = require('./retrieveFile')
var _retrieveRecord = require('./retrieveRecord')
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
const retrieveRecords = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    const entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
    return (function * () {
      const recordFile = yield (0, _retrieveRecord.retrieveRecord)(entity)
      const dataSet = []
      for (const file of recordFile.entries) {
        const data = yield (0, _retrieveFile.retrieveFile)(`${recordFile.path}/${file}`).catch(err => console.error(err))
        if (!data) {
          throw new Error(`Could not read entity ${file}`)
        }
        dataSet.push(data)
      }
      return dataSet
    }())
  })
}
exports.retrieveRecords = retrieveRecords
