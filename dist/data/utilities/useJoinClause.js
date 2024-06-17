'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.useJoinClause = void 0
require('core-js/modules/esnext.async-iterator.reduce.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
var _readEntity = require('../queries/readEntity')
var _where = require('../queries/where')
var _splitEntityProperty = require('./parsers/splitEntityProperty')
var _siFunciona = _interopRequireDefault(require('si-funciona'))
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
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
const useJoinClause = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    const {
      propertyA = null,
      comparator = '=',
      propertyB = null
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    let dataSets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
    const filterJoins = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    return (function * () {
      const {
        entity: entityA,
        property: propA
      } = (0, _splitEntityProperty.splitEntityProperty)(propertyA)
      const {
        entity: entityB,
        property: propB
      } = (0, _splitEntityProperty.splitEntityProperty)(propertyB)
      if (!dataSets.hasOwnProperty(entityA)) {
        dataSets = yield (0, _readEntity.readEntity)(entityA, dataSets)
      }
      if (!dataSets.hasOwnProperty(entityB)) {
        dataSets = yield (0, _readEntity.readEntity)(entityB, dataSets)
      }
      if (!filterJoins.hasOwnProperty(entityA)) {
        filterJoins[entityA] = _siFunciona.default.cloneObject(dataSets[entityA])
      }
      if (!filterJoins.hasOwnProperty(entityB)) {
        filterJoins[entityB] = _siFunciona.default.cloneObject(dataSets[entityB])
      }
      filterJoins[entityA] = filterJoins[entityB].reduce((dataA, dataB) => _siFunciona.default.mergeArrays(dataA, (0, _where.where)(filterJoins[entityA], {
        property: propA,
        comparator: comparator,
        value: dataB[propB]
      })), [])
      filterJoins[entityB] = filterJoins[entityA].reduce((dataB, dataA) => _siFunciona.default.mergeArrays(dataB, (0, _where.where)(filterJoins[entityB], {
        property: propB,
        comparator: comparator,
        value: dataA[propA]
      })), [])
      return filterJoins
    }())
  })
}
exports.useJoinClause = useJoinClause
