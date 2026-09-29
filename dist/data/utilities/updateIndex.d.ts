import { keyDefinition } from '../introspect/definitions/key';
import { recordPath } from '../introspect/definitions/record';
export type indexEntry = {
    value: any;
    record: string[];
};
/**
 * Add a single entry file to the index that backs one of a record's keys, creating the index
 * file (and its __indexes/{record} directory) the first time a value is indexed. Keys with no
 * lookup (multi-field keys are not indexed here) are left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 */
export declare const updateIndex: (path?: recordPath, key?: keyDefinition, value?: any, fileName?: string) => Promise<indexEntry[] | null>;
//# sourceMappingURL=updateIndex.d.ts.map