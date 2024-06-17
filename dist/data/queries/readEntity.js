'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.readEntity = void 0
var _retrieveRecords = require('../utilities/retrieveRecords')
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
const readEntity = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    const entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
    const dataSet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
    return (function * () {
      if (!dataSet.hasOwnProperty(entity) || !dataSet[entity].length) {
        dataSet[entity] = yield (0, _retrieveRecords.retrieveRecords)(entity)
      }
      return dataSet
    }())
  })
}
exports.readEntity = readEntity
