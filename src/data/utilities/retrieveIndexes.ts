import { retrieveFile } from './retrieveFile'
import { retrieveRecord } from './retrieveRecord'
import { isSingleFieldKey } from './isSingleFieldKey'
import { retrievePacked } from './packedTable'

export const retrieveIndexes = async (entity = '', properties = [], recordData = {}) => {
  if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
    recordData[entity] = await retrieveRecord(entity)
  }
  const indexSet = {}
  // A packed file holds the record's indexes too, so a browser doesn't request each one
  const packed = await retrievePacked(recordData[entity])
  for (const property of properties) {
    for (const key of recordData[entity].keys) {
      if (isSingleFieldKey(key, property)) {
        // A record with no entries has nothing indexed: read it as an empty index rather than asking for a file that
        // databases made before create() wrote empty indexes never got
        if (!(recordData[entity].entries || []).length) {
          indexSet[property] = []
        } else if (packed && Array.isArray(packed.indexes?.[key.lookup])) {
          indexSet[property] = packed.indexes[key.lookup]
        } else {
          indexSet[property] = await retrieveFile(`__indexes/${entity}/${key.lookup}`)
        }
      }
    }
  }
  return indexSet
}
