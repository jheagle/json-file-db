'use strict'

require('core-js/modules/esnext.async-iterator.constructor.js')
require('core-js/modules/esnext.async-iterator.drop.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.drop.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.drop = void 0
const _retrieveFile = require('../utilities/retrieveFile')
const gulpConfig = require('js-build-tools/gulp.config')
const {
  rm
} = require('fs/promises')
const drop = async record => {
  const databasePath = gulpConfig.get('databasePath', 'database/')
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = await (0, _retrieveFile.retrieveFile)(`${record}.json`)
  for (const file of recordFile.entries) {
    await rm(`${databasePath}${recordFile.path}/${file}`)
  }
}
exports.drop = drop
