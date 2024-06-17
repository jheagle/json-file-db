import { retrieveFile } from './retrieveFile'
import { retrieveRecord } from './retrieveRecord'

export const retrieveIndexes = async (entity = '', properties = [], recordData = {}) => {
  if (!recordData.hasOwnProperty(entity)) {
    recordData[entity] = await retrieveRecord(entity)
  }
  const indexSet = {}
  for (let property of properties) {
    for (let key of recordData[entity].keys) {
      if (key.fields.includes(property)) {
        indexSet[property] = await retrieveFile(`__indexes/${entity}/${key.lookup}`)
      }
    }
  }
  return indexSet
}