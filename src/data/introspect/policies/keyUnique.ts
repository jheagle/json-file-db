import { retrieveRecords } from '../../utilities/retrieveRecords'
import { where } from '../../queries/where'

export const keyUnique = async (entity, references = [], checkKey = null) => {
  if (references.length !== 1) {
    return false
  }
  const records = await retrieveRecords(entity)
  const found = where(records, { property: references[0], comparator: '=', value: checkKey })
  return !found.length
}