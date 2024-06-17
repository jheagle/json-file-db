import * as jsEnv from 'browser-or-node'
import * as gulpConfig from 'js-build-tools/gulp.config'

export const retrieveFile = async (path) => {
  let retrieveFn = url => fetch(url).then(res => res.json())
  let relativePath = jsEnv.isBrowser ? gulpConfig.get('relativePath', '') : ''
  if (jsEnv.isNode) {
    const { readFile } = require('fs/promises')
    retrieveFn = url => readFile(url).then(res => JSON.parse(res))
  }
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const fetchUrl = `${relativePath}${databasePath}${path}`
  const recordInfo = await retrieveFn(fetchUrl)
    .catch(err => console.error(err))
  if (!recordInfo) {
    throw new Error(`Could not read ${path}`)
  }
  return recordInfo
}