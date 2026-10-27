import { isEntityProperty } from './parsers/isEntityProperty'
import { splitEntityProperty } from './parsers/splitEntityProperty'
import { retrieveRecord } from './retrieveRecord'
import { where } from '../queries/where'
import { retrieveFile } from './retrieveFile'
import { ParsedQuery } from './parsers/parseQuery'
import { getMatchingIndexes } from './getMatchingIndexes'

/**
 * Load only the candidate rows the indexed conditions match: an index only narrows which rows are read. Every
 * condition, indexed or not, stays in parsed.conditions and is still applied to the candidates afterwards (runQuery),
 * so an index can make a query faster but never changes its result (where-clauses decision 3; it used to remove the
 * conditions it answered, and the 3 bugs fixed in #69 came from that split).
 * Conditions are joined by `and`, so a row is a candidate only when every indexed condition on its entity matched it:
 * each one narrows the files the ones before it matched.
 * @param parsed
 * @param recordData
 * @param dataSet
 * @param resolved - Filled with each entity whose candidate rows were loaded here: they must not be reloaded (an
 * empty list otherwise reads as "not loaded yet", see readEntity).
 */
export const getConditionIndexedList = async (parsed: ParsedQuery, recordData, dataSet, resolved: Set<string> = new Set()) => {
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
    await getMatchingIndexes(entity, property, recordData, condition, dataSet, indexed, narrowMatchedFiles)
  }
  for (const entity of Object.keys(matchedFiles)) {
    resolved.add(entity)
    dataSet[entity] = []
    for (const file of matchedFiles[entity]) {
      dataSet[entity].push(await retrieveFile(`${entity}/${file}`))
    }
  }
  return parsed
}
