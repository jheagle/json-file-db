'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.query = void 0
const _parser = require('./parser')
const _runQuery = require('../utilities/runQuery')
const query = async (queryString = '') => {
  const parsedQueries = (0, _parser.parser)(queryString)
  const queryResults = []
  for (const parsed of parsedQueries) {
    const dataSet = await (0, _runQuery.runQuery)(parsed)
    queryResults.push(dataSet[parsed.entity])
  }
  return queryResults
}
exports.query = query
