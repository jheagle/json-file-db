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
const keyReference = function () {
  const {
    fields = [],
    lookup = ''
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  return {
    fields: fields,
    lookup: lookup
  }
}
exports.keyReference = keyReference
