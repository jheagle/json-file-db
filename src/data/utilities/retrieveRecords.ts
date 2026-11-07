import { retrieveFile } from './retrieveFile'
import { retrieveRecord } from './retrieveRecord'
import { retrieveFiles } from './retrieveFiles'
import { retrievePacked } from './packedTable'
import { recordDefinition } from '../introspect/definitions/record'

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
 * The rows of some of a record's entry files, in the order of `files`: from the record's packed file when there's one
 * that matches the record (see retrievePacked), otherwise (and for any file the packed file doesn't hold) from the
 * entry files, several at a time (see retrieveFiles).
 * @param record
 * @param files - Entry file names, such as `1.json`.
 * @param read - Reads one entry file (default retrieveEntry).
 */
export const retrieveEntryRows = async (record: recordDefinition, files: string[], read: (path: string) => Promise<any> = retrieveEntry): Promise<any[]> => {
  const packed = await retrievePacked(record)
  if (!packed) {
    return retrieveFiles(files.map(file => `${record.path}/${file}`), read)
  }
  const positions = new Map(packed.entries.map((entry, position) => [entry, position]))
  const unpacked = files.filter(file => !positions.has(file))
  const readRows = unpacked.length ? await retrieveFiles(unpacked.map(file => `${record.path}/${file}`), read) : []
  const fromFiles = new Map(unpacked.map((file, position) => [file, readRows[position]]))
  return files.map(file => positions.has(file) ? packed.rows[positions.get(file)] : fromFiles.get(file))
}

/**
 * Every row of a record, in the record's order: from its packed file when there's one that matches (see
 * retrievePacked), otherwise from its entry files, several at a time (see retrieveFiles).
 * @param entity
 */
export const retrieveRecords = async (entity = '') => {
  const recordFile = await retrieveRecord(entity)
  return retrieveEntryRows(recordFile, recordFile.entries)
}
