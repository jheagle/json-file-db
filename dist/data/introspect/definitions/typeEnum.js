'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.typeEnum = void 0
const typeEnum = function () {
  const values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []
  const value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
  const optional = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false
  if (values.includes(value)) {
    return true
  }
  return typeof value === 'undefined' && optional
}
exports.typeEnum = typeEnum
