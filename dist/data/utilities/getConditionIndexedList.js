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
const getConditionIndexedList = async (parsed, recordData, dataSet) => {
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
      recordData[entity] = await (0, _retrieveRecord.retrieveRecord)(entity)
    }
    const indexed = {}
    const retrieveMatchedFiles = async (entity, property, recordData, condition, dataSet, indexed) => {
      const matchedRecords = (0, _where.where)(indexed[entity][property], {
        property: 'value',
        comparator: condition.comparator,
        value: condition.value
      })
      for (const matchedRecord of matchedRecords) {
        for (const file of matchedRecord.record) {
          dataSet[entity].push(await (0, _retrieveFile.retrieveFile)(`${entity}/${file}`))
        }
      }
    }
    const isIndexed = await (0, _getMatchingIndexes.getMatchingIndexes)(entity, property, recordData, condition, dataSet, indexed, retrieveMatchedFiles)
    if (!isIndexed) {
      reducedConditions.push(condition)
    }
  }
  parsed.conditions = reducedConditions
  return parsed
}
exports.getConditionIndexedList = getConditionIndexedList
