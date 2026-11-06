import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'
import { cacheRemove } from './readCache'

/**
 * Delete one file of the database. Node only.
 * @param path - A path inside the database, such as `users/1.json`.
 * @throws {Error} When the file doesn't exist.
 */
export const removeFile = async (path: string): Promise<void> => {
  const location = storagePath(path)
  cacheRemove(location)
  await nodeFiles().rm(location)
}
