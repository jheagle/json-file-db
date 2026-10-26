import { getSetting } from './config'

/**
 * Whether a record (its `<name>.json` file) exists in the database. Node only, like the schema statements that use it.
 * @param entity
 */
export const recordExists = (entity: string): boolean => {
  const { existsSync } = require('fs')
  return existsSync(`${getSetting('databasePath', 'database/')}${entity}.json`)
}
