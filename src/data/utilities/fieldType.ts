import { recordDefinition } from '../introspect/definitions/record'
import { keyDefinition } from '../introspect/definitions/key'

/**
 * The declared type of one of a record's fields, or undefined when the record or field is unknown.
 * @param record
 * @param property
 */
export const fieldType = (record: recordDefinition | undefined, property: string): string | undefined =>
  record?.definition?.find(field => field.name === property)?.type

/**
 * The declared type of the value a key indexes: its field's type for a single-field key. A
 * multi-field key's value is a composite (see computeKeyValue), so it has no single declared type.
 * @param record
 * @param key
 */
export const keyValueType = (record: recordDefinition | undefined, key: keyDefinition): string | undefined =>
  key.fields.length === 1 ? fieldType(record, key.fields[0]) : undefined
