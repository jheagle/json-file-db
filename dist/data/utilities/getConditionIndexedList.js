'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.getConditionIndexedList = void 0
const _isEntityProperty = require('./parsers/isEntityProperty')
const _splitEntityProperty = require('./parsers/splitEntityProperty')
const _retrieveRecord = require('./retrieveRecord')
const _where = require('../queries/where')
const _retrieveFile = require('./retrieveFile')
const _getMatchingIndexes = require('./getMatchingIndexes')
const __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt (value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
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
const getConditionIndexedList = (parsed, recordData, dataSet) => __awaiter(void 0, void 0, void 0, function * () {
  const reducedConditions = []
  for (const condition of parsed.conditions) {
    let entity = parsed.entity
    let property = condition.property
    if ((0, _isEntityProperty.isEntityProperty)(property)) {
      const entityProperty = (0, _splitEntityProperty.splitEntityProperty)(property)
      entity = entityProperty.entity
      property = entityProperty.property
    }
    if (!recordData.hasOwnProperty(entity)) {
      recordData[entity] = yield (0, _retrieveRecord.retrieveRecord)(entity)
    }
    const indexed = {}
    const retrieveMatchedFiles = (entity, property, recordData, condition, dataSet, indexed) => __awaiter(void 0, void 0, void 0, function * () {
      const matchedRecords = (0, _where.where)(indexed[entity][property], {
        property: 'value',
        comparator: condition.comparator,
        value: condition.value
      })
      for (const matchedRecord of matchedRecords) {
        for (const file of matchedRecord.record) {
          dataSet[entity].push(yield (0, _retrieveFile.retrieveFile)(`${entity}/${file}`))
        }
      }
    })
    const isIndexed = yield (0, _getMatchingIndexes.getMatchingIndexes)(entity, property, recordData, condition, dataSet, indexed, retrieveMatchedFiles)
    if (!isIndexed) {
      reducedConditions.push(condition)
    }
  }
  parsed.conditions = reducedConditions
  return parsed
})
exports.getConditionIndexedList = getConditionIndexedList
