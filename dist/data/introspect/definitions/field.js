'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.field = void 0
/**
 * Generate a field for a record.
 * @param properties
 * @param properties.name
 * @param properties.type
 * @param properties.optional
 * @param properties.useDefault
 * @param properties.defaultValue
 * @param properties.autoGenerate
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
