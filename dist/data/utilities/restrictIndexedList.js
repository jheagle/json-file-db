'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.restrictIndexedList = void 0
const _splitEntityProperty = require('./parsers/splitEntityProperty')
const restrictIndexedList = (joinClause, filterJoins, indexedClone) => {
  const {
    entity: entityA,
    property: propertyA
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyA)
  const {
    entity: entityB,
    property: propertyB
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyB)
  if (Object.prototype.hasOwnProperty.call(filterJoins, entityA)) {
    const existingEntities = filterJoins[entityA]
    if (!Object.prototype.hasOwnProperty.call(indexedClone, entityA)) {
      indexedClone[entityA] = {}
    }
    if (!Object.prototype.hasOwnProperty.call(indexedClone[entityA], propertyA)) {
      indexedClone[entityA][propertyA] = {}
    }
    indexedClone[entityA][propertyA] = [{
      value: existingEntities[0][propertyA],
      record: existingEntities
    }]
  }
  if (Object.prototype.hasOwnProperty.call(filterJoins, entityB)) {
    const existingEntities = filterJoins[entityB]
    if (!Object.prototype.hasOwnProperty.call(indexedClone, entityB)) {
      indexedClone[entityB] = {}
    }
    if (!Object.prototype.hasOwnProperty.call(indexedClone[entityB], propertyB)) {
      indexedClone[entityB][propertyB] = {}
    }
    indexedClone[entityB][propertyB] = [{
      value: existingEntities[0][propertyB],
      record: existingEntities
    }]
  }
  return indexedClone
}
exports.restrictIndexedList = restrictIndexedList
