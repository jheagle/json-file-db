'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.matchIndexedJoins = void 0
require('core-js/modules/esnext.async-iterator.reduce.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
var _siFunciona = _interopRequireDefault(require('si-funciona'))
var _where = require('../queries/where')
var _retrieveFile = require('./retrieveFile')
var _splitEntityProperty = require('./parsers/splitEntityProperty')
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
const matchIndexedJoins = (entity, indexedClone, dataSets) => (focusEntity, property, recordData, joinClause, filterJoins, indexed) => __awaiter(void 0, void 0, void 0, function * () {
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
          entityRecord = yield (0, _retrieveFile.retrieveFile)(`${checkProp.entityFirst}/${file}`)
        }
        if (!skipPush) {
          dataSets[checkProp.entityFirst].push(entityRecord)
        }
        filterJoins[checkProp.entityFirst].push(entityRecord)
      }
    }
  }
})
exports.matchIndexedJoins = matchIndexedJoins
