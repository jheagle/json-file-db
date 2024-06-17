'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.getJoinIndexedList = void 0
var _siFunciona = _interopRequireDefault(require('si-funciona'))
var _splitEntityProperty = require('./parsers/splitEntityProperty')
var _retrieveRecord = require('./retrieveRecord')
var _getMatchingIndexes = require('./getMatchingIndexes')
var _matchIndexedJoins = require('./matchIndexedJoins')
var _restrictIndexedList = require('./restrictIndexedList')
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
const getJoinIndexedList = (parsed, recordData, dataSets) => __awaiter(void 0, void 0, void 0, function * () {
  const reducedJoins = []
  const indexed = {}
  let firstIteration = true
  const entity = parsed.entity
  const joinEntity = parsed.joinEntity
  const joinClauses = parsed.joinClauses
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
      if (!recordData.hasOwnProperty(entityA)) {
        recordData[entityA] = yield (0, _retrieveRecord.retrieveRecord)(entityA)
      }
      if (!recordData.hasOwnProperty(entityB)) {
        recordData[entityB] = yield (0, _retrieveRecord.retrieveRecord)(entityB)
      }
      indexedClone = (0, _restrictIndexedList.restrictIndexedList)(joinClause, filterJoins, indexedClone)
      const retrieveMatchedFiles = (0, _matchIndexedJoins.matchIndexedJoins)(entity, indexedClone, dataSets)
      // Check if there are matching keys for the join condition
      const matchAResult = yield (0, _getMatchingIndexes.getMatchingIndexes)(entityA, propertyA, recordData, joinClause, filterJoins, indexed)
      const matchBResult = yield (0, _getMatchingIndexes.getMatchingIndexes)(entityB, propertyB, recordData, joinClause, filterJoins, indexed, retrieveMatchedFiles)
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
})
exports.getJoinIndexedList = getJoinIndexedList
