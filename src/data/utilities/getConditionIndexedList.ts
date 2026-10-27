import { isEntityProperty } from './parsers/isEntityProperty'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { retrieveRecord } from './retrieveRecord'
import { where } from '../queries/where'
import { retrieveFile } from './retrieveFile'
import { ParsedQuery } from './parsers/parseQuery'
import { getMatchingIndexes } from './getMatchingIndexes'

/**
 * Load only the rows the indexed conditions match, and leave the other conditions for where() to apply later.
 * Conditions are joined by `and`, so a row is loaded only when every indexed condition on its entity matched it: each
 * condition narrows the files the ones before it matched. (Each indexed condition used to replace the rows of the one
 * before, so `where date = 'x' and where exercise_id = 1` returned every row with exercise_id 1, whatever its date.)
 * @param parsed
 * @param recordData
 * @param dataSet
 * @param resolved - Filled with each entity whose rows were loaded here: its rows in dataSet are final (possibly none)
 * and must not be reloaded, even when other conditions are left for where() (an empty list otherwise reads as "not
 * loaded yet", see readEntity).
 */
export const getConditionIndexedList = async (parsed: ParsedQuery, recordData, dataSet, resolved: Set<string> = new Set()) => {
  const reducedConditions = []
  const matchedFiles: { [entity: string]: string[] } = {}
  const indexed = {}
  for (const condition of parsed.conditions) {
    let entity = parsed.entity
    let property = condition.property
    if (isEntityProperty(property)) {
      const entityProperty = splitEntityProperty(property)
      entity = entityProperty.entity
      property = entityProperty.property
    }
    if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
      recordData[entity] = await retrieveRecord(entity)
    }
    const narrowMatchedFiles = async (entity, property, recordData, condition, dataSet, indexed) => {
      const files = new Set<string>(where(indexed[entity][property], {
        property: 'value',
        comparator: condition.comparator,
        value: condition.value,
        type: condition.type
      }).flatMap(matchedRecord => matchedRecord.record))
      matchedFiles[entity] = Object.prototype.hasOwnProperty.call(matchedFiles, entity)
        ? matchedFiles[entity].filter(file => files.has(file))
        : [...files]
    }
    const isIndexed = await getMatchingIndexes(entity, property, recordData, condition, dataSet, indexed, narrowMatchedFiles)
    if (!isIndexed) {
      reducedConditions.push(condition)
    }
  }
  for (const entity of Object.keys(matchedFiles)) {
    resolved.add(entity)
    dataSet[entity] = []
    for (const file of matchedFiles[entity]) {
      dataSet[entity].push(await retrieveFile(`${entity}/${file}`))
    }
  }
  parsed.conditions = reducedConditions
  return parsed
}
