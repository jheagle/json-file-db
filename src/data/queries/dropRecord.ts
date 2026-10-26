import { drop } from '../introspect/drop'
import { recordDefinition } from '../introspect/definitions/record'
import { retrieveRecord } from '../utilities/retrieveRecord'
import { recordExists } from '../utilities/recordExists'
import { splitEntityProperty } from '../utilities/parsers/splitEntityProperty'
import { getSetting } from '../utilities/config'

/**
 * RESTRICT, as MySQL does for a referenced table: reject dropping a record while another record has a foreign key
 * referencing it, since every write to that record would then fail looking for the dropped one. A record referencing
 * itself doesn't count. Off with enforceForeignKeys, like the row-level checks.
 * @param entity
 */
const assertNotReferenced = async (entity: string): Promise<void> => {
  if (!getSetting('enforceForeignKeys', true) || !recordExists('__RECORDS')) {
    return
  }
  const registry = await retrieveRecord('__RECORDS')
  for (const fileName of registry.entries) {
    const other = fileName.replace(/\.json$/, '')
    if (other === entity || !recordExists(other)) {
      continue
    }
    for (const key of (await retrieveRecord(other)).keys) {
      if (key.type !== 'foreign' || !key.references) {
        continue
      }
      if (key.references.some(reference => splitEntityProperty(reference.fields[0]).entity === entity)) {
        throw new Error(`Cannot drop "${entity}": ${other}.${key.fields.join(', ')} references it`)
      }
    }
  }
}

/**
 * Run a parsed drop statement: an error if the record doesn't exist, unless the statement says `if exists` (then
 * nothing happens and the result is null). Otherwise drop() it and resolve to the definition it had.
 * @param entity
 * @param ifExists
 */
export const dropRecord = async (entity: string, ifExists: boolean): Promise<recordDefinition | null> => {
  if (!recordExists(entity)) {
    if (ifExists) {
      return null
    }
    throw new Error(`Record "${entity}" doesn't exist`)
  }
  await assertNotReferenced(entity)
  const record = await retrieveRecord(entity)
  await drop(entity)
  return record
}
