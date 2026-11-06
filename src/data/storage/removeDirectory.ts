import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'
import { cacheRemove } from './readCache'

/**
 * Delete a folder of the database and everything in it; a folder that doesn't exist is left alone. Node only.
 * @param path - A path inside the database, such as `__indexes/users`.
 */
export const removeDirectory = async (path: string): Promise<void> => {
  const location = storagePath(path)
  cacheRemove(location, true)
  await nodeFiles().rm(location, { recursive: true, force: true })
}
