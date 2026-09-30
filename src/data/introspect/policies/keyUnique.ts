import { retrieveRecords } from '../../utilities/retrieveRecords'
import { where } from '../../queries/where'

/**
 * Check that no existing record already has this combination of values across all of the given
 * fields - a single field for a normal unique/primary key, or several for a composite one.
 * references and checkKeys are parallel arrays: references[i]'s value must equal checkKeys[i].
 * @param entity
 * @param references
 * @param checkKeys
 */
export const keyUnique = async (entity, references = [], checkKeys = []) => {
  if (!references.length || references.length !== checkKeys.length) {
    return false
  }
  let records = await retrieveRecords(entity)
  for (let i = 0; i < references.length; i++) {
    records = where(records, { property: references[i], comparator: '=', value: checkKeys[i] })
  }
  return !records.length
}
