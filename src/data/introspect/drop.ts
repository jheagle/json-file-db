import { retrieveFile } from '../utilities/retrieveFile'
import { deregisterRecord } from '../utilities/deregisterRecord'

const gulpConfig = require('js-build-tools/gulp.config')
const { rm } = require('fs/promises')

export const drop = async (record) => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = await retrieveFile(`${record}.json`)
  for (const file of recordFile.entries) {
    await rm(`${databasePath}${recordFile.path}/${file}`)
  }
  await deregisterRecord(record)
}