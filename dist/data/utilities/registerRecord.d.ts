import { recordDefinition } from '../introspect/definitions/record';
/**
 * Add a record's filename to the __RECORDS registry, creating the registry file the first time
 * a record is created if it doesn't already exist.
 * @param recordName
 */
export declare const registerRecord: (recordName: string) => Promise<recordDefinition>;
//# sourceMappingURL=registerRecord.d.ts.map