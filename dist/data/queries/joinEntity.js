'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.joinEntity = void 0
var _siFunciona = _interopRequireDefault(require('si-funciona'))
var _readEntity = require('./readEntity')
var _useJoinClause = require('../utilities/useJoinClause')
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
const joinEntity = function (entity_1, joinEntity_1) {
  for (var _len = arguments.length, args_1 = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args_1[_key - 2] = arguments[_key]
  }
  return __awaiter(void 0, [entity_1, joinEntity_1, ...args_1], void 0, function (entity, joinEntity) {
    let dataSets = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    const joinClauses = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : []
    return (function * () {
      dataSets = yield (0, _readEntity.readEntity)(entity, dataSets)
      if (!joinClauses.length) {
        return dataSets
      }
      dataSets = yield (0, _readEntity.readEntity)(joinEntity, dataSets)
      for (const anEntity in dataSets[entity]) {
        let filterJoins = _siFunciona.default.cloneObject(dataSets)
        filterJoins[entity] = [dataSets[entity][anEntity]]
        for (const joinClause of joinClauses) {
          filterJoins = yield (0, _useJoinClause.useJoinClause)(joinClause, dataSets, filterJoins)
        }
        dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity]
      }
      return dataSets
    }())
  })
}
exports.joinEntity = joinEntity
