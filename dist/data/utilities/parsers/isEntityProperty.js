'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.isEntityProperty = void 0
const isEntityProperty = property => /^[a-z0-9_-]+\.([a-z0-9_-]+)$/i.test(property)
exports.isEntityProperty = isEntityProperty
