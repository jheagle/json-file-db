export const useDefault = (defaultValue = '', value = undefined) => {
  if (typeof value === 'undefined') {
    return defaultValue
  }
  return value
}