export const typeEnum = (values = [], value = '', optional = false) => {
  if (values.includes(value)) {
    return true
  }
  return typeof value === 'undefined' && optional
}