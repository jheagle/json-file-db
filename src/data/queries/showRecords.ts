import { retrieveRecord } from '../utilities/retrieveRecord'
import { recordExists } from '../utilities/recordExists'

/**
 * Run `show records`: the name of every record in the __RECORDS registry, in the order they were created. A database
 * with no records yet (no registry file) gives an empty list.
 */
export const showRecords = async (): Promise<string[]> => {
  if (!recordExists('__RECORDS')) {
    return []
  }
  return (await retrieveRecord('__RECORDS')).entries.map(fileName => fileName.replace(/\.json$/, ''))
}
