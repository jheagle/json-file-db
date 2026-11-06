import * as jsEnv from 'browser-or-node'
import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'

/**
 * Read and parse one JSON file of the database: from disk in Node, over `fetch()` in a browser (see storagePath for
 * where it's looked for).
 * @param path - A path inside the database, such as `users.json`.
 * @throws {Error} When the file can't be read or isn't valid JSON (the error from the file system, fetch or JSON.parse).
 */
export const readJson = async (path: string): Promise<any> => {
  const location = storagePath(path)
  if (jsEnv.isNode) {
    return JSON.parse(await nodeFiles().readFile(location, 'utf8'))
  }
  return fetch(location).then(response => response.json())
}
