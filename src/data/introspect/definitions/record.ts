import { field, fieldDefinition, fieldProperties } from './field'
import { key, keyDefinition, keyProperties } from './key'

/**
 * @typedef {string} recordPath
 */
export type recordPath = string

/**
 * @typedef {string} entityPath
 */
export type entityPath = string

/**
 * @typedef {Object} recordDefinition
 * @property {recordPath} path
 * @property {Array<fieldDefinition>} definition
 * @property {Array<keyDefinition>} keys
 * @property {Array<entityPath>} entries
 */
export type recordDefinition = {
  path: recordPath
  definition: fieldDefinition[]
  keys: keyDefinition[]
  entries: entityPath[]
}

/**
 * @typedef {Object} recordProperties
 * @property {recordPath} path
 * @property {Array<fieldProperties>} definition
 * @property {Array<keyProperties>} keys
 * @property {Array<entityPath>} entries
 */
export type recordProperties = {
  path?: recordPath
  definition?: fieldProperties[]
  keys?: keyProperties[]
  entries?: entityPath[]
}

/**
 *
 * @param {recordProperties} properties
 * @param {recordPath} properties.path
 * @param {Array<fieldProperties>} properties.definition
 * @param {Array<keyProperties>} properties.keys
 * @param {Array<entityPath>} properties.entries
 * @returns {recordDefinition}
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