import { retrieveRecords } from '../utilities/retrieveRecords'

export const readEntity = async (entity = '', dataSet = {}) => {
  if (!Object.prototype.hasOwnProperty.call(dataSet, entity) || !dataSet[entity].length) {
    dataSet[entity] = await retrieveRecords(entity)
  }
  return dataSet
}
