'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.removeFromQuery = void 0
const removeFromQuery = (substring, query) => query.replace(substring, '').trim()
exports.removeFromQuery = removeFromQuery
