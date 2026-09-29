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
const _deregisterRecord = require('../utilities/deregisterRecord')
const _config = require('../utilities/config')
const {
  rm
} = require('fs/promises')
const drop = async record => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  if (record === '__RECORDS') {
    return null
  }
  const recordFile = await (0, _retrieveFile.retrieveFile)(`${record}.json`)
  for (const file of recordFile.entries) {
    await rm(`${databasePath}${recordFile.path}/${file}`)
  }
  await rm(`${databasePath}${recordFile.path}`, {
    recursive: true,
    force: true
  })
  await rm(`${databasePath}__indexes/${recordFile.path}`, {
    recursive: true,
    force: true
  })
  await rm(`${databasePath}${record}.json`)
  await (0, _deregisterRecord.deregisterRecord)(record)
}
exports.drop = drop
