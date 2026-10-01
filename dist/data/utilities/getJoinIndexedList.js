'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.getJoinIndexedList = void 0
const _siFunciona = _interopRequireDefault(require('si-funciona'))
const _splitEntityProperty = require('./parsers/splitEntityProperty')
const _retrieveRecord = require('./retrieveRecord')
const _getMatchingIndexes = require('./getMatchingIndexes')
const _matchIndexedJoins = require('./matchIndexedJoins')
const _restrictIndexedList = require('./restrictIndexedList')
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
const getJoinIndexedList = async (parsed, recordData, dataSets) => {
  const reducedJoins = []
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
  for (const anEntity in dataSets[entity]) {
    const currentEntity = dataSets[entity][anEntity]
    // Loop over each of the main entities
    const filterJoins = {}
    filterJoins[entity] = [_siFunciona.default.cloneObject(currentEntity)]
    for (const joinClause of joinClauses) {
      let indexedClone = _siFunciona.default.cloneObject(indexed)
      const {
        entity: entityA,
        property: propertyA
      } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyA)
      const {
        entity: entityB,
        property: propertyB
      } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyB)
      // Get the record for the entities A and B, store on the recordData
      if (!Object.prototype.hasOwnProperty.call(recordData, entityA)) {
        recordData[entityA] = await (0, _retrieveRecord.retrieveRecord)(entityA)
      }
      if (!Object.prototype.hasOwnProperty.call(recordData, entityB)) {
        recordData[entityB] = await (0, _retrieveRecord.retrieveRecord)(entityB)
      }
      indexedClone = (0, _restrictIndexedList.restrictIndexedList)(joinClause, filterJoins, indexedClone)
      const retrieveMatchedFiles = (0, _matchIndexedJoins.matchIndexedJoins)(entity, indexedClone, dataSets)
      // Check if there are matching keys for the join condition
      const matchAResult = await (0, _getMatchingIndexes.getMatchingIndexes)(entityA, propertyA, recordData, joinClause, filterJoins, indexed)
      const matchBResult = await (0, _getMatchingIndexes.getMatchingIndexes)(entityB, propertyB, recordData, joinClause, filterJoins, indexed, retrieveMatchedFiles)
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
exports.getJoinIndexedList = getJoinIndexedList
