import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'
import { cacheWrite } from './readCache'

/**
 * Write `content` to one file of the database as JSON (indented by 2 spaces), replacing the file if it exists. Its
 * folder must already exist (see makeDirectory). Node only.
 * @param path - A path inside the database, such as `users.json`.
 * @param content - Anything JSON.stringify accepts.
 */
export const writeJson = async (path: string, content: any): Promise<void> => {
  const location = storagePath(path)
  const text = JSON.stringify(content, null, 2)
  await nodeFiles().writeFile(location, text)
  cacheWrite(location, text)
}
