'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.keyReference = void 0
/**
 * Create a reference to a remote (foreign; existing on another record) key.
 * @param properties
 * @param properties.fields
 * @param properties.lookup
 */
const keyReference = ({
  fields = [],
  lookup = ''
} = {}) => ({
  fields,
  lookup
})
exports.keyReference = keyReference
