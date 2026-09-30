import { fieldName } from '../introspect/definitions/field';
/**
 * The value a key (of any field count) indexes and checks uniqueness by. A single-field key uses
 * the field's own raw value directly - this is the pre-existing, already-shipped index file
 * format (e.g. a plain "2024-06-02" or 1), and stays exactly as it was for backward compatibility
 * with real fixture data. A multi-field key has no single value to use, so its fields' values are
 * combined into one deterministic composite (a JSON array), in the same field order as key.fields
 * - two records only share a composite value if every field matches.
 * @param fields
 * @param values
 */
export declare const computeKeyValue: (fields: fieldName[], values: Object) => any;
//# sourceMappingURL=computeKeyValue.d.ts.map