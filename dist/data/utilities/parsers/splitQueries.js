'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.splitQueries = void 0
require('core-js/modules/esnext.async-iterator.filter.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.filter.js')
const queryMatch = /\s*(?=(?:delete|insert|read|update)\s+[a-z0-9._-]+)\s*/i
const splitQueries = function () {
  const queries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  return queries.split(queryMatch).filter(query => query.length > 0)
}
exports.splitQueries = splitQueries
