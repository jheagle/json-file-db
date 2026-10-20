import { recordDefinition } from '../introspect/definitions/record';
import { keyDefinition } from '../introspect/definitions/key';
/**
 * The declared type of one of a record's fields, or undefined when the record or field is unknown.
 * @param record
 * @param property
 */
export declare const fieldType: (record: recordDefinition | undefined, property: string) => string | undefined;
/**
 * The declared type of the value a key indexes: its field's type for a single-field key. A
 * multi-field key's value is a composite (see computeKeyValue), so it has no single declared type.
 * @param record
 * @param key
 */
export declare const keyValueType: (record: recordDefinition | undefined, key: keyDefinition) => string | undefined;
//# sourceMappingURL=fieldType.d.ts.map