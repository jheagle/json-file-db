import { retrieveFile } from '../utilities/retrieveFile'

const gulpConfig = require('js-build-tools/gulp.config')
const { rm } = require('fs/promises')
const databasePath = gulpConfig.get('databasePath', 'database/')

export const drop = async (record) => {
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = await retrieveFile(`${record}.json`)
  for (const file of recordFile.entries) {
    await rm(`${databasePath}${recordFile.path}/${file}`)
  }
}