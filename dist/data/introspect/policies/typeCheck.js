'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.typeCheck = void 0
/**
 * Validate (and where sensible, coerce) a value against a field's declared type. Runs only
 * against values being written by insertEntity/updateEntity - it never re-validates data already
 * on disk, so a field whose declared type doesn't match its already-stored values (which can
 * happen, since nothing enforced this before) is left alone until something actually updates it.
 * An unrecognized type name is treated as unconstrained rather than rejected, so a typo in a
 * schema's field type can't silently block every write to that field.
 * @param type
 * @param value
 */
const typeCheck = (type = 'string', value = undefined) => {
  if (typeof value === 'undefined') {
    return value
  }
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value : String(value)
    case 'int':
    {
      const coerced = Number(value)
      if (Number.isNaN(coerced) || !Number.isInteger(coerced)) {
        throw new Error(`Value "${value}" is not a valid int`)
      }
      return coerced
    }
    case 'boolean':
      if (typeof value === 'boolean') {
        return value
      }
      if (value === 'true') {
        return true
      }
      if (value === 'false') {
        return false
      }
      throw new Error(`Value "${value}" is not a valid boolean`)
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`Value "${value}" is not a valid object`)
      }
      return value
    case 'array':
      if (!Array.isArray(value)) {
        throw new Error(`Value "${value}" is not a valid array`)
      }
      return value
    default:
      return value
  }
}
exports.typeCheck = typeCheck
