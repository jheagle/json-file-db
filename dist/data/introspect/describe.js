'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.describe = void 0
const _retrieveFile = require('../utilities/retrieveFile')
const describe = async (record = '__RECORDS') => {
  const recordFile = await (0, _retrieveFile.retrieveFile)(`${record}.json`)
  if (record === '__RECORDS') {
    return recordFile.entries
  }
  return recordFile.definition
}
exports.describe = describe
