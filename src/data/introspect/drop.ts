import { retrieveFile } from '../utilities/retrieveFile'
import { deregisterRecord } from '../utilities/deregisterRecord'
import { getSetting } from '../utilities/config'
import { requireNode } from '../utilities/requireNode'

const { rm } = require('fs/promises')

export const drop = async (record) => {
  requireNode('drop()')
  const databasePath = getSetting('databasePath', 'database/')
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = await retrieveFile(`${record}.json`)
  for (const file of recordFile.entries) {
    await rm(`${databasePath}${recordFile.path}/${file}`)
  }
  await rm(`${databasePath}${recordFile.path}`, { recursive: true, force: true })
  await rm(`${databasePath}__indexes/${recordFile.path}`, { recursive: true, force: true })
  await rm(`${databasePath}${record}.json`)
  await deregisterRecord(record)
}
