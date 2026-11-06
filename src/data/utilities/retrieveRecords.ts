import { retrieveFile } from './retrieveFile'
import { retrieveRecord } from './retrieveRecord'
import { retrieveFiles } from './retrieveFiles'

/**
 * Read one entry file, failing with the message a missing entry has always had.
 * @param path - The entry's path inside the database, such as `users/1.json`.
 */
export const retrieveEntry = async (path: string): Promise<any> => {
  const data = await retrieveFile(path)
    .catch(err => console.error(err))
  if (!data) {
    throw new Error(`Could not read entity ${path.slice(path.lastIndexOf('/') + 1)}`)
  }
  return data
}

/**
 * Every row of a record, in the record's order, read several at a time (see retrieveFiles).
 * @param entity
 */
export const retrieveRecords = async (entity = '') => {
  const recordFile = await retrieveRecord(entity)
  return retrieveFiles(recordFile.entries.map(file => `${recordFile.path}/${file}`), retrieveEntry)
}
