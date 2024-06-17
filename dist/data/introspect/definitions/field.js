'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.field = void 0
require('core-js/modules/esnext.async-iterator.map.js')
require('core-js/modules/esnext.iterator.map.js')
var _key = require('./key')
const field = function () {
  const {
    name = '_id',
    type = 'string',
    optional = false,
    useDefault = false,
    defaultValue = '',
    keys = []
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  const returnField = {
    name: name,
    type: type,
    optional: optional,
    keys: keys.map(_key.key)
  }
  if (useDefault) {
    returnField.default = defaultValue
  }
  return returnField
}
exports.field = field
