import { keyDefinition } from '../introspect/definitions/key'

/**
 * Whether a key indexes exactly this one field, so its index file can answer a condition or join on that field. A
 * composite key's index holds combined values (`["a",1]`, see computeKeyValue), which never equal one field's value:
 * using it for that field matched nothing. (Using a composite index for its leftmost field is a planned improvement.)
 * @param key
 * @param property
 */
export const isSingleFieldKey = (key: keyDefinition, property: string): boolean =>
  key.fields.length === 1 && key.fields[0] === property
