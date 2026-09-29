'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.reconcileJoins = void 0
const _splitEntityProperty = require('./parsers/splitEntityProperty')
const _reconcileJoin = require('./reconcileJoin')
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
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityA, propA)
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityB, propB)
    }
  }
  return dataSet
}
exports.reconcileJoins = reconcileJoins
