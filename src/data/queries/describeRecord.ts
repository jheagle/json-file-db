import { recordDefinition } from '../introspect/definitions/record'
import { retrieveRecord } from '../utilities/retrieveRecord'
import { recordExists } from '../utilities/recordExists'

export type recordDescription = Pick<recordDefinition, 'path' | 'definition' | 'keys'>

/**
 * Run a parsed describe statement: the record's fields and keys (describe() in JS gives only the fields). An error
 * if the record doesn't exist.
 * @param entity
 */
export const describeRecord = async (entity: string): Promise<recordDescription> => {
  if (!recordExists(entity)) {
    throw new Error(`Record "${entity}" doesn't exist`)
  }
  const { path, definition, keys } = await retrieveRecord(entity)
  return { path, definition, keys }
}
