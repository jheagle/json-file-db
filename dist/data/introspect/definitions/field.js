'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.field = void 0
/**
 * Generate a field for a record.
 * @param {fieldProperties} properties
 * @param {string} [properties.name='']
 * @param {string} [properties.type='string']
 * @param {boolean} [properties.optional=false]
 * @param {boolean} [properties.useDefault=false]
 * @param {*} [properties.defaultValue='']
 * @param {boolean} [properties.autoGenerate=false]
 * @returns {fieldDefinition}
 */
const field = ({
  name = '',
  type = 'string',
  optional = false,
  useDefault = false,
  defaultValue = '',
  autoGenerate = false
} = {}) => {
  const returnField = {
    name,
    type,
    optional,
    autoGenerate
  }
  if (useDefault) {
    returnField.default = defaultValue
  }
  return returnField
}
exports.field = field
