import { field, fieldDefinition, fieldProperties } from './field'
import { key, keyDefinition, keyProperties } from './key'

export type recordPath = string

export type entityPath = string

export type recordDefinition = {
  path: recordPath
  definition: fieldDefinition[]
  keys: keyDefinition[]
  entries: entityPath[]
}

export type recordProperties = {
  path?: recordPath
  definition?: fieldProperties[]
  keys?: keyProperties[]
  entries?: entityPath[]
}

/**
 *
 * @param properties
 * @param properties.path
 * @param properties.definition
 * @param properties.keys
 * @param properties.entries
 */
export const record = ({
  path = '',
  definition = [],
  keys = [],
  entries = []
}: recordProperties = {}): recordDefinition => {
  return {
    path: path,
    definition: definition.map(field),
    keys: keys.map(key),
    entries: entries
  }
}