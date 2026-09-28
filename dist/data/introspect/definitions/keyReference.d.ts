import { fieldName } from './field';
import { recordPath } from './record';
export type reference = {
    fields: fieldName[];
    lookup: recordPath;
};
export type referenceProperties = {
    fields?: fieldName[];
    lookup?: recordPath;
};
/**
 * Create a reference to a remote (foreign; existing on another record) key.
 * @param properties
 * @param properties.fields
 * @param properties.lookup
 */
export declare const keyReference: ({ fields, lookup }?: referenceProperties) => reference;
//# sourceMappingURL=keyReference.d.ts.map