'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.reconcileJoin = void 0
require('core-js/modules/esnext.async-iterator.for-each.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.for-each.js')
var _where = require('../queries/where')
const reconcileJoin = (dataSet, entityName, entityKey, joinEntity, joinProp) => {
  const entity = dataSet[entityName][entityKey]
  if (entity.hasOwnProperty(joinEntity) && Array.isArray(entity[joinEntity])) {
    entity[joinEntity].forEach((mergedEntity, k) => {
      const matchedEntity = (0, _where.where)(dataSet[joinEntity], {
        property: joinProp,
        comparator: '=',
        value: mergedEntity[joinProp]
      })
      if (matchedEntity.length) {
        dataSet[entityName][entityKey][joinEntity][k] = matchedEntity[0]
      }
    })
  }
  return dataSet
}
exports.reconcileJoin = reconcileJoin
