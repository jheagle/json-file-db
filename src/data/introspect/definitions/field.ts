export type fieldName = string;

export type fieldDefinition = {
  name: fieldName
  type: string
  optional: boolean
  default?: boolean
  autoGenerate: boolean
}

export type fieldProperties = {
  name?: string
  type?: string
  optional?: boolean
  useDefault?: boolean
  defaultValue?: any
  autoGenerate?: boolean
}

/**
 * Generate a field for a record.
 * @param properties
 * @param properties.name
 * @param properties.type
 * @param properties.optional
 * @param properties.useDefault
 * @param properties.defaultValue
 * @param properties.autoGenerate
 */
export const field = ({
  name = '',
  type = 'string',
  optional = false,
  useDefault = false,
  defaultValue = '',
  autoGenerate = false
}: fieldProperties = {}): fieldDefinition => {
  const returnField = {
    name: name,
    type: type,
    optional: optional,
    autoGenerate: autoGenerate,
  }
  if (useDefault) {
    returnField['default'] = defaultValue
  }
  return returnField
}
