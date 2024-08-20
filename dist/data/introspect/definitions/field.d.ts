/**
 * @typedef {string} fieldName
 */
export type fieldName = string;
/**
 * @typedef {Object} fieldDefinition
 * @property {fieldName} name
 * @property {string} type
 * @property {boolean} optional
 * @property {boolean} default
 * @property {boolean} autoGenerate
 */
export type fieldDefinition = {
    name: fieldName;
    type: string;
    optional: boolean;
    default?: boolean;
    autoGenerate: boolean;
};
/**
 * @typedef {Object} fieldProperties
 * @param {string} name
 * @param {string} type
 * @param {boolean} optional
 * @param {boolean} useDefault
 * @param {*} defaultValue
 * @param {boolean} autoGenerate
 */
export type fieldProperties = {
    name?: string;
    type?: string;
    optional?: boolean;
    useDefault?: boolean;
    defaultValue?: any;
    autoGenerate?: boolean;
};
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
export declare const field: ({ name, type, optional, useDefault, defaultValue, autoGenerate }?: fieldProperties) => fieldDefinition;
