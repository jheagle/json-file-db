import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'

/**
 * Create a folder of the database, and any missing folders above it (doing nothing if it already exists). Node only.
 * @param path - A path inside the database, such as `users`. Empty for the database folder itself.
 */
export const makeDirectory = async (path: string = ''): Promise<void> => {
  await nodeFiles().mkdir(storagePath(path), { recursive: true })
}
