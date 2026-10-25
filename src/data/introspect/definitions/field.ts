export type fieldName = string

export type fieldDefinition = {
  name: fieldName
  type: string
  optional: boolean
  nullable?: boolean
  default?: any
  autoGenerate: boolean
}

export type fieldProperties = {
  name?: string
  type?: string
  optional?: boolean
  nullable?: boolean
  useDefault?: boolean
  defaultValue?: any
  autoGenerate?: boolean
}

/**
 * Generate a field for a record. `nullable` is only stored when true (like `default`), so fields
 * that never mention it, and schemas written before it existed, stay exactly as they were.
 * @param properties
 * @param properties.name
 * @param properties.type
 * @param properties.optional
 * @param properties.nullable
 * @param properties.useDefault
 * @param properties.defaultValue
 * @param properties.autoGenerate
 */
export const field = ({
  name = '',
  type = 'string',
  optional = false,
  nullable = false,
  useDefault = false,
  defaultValue = '',
  autoGenerate = false
}: fieldProperties = {}): fieldDefinition => {
  const returnField = {
    name,
    type,
    optional,
    autoGenerate,
  }
  if (nullable) {
    returnField['nullable'] = true
  }
  if (useDefault) {
    returnField['default'] = defaultValue
  }
  return returnField
}
