import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'

/**
 * Delete a folder of the database and everything in it; a folder that doesn't exist is left alone. Node only.
 * @param path - A path inside the database, such as `__indexes/users`.
 */
export const removeDirectory = async (path: string): Promise<void> => {
  await nodeFiles().rm(storagePath(path), { recursive: true, force: true })
}
