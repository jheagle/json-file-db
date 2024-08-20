'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.record = void 0
require('core-js/modules/esnext.async-iterator.map.js')
require('core-js/modules/esnext.iterator.map.js')
var _field = require('./field')
var _key = require('./key')
/**
 *
 * @param {recordProperties} properties
 * @param {recordPath} properties.path
 * @param {Array<fieldProperties>} properties.definition
 * @param {Array<keyProperties>} properties.keys
 * @param {Array<entityPath>} properties.entries
 * @returns {recordDefinition}
 */
const record = function () {
  const {
    path = '',
    definition = [],
    keys = [],
    entries = []
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  return {
    path: path,
    definition: definition.map(_field.field),
    keys: keys.map(_key.key),
    entries: entries
  }
}
exports.record = record
