'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.mergeJoin = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.map.js')
const _readEntity = require('../queries/readEntity')
const _splitEntityProperty = require('./parsers/splitEntityProperty')
const _where = require('../queries/where')
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
const mergeJoin = (...args_1) => __awaiter(void 0, [...args_1], void 0, function * (propertyA = '', propertyB = '', dataSets = {}) {
  const {
    entity: entityA,
    property: propA
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyA)
  const {
    entity: entityB,
    property: propB
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyB)
  dataSets = yield (0, _readEntity.readEntity)(entityA, dataSets)
  dataSets = yield (0, _readEntity.readEntity)(entityB, dataSets)
  dataSets[entityA] = dataSets[entityA].map(dataA => {
    const matches = (0, _where.where)(dataSets[entityB], {
      property: propB,
      comparator: '=',
      value: dataA[propA]
    })
    if (!matches.length) {
      return dataA
    }
    const mergeMatch = matches[0]
    for (const prop in mergeMatch) {
      if (prop === propB) {
        // Skip the condition property since it is irrelevant
        continue
      }
      dataA[`${entityB}.${prop}`] = mergeMatch[prop]
    }
    return dataA
  })
  return dataSets
})
exports.mergeJoin = mergeJoin
