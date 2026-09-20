'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.keyReference = void 0
/**
 * Create a reference to a remote (foreign; existing on another record) key.
 * @param {referenceProperties} properties
 * @param {Array<fieldName>} properties.fields
 * @param {string} properties.lookup
 * @returns {reference}
 */
const keyReference = ({
  fields = [],
  lookup = ''
} = {}) => ({
  fields,
  lookup
})
exports.keyReference = keyReference
