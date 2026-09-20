'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.record = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.map.js')
const _field = require('./field')
const _key = require('./key')
/**
 *
 * @param {recordProperties} properties
 * @param {recordPath} properties.path
 * @param {Array<fieldProperties>} properties.definition
 * @param {Array<keyProperties>} properties.keys
 * @param {Array<entityPath>} properties.entries
 * @returns {recordDefinition}
 */
const record = ({
  path = '',
  definition = [],
  keys = [],
  entries = []
} = {}) => {
  return {
    path,
    definition: definition.map(_field.field),
    keys: keys.map(_key.key),
    entries
  }
}
exports.record = record
