'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.limitOffset = void 0
/**
 * Slice a dataSet down to at most `limit` rows, starting after the first `offset` of them.
 * @param dataSet
 * @param offset
 * @param limit
 */
const limitOffset = (dataSet = [], offset, limit) => {
  if (typeof offset === 'undefined' && typeof limit === 'undefined') {
    return dataSet
  }
  const start = offset ?? 0
  const end = typeof limit === 'number' ? start + limit : undefined
  return dataSet.slice(start, end)
}
exports.limitOffset = limitOffset
