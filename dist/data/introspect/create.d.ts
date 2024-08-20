import { recordDefinition } from './definitions/record';
import { keyProperties } from './definitions/key';
import { fieldProperties } from './definitions/field';
/**
 * Create a new record.
 * @param {recordPath} recordName
 * @param {Array<fieldProperties>} definition
 * @param {Array<keyProperties>} keys
 * @returns {Promise}
 */
export declare const create: (recordName: string, definition?: fieldProperties[], keys?: keyProperties[]) => Promise<recordDefinition | null>;
