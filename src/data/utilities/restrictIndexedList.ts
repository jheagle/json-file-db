import { splitEntityProperty } from './parsers/splitEntityProperty'

export const restrictIndexedList = (joinClause, filterJoins, indexedClone) => {
  const { entity: entityA, property: propertyA } = splitEntityProperty(joinClause.propertyA)
  const { entity: entityB, property: propertyB } = splitEntityProperty(joinClause.propertyB)
  if (filterJoins.hasOwnProperty(entityA)) {
    const existingEntities = filterJoins[entityA]
    if (!indexedClone.hasOwnProperty(entityA)) {
      indexedClone[entityA] = {}
    }
    if (!indexedClone[entityA].hasOwnProperty(propertyA)) {
      indexedClone[entityA][propertyA] = {}
    }
    indexedClone[entityA][propertyA] = [
      {
        value: existingEntities[0][propertyA],
        record: existingEntities
      }
    ]
  }
  if (filterJoins.hasOwnProperty(entityB)) {
    const existingEntities = filterJoins[entityB]
    if (!indexedClone.hasOwnProperty(entityB)) {
      indexedClone[entityB] = {}
    }
    if (!indexedClone[entityB].hasOwnProperty(propertyB)) {
      indexedClone[entityB][propertyB] = {}
    }
    indexedClone[entityB][propertyB] = [
      {
        value: existingEntities[0][propertyB],
        record: existingEntities
      }
    ]
  }

  return indexedClone
}