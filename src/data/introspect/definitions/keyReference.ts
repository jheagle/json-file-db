import { fieldName } from './field'
import { recordPath } from './record'

/**
 * @typedef {Object} reference
 * @property {Array<fieldName>} fields
 * @property {string} lookup
 */
export type reference = {
  fields: fieldName[];
  lookup: recordPath;
}

/**
 * @typedef {Object} referenceProperties
 * @property {Array<fieldName>} fields
 * @property {string} lookup
 */
export type referenceProperties = {
  fields?: fieldName[];
  lookup?: recordPath;
}

/**
 * Create a reference to a remote (foreign; existing on another record) key.
 * @param {referenceProperties} properties
 * @param {Array<fieldName>} properties.fields
 * @param {string} properties.lookup
 * @returns {reference}
 */
export const keyReference = ({ fields = [], lookup = '' }: referenceProperties = {}): reference => ({
  fields: fields,
  lookup: lookup
})