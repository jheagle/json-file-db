import { retrieveRecords } from '../../utilities/retrieveRecords'
import { where } from '../../queries/where'

/**
 * Check whether any record in the referenced entity has the given property set to the given
 * value - the mirror image of keyUnique(), which checks that no record already has a value.
 * @param entity
 * @param property
 * @param value
 */
export const foreignKeyExists = async (entity: string, property: string, value: any): Promise<boolean> => {
  const records = await retrieveRecords(entity)
  const found = where(records, { property, comparator: '=', value })
  return found.length > 0
}
