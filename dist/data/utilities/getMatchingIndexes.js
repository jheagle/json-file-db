'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.getMatchingIndexes = void 0
require('core-js/modules/es.array.includes.js')
const _retrieveIndexes = require('./retrieveIndexes')
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
const getMatchingIndexes = (entity_1, property_1, recordData_1, clause_1, dataSet_1, indexed_1, ...args_1) => __awaiter(void 0, [entity_1, property_1, recordData_1, clause_1, dataSet_1, indexed_1, ...args_1], void 0, function * (entity, property, recordData, clause, dataSet, indexed, cb = null) {
  let isIndexed = false
  for (const key of recordData[entity].keys) {
    if (key.fields.includes(property)) {
      dataSet[entity] = []
      if (!indexed.hasOwnProperty(entity)) {
        indexed[entity] = {}
      }
      if (!indexed[entity].hasOwnProperty(property)) {
        indexed[entity][property] = (yield (0, _retrieveIndexes.retrieveIndexes)(entity, [property], recordData))[property]
      }
      if (typeof cb === 'function') {
        yield cb(entity, property, recordData, clause, dataSet, indexed)
      }
      isIndexed = true
    }
  }
  return isIndexed
})
exports.getMatchingIndexes = getMatchingIndexes
