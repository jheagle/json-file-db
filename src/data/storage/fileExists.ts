import { storagePath } from './storagePath'

/**
 * Whether a file (or folder) of the database exists. Node only, like the schema statements that use it.
 * @param path - A path inside the database, such as `users.json`.
 */
export const fileExists = (path: string): boolean => {
  const { existsSync } = require('fs')
  return existsSync(storagePath(path))
}
