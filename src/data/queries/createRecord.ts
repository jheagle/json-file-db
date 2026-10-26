import { create } from '../introspect/create'
import { recordDefinition } from '../introspect/definitions/record'
import { ParsedCreate } from '../utilities/parsers/parseCreate'
import { retrieveRecord } from '../utilities/retrieveRecord'
import { splitEntityProperty } from '../utilities/parsers/splitEntityProperty'
import { recordExists } from '../utilities/recordExists'

/**
 * Reject a foreign key whose referenced record, or field on it, doesn't exist. A key referencing the record being
 * created is checked against its own fields.
 * @param entity
 * @param parsed
 */
const assertReferencesExist = async (entity: string, parsed: ParsedCreate): Promise<void> => {
  for (const key of parsed.keys) {
    if (key.type !== 'foreign') {
      continue
    }
    const { entity: refEntity, property: refProperty } = splitEntityProperty(key.references[0].fields[0])
    let fields = parsed.definition.map(field => field.name)
    if (refEntity !== entity) {
      if (!recordExists(refEntity)) {
        throw new Error(`Foreign key "${key.fields[0]}" references "${refEntity}", which doesn't exist`)
      }
      fields = (await retrieveRecord(refEntity)).definition.map(field => field.name)
    }
    if (!fields.includes(refProperty)) {
      throw new Error(`Foreign key "${key.fields[0]}" references "${refEntity}.${refProperty}", which is not a field`)
    }
  }
}

/**
 * Run a parsed create statement: an error if the record already exists, unless the statement says
 * `if not exists` (then nothing happens and the result is null). Otherwise create() it and resolve to its
 * definition, as create() does.
 * @param entity
 * @param parsed
 */
export const createRecord = async (entity: string, parsed: ParsedCreate): Promise<recordDefinition | null> => {
  if (recordExists(entity)) {
    if (parsed.ifNotExists) {
      return null
    }
    throw new Error(`Record "${entity}" already exists`)
  }
  await assertReferencesExist(entity, parsed)
  return create(entity, parsed.definition, parsed.keys)
}
