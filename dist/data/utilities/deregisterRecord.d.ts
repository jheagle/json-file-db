import { recordDefinition } from '../introspect/definitions/record';
/**
 * Remove a record's filename from the __RECORDS registry. A missing registry file is left
 * untouched rather than created, since there's nothing to remove from it.
 * @param recordName
 */
export declare const deregisterRecord: (recordName: string) => Promise<recordDefinition | null>;
//# sourceMappingURL=deregisterRecord.d.ts.map