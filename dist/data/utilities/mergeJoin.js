'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.mergeJoin = void 0
require('core-js/modules/esnext.async-iterator.map.js')
require('core-js/modules/esnext.iterator.map.js')
var _readEntity = require('../queries/readEntity')
var _splitEntityProperty = require('./parsers/splitEntityProperty')
var _where = require('../queries/where')
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
const mergeJoin = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    const propertyA = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
    const propertyB = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
    let dataSets = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    return (function * () {
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
    }())
  })
}
exports.mergeJoin = mergeJoin
