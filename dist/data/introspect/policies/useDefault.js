'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.useDefault = void 0
const useDefault = (defaultValue = '', value = undefined) => {
  if (typeof value === 'undefined') {
    return defaultValue
  }
  return value
}
exports.useDefault = useDefault
