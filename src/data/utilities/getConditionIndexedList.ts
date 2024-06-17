import { isEntityProperty } from './parsers/isEntityProperty'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { retrieveRecord } from './retrieveRecord'
import { where } from '../queries/where'
import { retrieveFile } from './retrieveFile'
import { ParsedQuery } from './parsers/parseQuery'
import { getMatchingIndexes } from './getMatchingIndexes'

export const getConditionIndexedList = async (parsed: ParsedQuery, recordData, dataSet) => {
  let reducedConditions = []
  for (let condition of parsed.conditions) {
    let entity = parsed.entity
    let property = condition.property
    if (isEntityProperty(property)) {
      const entityProperty = splitEntityProperty(property)
      entity = entityProperty.entity
      property = entityProperty.property
    }
    if (!recordData.hasOwnProperty(entity)) {
      recordData[entity] = await retrieveRecord(entity)
    }
    const indexed = {}
    const retrieveMatchedFiles = async (entity, property, recordData, condition, dataSet, indexed) => {
      const matchedRecords = where(indexed[entity][property], {
        property: 'value',
        comparator: condition.comparator,
        value: condition.value
      })
      for (let matchedRecord of matchedRecords) {
        for (let file of matchedRecord.record) {
          dataSet[entity].push(await retrieveFile(`${entity}/${file}`))
        }
      }
    }
    let isIndexed = await getMatchingIndexes(entity, property, recordData, condition, dataSet, indexed, retrieveMatchedFiles)
    if (!isIndexed) {
      reducedConditions.push(condition)
    }
  }
  parsed.conditions = reducedConditions
  return parsed

}
