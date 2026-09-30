'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.keyGenerate = void 0
const _keyUnique = require('./keyUnique')
const keyGenerate = async (entity, references = []) => {
  let uuid = null
  let isUnique = false
  while (!isUnique) {
    uuid = crypto.randomUUID()
    isUnique = await (0, _keyUnique.keyUnique)(entity, references, [uuid])
  }
  return uuid
}
exports.keyGenerate = keyGenerate
