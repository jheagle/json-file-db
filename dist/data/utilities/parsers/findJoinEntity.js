'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findJoinEntity = void 0
var _removeFromQuery = require('./removeFromQuery')
const joinEntityMatch = /\.([a-z0-9_-]+)/i
/**
 * Extract the main join entity from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
const findJoinEntity = (parsed, query) => {
  const joinEntityFound = query.match(joinEntityMatch)
  if (joinEntityFound) {
    parsed.joinEntity = joinEntityFound ? joinEntityFound[1] : undefined
    return (0, _removeFromQuery.removeFromQuery)(joinEntityFound[0], query)
  }
  return query
}
exports.findJoinEntity = findJoinEntity
