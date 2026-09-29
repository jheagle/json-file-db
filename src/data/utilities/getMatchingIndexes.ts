import { retrieveIndexes } from './retrieveIndexes'

export const getMatchingIndexes = async (entity: string, property: string, recordData: Object, clause: Object, dataSet: Object, indexed: Object, cb: Function = null): Promise<boolean> => {
  let isIndexed = false
  for (let key of recordData[entity].keys) {
    if (key.fields.includes(property)) {
      dataSet[entity] = []
      if (!Object.prototype.hasOwnProperty.call(indexed, entity)) {
        indexed[entity] = {}
      }
      if (!Object.prototype.hasOwnProperty.call(indexed[entity], property)) {
        indexed[entity][property] = (await retrieveIndexes(entity, [property], recordData))[property]
      }
      if (typeof cb === 'function') {
        await cb(entity, property, recordData, clause, dataSet, indexed)
      }
      isIndexed = true
    }
  }
  return isIndexed
}
