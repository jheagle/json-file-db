'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.reconcileJoins = void 0
var _splitEntityProperty = require('./parsers/splitEntityProperty')
var _reconcileJoin = require('./reconcileJoin')
const reconcileJoins = (propertyA, propertyB, dataSet) => {
  const {
    entity: entityA,
    property: propA
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyA)
  const {
    entity: entityB,
    property: propB
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyB)
  for (const entityName in dataSet) {
    for (const entityKey in dataSet[entityName]) {
      const entity = dataSet[entityName][entityKey]
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityA, propA)
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityB, propB)
    }
  }
  return dataSet
}
exports.reconcileJoins = reconcileJoins
