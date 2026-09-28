'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.findCommand = void 0
const _removeFromQuery = require('./removeFromQuery')
const commandMatch = /^(delete|insert|read|update)\s+([a-z0-9_-]+)[\w\n]*/i
/**
 * Extract command clauses from the query.
 * @param parsed
 * @param query
 */
const findCommand = (parsed, query) => {
  const commandFound = query.match(commandMatch)
  parsed.command = undefined
  parsed.entity = undefined
  if (commandFound) {
    parsed.command = commandFound[1]
    parsed.entity = commandFound[2]
    return (0, _removeFromQuery.removeFromQuery)(commandFound[0], query)
  }
  return query
}
exports.findCommand = findCommand
