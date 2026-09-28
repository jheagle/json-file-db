import { recordDefinition } from './definitions/record';
import { keyProperties } from './definitions/key';
import { fieldProperties } from './definitions/field';
/**
 * Create a new record.
 * @param recordName
 * @param definition
 * @param keys
 */
export declare const create: (recordName: string, definition?: fieldProperties[], keys?: keyProperties[]) => Promise<recordDefinition | null>;
//# sourceMappingURL=create.d.ts.map