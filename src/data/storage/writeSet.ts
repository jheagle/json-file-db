import * as jsEnv from 'browser-or-node'
import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'
import { cacheRemove, cacheWrite } from './readCache'

/**
 * The changes one statement has made so far, not yet in storage: files by location (their new text, or null once
 * deleted, kept in the order they were last written), and folders made and removed.
 */
type WriteSet = {
  files: Map<string, string | null>
  madeFolders: Set<string>
  removedFolders: Set<string>
}

const writeSets: Map<string, WriteSet> = new Map()

/**
 * The write set of the database configured now (by its location, see storagePath), if a statement on it is running.
 */
const currentWriteSet = (): WriteSet | undefined => writeSets.get(storagePath())

const folderPrefix = (location: string): string => location.endsWith('/') ? location : `${location}/`

/**
 * Whether `location` is inside one of the folders `folders` (or is one of them).
 * @param location
 * @param folders
 */
const insideAny = (location: string, folders: Set<string>): boolean => {
  for (const folder of folders) {
    if (location === folder || location.startsWith(folderPrefix(folder))) {
      return true
    }
  }
  return false
}

/**
 * Write `text` to `location` so that the file is always either its old or its new content, never half of one: the
 * text goes to a temporary file next to it, which then replaces it (a rename is atomic within one folder).
 * @param location
 * @param text
 */
export const writeAtomically = async (location: string, text: string): Promise<void> => {
  const temporary = `${location}.${crypto.randomUUID()}.tmp`
  const files = nodeFiles()
  try {
    await files.writeFile(temporary, text)
    await files.rename(temporary, location)
  } catch (error) {
    await files.rm(temporary, { force: true })
    throw error
  }
}

/**
 * Put a write set's changes in storage: removed folders first, then new folders, then every written file once (in
 * the order each was last written, so a record's entry list and indexes come after the entries they list), then the
 * deleted files. Deleting last means a delete changes the record file and indexes before its entry files go, so a
 * crash part way leaves an unlisted file behind, never a listed file that's missing. Each change also goes into the
 * read cache, which holds what's in storage.
 * @param writeSet
 */
const commit = async (writeSet: WriteSet): Promise<void> => {
  const files = nodeFiles()
  for (const folder of writeSet.removedFolders) {
    cacheRemove(folder, true)
    await files.rm(folder, { recursive: true, force: true })
    cacheRemove(folder, true)
  }
  for (const folder of writeSet.madeFolders) {
    await files.mkdir(folder, { recursive: true })
  }
  for (const [location, text] of writeSet.files) {
    if (text !== null) {
      await writeAtomically(location, text)
      cacheWrite(location, text)
    }
  }
  for (const [location, text] of writeSet.files) {
    if (text === null) {
      cacheRemove(location)
      await files.rm(location, { force: true })
      cacheRemove(location)
    }
  }
}

/**
 * Run one statement's `task` with a write set for the configured database: its writes and deletes are collected in
 * memory, and reads during the task see them (see pendingFile). When the task finishes, everything it changed is put in
 * storage at once, each file written once however many times the task changed it. When it throws, nothing it changed
 * reaches storage: a multi-row insert or update whose third row fails leaves the first two unwritten too.
 *
 * A task inside another (a public call made from inside a statement) joins the outer write set. Node only: in a
 * browser nothing can be written, so the task just runs.
 * @param task
 */
export const withWriteSet = async <T>(task: () => Promise<T>): Promise<T> => {
  const database = storagePath()
  if (!jsEnv.isNode || writeSets.has(database)) {
    return task()
  }
  const writeSet: WriteSet = { files: new Map(), madeFolders: new Set(), removedFolders: new Set() }
  writeSets.set(database, writeSet)
  let result: T
  try {
    result = await task()
  } finally {
    writeSets.delete(database)
  }
  await commit(writeSet)
  return result
}

/**
 * What the running statement has done to the file at `location`: its pending text, `null` if the statement deleted it
 * (or a folder it was in), or `undefined` when the statement hasn't touched it (or no statement is running).
 * @param location - The file's full location (see storagePath).
 */
export const pendingFile = (location: string): string | null | undefined => {
  const writeSet = currentWriteSet()
  if (!writeSet) {
    return undefined
  }
  if (writeSet.files.has(location)) {
    return writeSet.files.get(location)
  }
  return insideAny(location, writeSet.removedFolders) ? null : undefined
}

/**
 * Keep `text` as the new content of `location` in the running statement's write set. False when no statement is
 * running, so the caller writes to storage itself.
 * @param location
 * @param text
 */
export const stageWrite = (location: string, text: string): boolean => {
  const writeSet = currentWriteSet()
  if (!writeSet) {
    return false
  }
  // Moved to the end, so files are written in the order they were last changed
  writeSet.files.delete(location)
  writeSet.files.set(location, text)
  return true
}

/**
 * Mark `location` deleted in the running statement's write set. False when no statement is running.
 * @param location
 */
export const stageRemove = (location: string): boolean => {
  const writeSet = currentWriteSet()
  if (!writeSet) {
    return false
  }
  writeSet.files.delete(location)
  writeSet.files.set(location, null)
  return true
}

/**
 * Note a folder to create in the running statement's write set. False when no statement is running.
 * @param location
 */
export const stageMakeDirectory = (location: string): boolean => {
  const writeSet = currentWriteSet()
  if (!writeSet) {
    return false
  }
  writeSet.madeFolders.add(location)
  return true
}

/**
 * Mark a folder and everything in it removed in the running statement's write set: what the statement wrote or
 * created inside it so far is dropped with it. False when no statement is running.
 * @param location
 */
export const stageRemoveDirectory = (location: string): boolean => {
  const writeSet = currentWriteSet()
  if (!writeSet) {
    return false
  }
  for (const file of [...writeSet.files.keys()]) {
    if (insideAny(file, new Set([location]))) {
      writeSet.files.delete(file)
    }
  }
  for (const folder of [...writeSet.madeFolders]) {
    if (insideAny(folder, new Set([location]))) {
      writeSet.madeFolders.delete(folder)
    }
  }
  writeSet.removedFolders.add(location)
  return true
}
