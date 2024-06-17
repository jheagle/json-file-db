'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveIndexes = void 0
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
const retrieveIndexes = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    const entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
    const properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
    const recordData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    return (function * () {
      if (!recordData.hasOwnProperty(entity)) {
        recordData[entity] = yield (0, _retrieveRecord.retrieveRecord)(entity)
      }
      const indexSet = {}
      for (const property of properties) {
        for (const key of recordData[entity].keys) {
          if (key.fields.includes(property)) {
            indexSet[property] = yield (0, _retrieveFile.retrieveFile)(`__indexes/${entity}/${key.lookup}`)
          }
        }
      }
      return indexSet
    }())
  })
}
exports.retrieveIndexes = retrieveIndexes
