import { retrieveRecords } from '../utilities/retrieveRecords'

export const readEntity = async (entity = '', dataSet = {}) => {
  if (!dataSet.hasOwnProperty(entity) || !dataSet[entity].length) {
    dataSet[entity] = await retrieveRecords(entity)
  }
  return dataSet
}
