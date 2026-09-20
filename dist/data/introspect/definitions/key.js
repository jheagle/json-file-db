'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.key = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.map.js')
const _keyReference = require('./keyReference')
/**
 * Create a field key.
 * @param {keyProperties} properties
 * @param {string} [properties.type='index']
 * @param {Array<fieldName>} [properties.fields=[]]
 * @param {string} [properties.lookup='']
 * @param {Array<reference>} [properties.references=[]]
 * @returns {keyDefinition}
 */
const key = ({
  type = 'index',
  fields = [],
  lookup = '',
  references = []
} = {}) => {
  switch (type) {
    case 'primary':
    case 'index':
    case 'unique':
      references = []
      break
    case 'multi':
      if (fields.length < 2) {
        throw new Error('Multi key indicated with less than two fields')
      }
      break
    case 'foreign':
      if (references.length < 1) {
        throw new Error('Foreign key must have one reference to an external record')
      }
      break
    default:
      throw new Error('Unrecognized key type; must be index, primary, unique, multi, or foreign')
  }
  const keyDefinition = {
    type,
    fields,
    lookup
  }
  if (typeof references !== 'undefined' && references.length > 0) {
    keyDefinition.references = references.map(_keyReference.keyReference)
  }
  return keyDefinition
}
exports.key = key
