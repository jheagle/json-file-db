import { storagePath } from './storagePath'
import { cacheWrite } from './readCache'
import { stageWrite, writeAtomically } from './writeSet'

/**
 * Write `content` to one file of the database as JSON (indented by 2 spaces), replacing the file if it exists. Its
 * folder must already exist (see makeDirectory). The file is replaced whole or not at all (see writeAtomically). During a
 * statement the write waits in its write set until the statement succeeds (see withWriteSet). Node only.
 * @param path - A path inside the database, such as `users.json`.
 * @param content - Anything JSON.stringify accepts.
 */
export const writeJson = async (path: string, content: any): Promise<void> => {
  const location = storagePath(path)
  const text = JSON.stringify(content, null, 2)
  if (stageWrite(location, text)) {
    return
  }
  await writeAtomically(location, text)
  cacheWrite(location, text)
}
