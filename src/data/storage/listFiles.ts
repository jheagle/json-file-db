import { storagePath } from './storagePath'
import { nodeFiles } from './nodeFiles'
import { pendingListing } from './writeSet'

/**
 * Every file in a folder of the database and the folders inside it, as paths inside the database (such as
 * `users/1.json`), sorted. During a statement it counts what the statement has written or deleted (see withWriteSet).
 * A folder that doesn't exist has no files. Node only.
 * @param path - A path inside the database, such as `users`. Empty for the whole database.
 */
export const listFiles = async (path: string = ''): Promise<string[]> => {
  const { relative } = require('path')
  const folder = storagePath(path)
  const base = path ? `${path.replace(/\/+$/, '')}/` : ''
  let onDisk: string[] = []
  try {
    const entries = await nodeFiles().readdir(folder, { recursive: true, withFileTypes: true })
    onDisk = entries
      .filter(entry => entry.isFile())
      .map(entry => {
        // readdir normalizes the folders it reports (`./database/` comes back as `database`), so work from the
        // file's place relative to the folder listed, and build its location the way every other storage call does
        const inside = relative(folder, entry.parentPath)
        return storagePath(`${base}${inside ? `${inside.split('\\').join('/')}/` : ''}${entry.name}`)
      })
  } catch (error) {
    if ((error as { code?: string })?.code !== 'ENOENT') {
      throw error
    }
  }
  const root = storagePath()
  return pendingListing(folder, onDisk)
    .map(location => location.slice(root.length))
    .sort()
}
