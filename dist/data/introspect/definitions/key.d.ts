import { reference } from './keyReference';
import { fieldName } from './field';
/**
 * @typedef {string} indexType
 */
export type indexType = string;
/**
 * @typedef {string} indexLocation
 */
export type indexLocation = string;
/**
 * @typedef {Object} keyDefinition
 * @property {indexType} type
 * @property {Array<fieldName>} fields
 * @property {indexLocation} lookup
 * @property {Array<reference>|undefined} references
 */
export type keyDefinition = {
    type: indexType;
    fields: Array<fieldName>;
    lookup: indexLocation;
    references?: Array<reference>;
};
/**
 * @typedef {Object} keyProperties
 * @property {indexType} type
 * @property {Array<fieldName>} fields
 * @property {indexLocation} lookup
 * @property {Array<reference>} references
 */
export type keyProperties = {
    type?: indexType;
    fields?: Array<fieldName>;
    lookup?: indexLocation;
    references?: Array<reference>;
};
/**
 * Create a field key.
 * @param {keyProperties} properties
 * @param {string} [properties.type='index']
 * @param {Array<fieldName>} [properties.fields=[]]
 * @param {string} [properties.lookup='']
 * @param {Array<reference>} [properties.references=[]]
 * @returns {keyDefinition}
 */
export declare const key: ({ type, fields, lookup, references }?: keyProperties) => keyDefinition;
