import { keyDefinition } from '../introspect/definitions/key';
import { recordPath } from '../introspect/definitions/record';
import { indexEntry } from './updateIndex';
/**
 * Remove a single entry file from the index that backs one of a record's keys, dropping a value
 * entirely once its last file is removed. A key with no lookup, or an index file that doesn't
 * exist yet, is left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 */
export declare const removeFromIndex: (path?: recordPath, key?: keyDefinition, value?: any, fileName?: string) => Promise<indexEntry[] | null>;
//# sourceMappingURL=removeFromIndex.d.ts.map