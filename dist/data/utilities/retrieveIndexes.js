'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveIndexes = void 0
require('core-js/modules/es.array.includes.js')
const _retrieveFile = require('./retrieveFile')
const _retrieveRecord = require('./retrieveRecord')
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
const retrieveIndexes = (...args_1) => __awaiter(void 0, [...args_1], void 0, function * (entity = '', properties = [], recordData = {}) {
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
})
exports.retrieveIndexes = retrieveIndexes
