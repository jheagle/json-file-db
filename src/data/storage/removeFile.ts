import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'

/**
 * Delete one file of the database. Node only.
 * @param path - A path inside the database, such as `users/1.json`.
 * @throws {Error} When the file doesn't exist.
 */
export const removeFile = async (path: string): Promise<void> => {
  await nodeFiles().rm(storagePath(path))
}
