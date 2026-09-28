'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.matchIndexedJoins = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
const _siFunciona = _interopRequireDefault(require('si-funciona'))
const _where = require('../queries/where')
const _retrieveFile = require('./retrieveFile')
const _splitEntityProperty = require('./parsers/splitEntityProperty')
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
const matchIndexedJoins = (entity, indexedClone, dataSets) => async (focusEntity, property, recordData, joinClause, filterJoins, indexed) => {
  const {
    entity: entityA,
    property: propertyA
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyA)
  const {
    entity: entityB,
    property: propertyB
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyB)
  const properties = [{
    entityFirst: entityA,
    propertyFirst: propertyA,
    entitySecond: entityB,
    propertySecond: propertyB
  }, {
    entityFirst: entityB,
    propertyFirst: propertyB,
    entitySecond: entityA,
    propertySecond: propertyA
  }]
  for (const checkProp of properties) {
    if (!indexedClone.hasOwnProperty(checkProp.entitySecond)) {
      indexedClone[checkProp.entitySecond] = _siFunciona.default.cloneObject(indexed[checkProp.entitySecond])
    }
    const matchedRecords = indexedClone[checkProp.entitySecond][checkProp.propertySecond].reduce((dataA, dataB) => _siFunciona.default.mergeArrays(dataA, (0, _where.where)(indexedClone[checkProp.entityFirst][checkProp.propertyFirst], {
      property: 'value',
      comparator: joinClause.comparator,
      value: dataB.value
    })), [])
    const skipPush = checkProp.entityFirst === entity
    if (!dataSets.hasOwnProperty(checkProp.entityFirst)) {
      dataSets[checkProp.entityFirst] = []
    }
    for (const matchedRecord of matchedRecords) {
      for (const file of matchedRecord.record) {
        let entityRecord = file
        if (typeof file === 'string') {
          entityRecord = await (0, _retrieveFile.retrieveFile)(`${checkProp.entityFirst}/${file}`)
        }
        if (!skipPush) {
          dataSets[checkProp.entityFirst].push(entityRecord)
        }
        filterJoins[checkProp.entityFirst].push(entityRecord)
      }
    }
  }
}
exports.matchIndexedJoins = matchIndexedJoins
