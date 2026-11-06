import * as jsEnv from 'browser-or-node'
import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'
import { cachedRead } from './readCache'

/**
 * Read and parse one JSON file of the database: from disk in Node, over `fetch()` in a browser (see storagePath for
 * where it's looked for). During a call, a file already read is answered from the read cache (see withReadCache).
 * @param path - A path inside the database, such as `users.json`.
 * @throws {Error} When the file can't be read or isn't valid JSON (the error from the file system, fetch or JSON.parse).
 */
export const readJson = async (path: string): Promise<any> => {
  const location = storagePath(path)
  const text = await cachedRead(location, () => jsEnv.isNode
    ? nodeFiles().readFile(location, 'utf8')
    : fetch(location).then(response => response.text()))
  return JSON.parse(text)
}
