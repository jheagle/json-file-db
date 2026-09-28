import { fieldDefinition, fieldProperties } from './field';
import { keyDefinition, keyProperties } from './key';
export type recordPath = string;
export type entityPath = string;
export type recordDefinition = {
    path: recordPath;
    definition: fieldDefinition[];
    keys: keyDefinition[];
    entries: entityPath[];
};
export type recordProperties = {
    path?: recordPath;
    definition?: fieldProperties[];
    keys?: keyProperties[];
    entries?: entityPath[];
};
/**
 *
 * @param properties
 * @param properties.path
 * @param properties.definition
 * @param properties.keys
 * @param properties.entries
 */
export declare const record: ({ path, definition, keys, entries }?: recordProperties) => recordDefinition;
//# sourceMappingURL=record.d.ts.map