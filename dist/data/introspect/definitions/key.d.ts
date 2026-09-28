import { reference } from './keyReference';
import { fieldName } from './field';
export type indexType = string;
export type indexLocation = string;
export type keyDefinition = {
    type: indexType;
    fields: Array<fieldName>;
    lookup: indexLocation;
    references?: Array<reference>;
};
export type keyProperties = {
    type?: indexType;
    fields?: Array<fieldName>;
    lookup?: indexLocation;
    references?: Array<reference>;
};
/**
 * Create a field key.
 * @param properties
 * @param properties.type
 * @param properties.fields
 * @param properties.lookup
 * @param properties.references
 */
export declare const key: ({ type, fields, lookup, references }?: keyProperties) => keyDefinition;
//# sourceMappingURL=key.d.ts.map