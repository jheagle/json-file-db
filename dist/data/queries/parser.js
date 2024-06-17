'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.parser = void 0
var _splitQueries = require('../utilities/parsers/splitQueries')
var _parseQuery = require('../utilities/parsers/parseQuery')
const parser = function () {
  const queries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  const queryArray = (0, _splitQueries.splitQueries)(queries)
  const parsedQueries = []
  let mergeQuery = ''
  for (const query of queryArray) {
    mergeQuery = mergeQuery ? `${mergeQuery}${query}` : query
    let parsedQuery = {}
    try {
      parsedQuery = (0, _parseQuery.parseQuery)(mergeQuery)
      mergeQuery = ''
    } catch (e) {
      // attempt to combine queries to fix bad splits
      continue
    }
    parsedQueries.push(parsedQuery)
  }
  if (mergeQuery) {
    throw new Error(`Failed to interpret: ${mergeQuery}`)
  }
  return parsedQueries
}
exports.parser = parser
