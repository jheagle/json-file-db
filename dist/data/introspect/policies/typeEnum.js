'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.typeEnum = void 0
require('core-js/modules/es.array.includes.js')
const typeEnum = (values = [], value = '', optional = false) => {
  if (values.includes(value)) {
    return true
  }
  return typeof value === 'undefined' && optional
}
exports.typeEnum = typeEnum
