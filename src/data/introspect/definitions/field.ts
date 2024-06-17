import { key } from './key'

export const field = ({
  name = '_id',
  type = 'string',
  optional = false,
  useDefault = false,
  defaultValue = '',
  keys = []
} = {}) => {
  const returnField = {
    name: name,
    type: type,
    optional: optional,
    keys: keys.map(key)
  }
  if (useDefault) {
    returnField['default'] = defaultValue
  }
  return returnField
}