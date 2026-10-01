'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.joinEntity = void 0
const _siFunciona = _interopRequireDefault(require('si-funciona'))
const _readEntity = require('./readEntity')
const _useJoinClause = require('../utilities/useJoinClause')
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
const joinEntity = async (entity, joinEntity, dataSets = {}, joinClauses = [], entityAlreadyResolved = false) => {
  // Same ambiguity readEntity() always has (can't tell "never loaded" from "loaded, zero rows
  // matched") - runQuery already resolved entity's rows via an indexed condition in that second
  // case, so entityAlreadyResolved tells this call not to reload and silently discard that result.
  if (!entityAlreadyResolved) {
    dataSets = await (0, _readEntity.readEntity)(entity, dataSets)
  }
  if (!joinClauses.length) {
    return dataSets
  }
  dataSets = await (0, _readEntity.readEntity)(joinEntity, dataSets)
  for (const anEntity in dataSets[entity]) {
    let filterJoins = _siFunciona.default.cloneObject(dataSets)
    filterJoins[entity] = [dataSets[entity][anEntity]]
    for (const joinClause of joinClauses) {
      filterJoins = await (0, _useJoinClause.useJoinClause)(joinClause, dataSets, filterJoins)
    }
    dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity]
  }
  return dataSets
}
exports.joinEntity = joinEntity
