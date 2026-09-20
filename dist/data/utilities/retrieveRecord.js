'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveRecord = void 0
const _retrieveFile = require('./retrieveFile')
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
const retrieveRecord = (...args_1) => __awaiter(void 0, [...args_1], void 0, function * (entity = '') {
  return yield (0, _retrieveFile.retrieveFile)(`${entity}.json`)
})
exports.retrieveRecord = retrieveRecord
