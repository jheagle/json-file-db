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
  if (!dataSets[entity].length) {
    // Nothing indexed entity's own rows yet (no WHERE condition narrowed them down ahead of this -
    // that only happens via getConditionIndexedList, called just before this). The loop below can't
    // pre-resolve anything against zero rows, so leave parsed.joinClauses exactly as parsed: the
    // later, unconditional joinEntity() call (once this command's own read actually runs) still
    // needs the real clauses to do the join itself. Previously this fell through to the loop,
    // which never ran, leaving reducedJoins (and so parsed.joinClauses) empty regardless of what
    // was actually parsed - silently discarding every join clause whenever the query had no WHERE.
    return parsed
  }
  if (!joinClauses.length) {
    // A WHERE condition DID index entity's own rows above, but this query has no join at all -
    // joinEntity is undefined. The loop below writes dataSets[entity][anEntity][joinEntity]
    // unconditionally; left unguarded, that assigns a literal "undefined" key (object[undefined]
    // coerces to the string "undefined") onto every row, since there's no join to actually attach.
    return parsed
  }
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
      if (!Object.prototype.hasOwnProperty.call(recordData, entityA)) {
        recordData[entityA] = await retrieveRecord(entityA)
      }
      if (!Object.prototype.hasOwnProperty.call(recordData, entityB)) {
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
