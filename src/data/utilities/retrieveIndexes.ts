import { retrieveFile } from './retrieveFile'
import { retrieveRecord } from './retrieveRecord'
import { isSingleFieldKey } from './isSingleFieldKey'

export const retrieveIndexes = async (entity = '', properties = [], recordData = {}) => {
  if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
    recordData[entity] = await retrieveRecord(entity)
  }
  const indexSet = {}
  for (const property of properties) {
    for (const key of recordData[entity].keys) {
      if (isSingleFieldKey(key, property)) {
        indexSet[property] = await retrieveFile(`__indexes/${entity}/${key.lookup}`)
      }
    }
  }
  return indexSet
}
