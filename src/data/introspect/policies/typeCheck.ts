/**
 * The type names typeCheck knows. The create statement accepts only these; create() accepts any name (see below).
 */
export const fieldTypes = ['string', 'int', 'boolean', 'object', 'array']

/**
 * Validate (and where sensible, coerce) a value against a field's declared type. Runs only
 * against values being written by insertEntity/updateEntity - it never re-validates data already
 * on disk, so a field whose declared type doesn't match its already-stored values (which can
 * happen, since nothing enforced this before) is left alone until something actually updates it.
 * An unrecognized type name is treated as unconstrained rather than rejected, so a typo in a
 * schema's field type can't silently block every write to that field.
 *
 * A null is a real JSON null, kept as it is for a nullable field and rejected for any other, of
 * any type: it is never coerced, so a string field can't store the text "null" or an int field 0.
 * @param type
 * @param value
 * @param nullable - Whether the field may hold null (the field definition's `nullable`).
 */
export const typeCheck = (type: string = 'string', value: any = undefined, nullable: boolean = false): any => {
  if (typeof value === 'undefined') {
    return value
  }
  if (value === null) {
    if (nullable) {
      return value
    }
    throw new Error('Value "null" is not allowed: the field is not nullable')
  }
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value : String(value)
    case 'int': {
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
