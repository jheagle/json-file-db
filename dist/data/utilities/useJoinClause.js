'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.useJoinClause = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
const _readEntity = require('../queries/readEntity')
const _where = require('../queries/where')
const _splitEntityProperty = require('./parsers/splitEntityProperty')
const _siFunciona = _interopRequireDefault(require('si-funciona'))
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
const useJoinClause = async ({
  propertyA = null,
  comparator = '=',
  propertyB = null
} = {}, dataSets = {}, filterJoins = {}) => {
  const {
    entity: entityA,
    property: propA
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyA)
  const {
    entity: entityB,
    property: propB
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyB)
  if (!Object.prototype.hasOwnProperty.call(dataSets, entityA)) {
    dataSets = await (0, _readEntity.readEntity)(entityA, dataSets)
  }
  if (!Object.prototype.hasOwnProperty.call(dataSets, entityB)) {
    dataSets = await (0, _readEntity.readEntity)(entityB, dataSets)
  }
  if (!Object.prototype.hasOwnProperty.call(filterJoins, entityA)) {
    filterJoins[entityA] = _siFunciona.default.cloneObject(dataSets[entityA])
  }
  if (!Object.prototype.hasOwnProperty.call(filterJoins, entityB)) {
    filterJoins[entityB] = _siFunciona.default.cloneObject(dataSets[entityB])
  }
  filterJoins[entityA] = filterJoins[entityB].reduce((dataA, dataB) => _siFunciona.default.mergeArrays(dataA, (0, _where.where)(filterJoins[entityA], {
    property: propA,
    comparator,
    value: dataB[propB]
  })), [])
  filterJoins[entityB] = filterJoins[entityA].reduce((dataB, dataA) => _siFunciona.default.mergeArrays(dataB, (0, _where.where)(filterJoins[entityB], {
    property: propB,
    comparator,
    value: dataA[propA]
  })), [])
  return filterJoins
}
exports.useJoinClause = useJoinClause
