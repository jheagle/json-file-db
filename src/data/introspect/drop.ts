import { retrieveFile } from '../utilities/retrieveFile'
import { deregisterRecord } from '../utilities/deregisterRecord'
import { requireNode } from '../utilities/requireNode'
import { removeDirectory, removeFile } from '../storage'

export const drop = async (record) => {
  requireNode('drop()')
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = await retrieveFile(`${record}.json`)
  for (const file of recordFile.entries) {
    await removeFile(`${recordFile.path}/${file}`)
  }
  await removeDirectory(recordFile.path)
  await removeDirectory(`__indexes/${recordFile.path}`)
  await removeFile(`${record}.json`)
  await deregisterRecord(record)
}
