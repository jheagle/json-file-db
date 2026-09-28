import { keyReference, reference } from './keyReference'
import { fieldName } from './field'

export type indexType = string

export type indexLocation = string

export type keyDefinition = {
  type: indexType
  fields: Array<fieldName>
  lookup: indexLocation
  references?: Array<reference>
}

export type keyProperties = {
  type?: indexType
  fields?: Array<fieldName>
  lookup?: indexLocation
  references?: Array<reference>
}

/**
 * Create a field key.
 * @param properties
 * @param properties.type
 * @param properties.fields
 * @param properties.lookup
 * @param properties.references
 */
export const key = ({
  type = 'index',
  fields = [],
  lookup = '',
  references = []
}: keyProperties = {}): keyDefinition => {
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
    type: type,
    fields: fields,
    lookup: lookup
  }
  if (typeof references !== 'undefined' && references.length > 0) {
    keyDefinition['references'] = references.map(keyReference)
  }
  return keyDefinition
}