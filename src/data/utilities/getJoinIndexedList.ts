import siFunciona from 'si-funciona'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { retrieveRecord } from './retrieveRecord'
import { ParsedQuery } from './parsers/parseQuery'
import { getMatchingIndexes } from './getMatchingIndexes'
import { matchIndexedJoins } from './matchIndexedJoins'
import { restrictIndexedList } from './restrictIndexedList'

export const getJoinIndexedList = async (parsed: ParsedQuery, recordData, dataSets) => {
  let reducedJoins = []
  const indexed = {}
  let firstIteration = true
  const entity = parsed.entity
  const joinEntity = parsed.joinEntity
  const joinClauses = parsed.joinClauses
  for (const anEntity in dataSets[entity]) {
    const currentEntity = dataSets[entity][anEntity]
    // Loop over each of the main entities
    let filterJoins = {}
    filterJoins[entity] = [siFunciona.cloneObject(currentEntity)]
    for (let joinClause of joinClauses) {
      let indexedClone = siFunciona.cloneObject(indexed)
      const { entity: entityA, property: propertyA } = splitEntityProperty(joinClause.propertyA)
      const { entity: entityB, property: propertyB } = splitEntityProperty(joinClause.propertyB)

      // Get the record for the entities A and B, store on the recordData
      if (!recordData.hasOwnProperty(entityA)) {
        recordData[entityA] = await retrieveRecord(entityA)
      }
      if (!recordData.hasOwnProperty(entityB)) {
        recordData[entityB] = await retrieveRecord(entityB)
      }

      indexedClone = restrictIndexedList(joinClause, filterJoins, indexedClone)

      const retrieveMatchedFiles = matchIndexedJoins(entity, indexedClone, dataSets)

      // Check if there are matching keys for the join condition
      const matchAResult = await getMatchingIndexes(entityA, propertyA, recordData, joinClause, filterJoins, indexed)
      const matchBResult = await getMatchingIndexes(entityB, propertyB, recordData, joinClause, filterJoins, indexed, retrieveMatchedFiles)

      const isIndexed = matchAResult || matchBResult

      if (!isIndexed && firstIteration) {
        reducedJoins.push(joinClause)
        firstIteration = false
      }
    }
    dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity]
  }
  parsed.joinClauses = reducedJoins
  return parsed
}
