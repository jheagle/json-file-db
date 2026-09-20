'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.keyUnique = void 0
const _retrieveRecords = require('../../utilities/retrieveRecords')
const _where = require('../../queries/where')
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
const keyUnique = (entity_1, ...args_1) => __awaiter(void 0, [entity_1, ...args_1], void 0, function * (entity, references = [], checkKey = null) {
  if (references.length !== 1) {
    return false
  }
  const records = yield (0, _retrieveRecords.retrieveRecords)(entity)
  const found = (0, _where.where)(records, {
    property: references[0],
    comparator: '=',
    value: checkKey
  })
  return !found.length
})
exports.keyUnique = keyUnique
