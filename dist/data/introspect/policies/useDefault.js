'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.useDefault = void 0
const useDefault = function () {
  const defaultValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  const value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined
  if (typeof value === 'undefined') {
    return defaultValue
  }
  return value
}
exports.useDefault = useDefault
