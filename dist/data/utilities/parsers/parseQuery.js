'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.parseQuery = void 0
var _siFunciona = _interopRequireDefault(require('si-funciona'))
var _findCommand = require('./findCommand')
var _findJoinEntity = require('./findJoinEntity')
var _findSelects = require('./findSelects')
var _findConditions = require('./findConditions')
var _findJoinClauses = require('./findJoinClauses')
var _findMergeJoins = require('./findMergeJoins')
var _findSortClauses = require('./findSortClauses')
var _findGroupBy = require('./findGroupBy')
var _findLimit = require('./findLimit')
var _findOffset = require('./findOffset')
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
/**
 * Break a query down into its components.
 * @param {string} query
 * @returns {ParsedQuery}
 */
const parseQuery = query => {
  const parsedQuery = {
    command: undefined,
    entity: undefined,
    joinEntity: undefined,
    selectClauses: [],
    conditions: [],
    joinClauses: [],
    mergeJoins: [],
    sortClauses: [],
    groupBy: undefined,
    limit: undefined,
    offset: undefined
  }
  const {
    curry,
    pipe
  } = _siFunciona.default
  query = pipe(curry(_findCommand.findCommand)(parsedQuery), curry(_findJoinEntity.findJoinEntity)(parsedQuery), curry(_findSelects.findSelects)(parsedQuery), curry(_findConditions.findConditions)(parsedQuery), curry(_findJoinClauses.findJoinClauses)(parsedQuery), curry(_findMergeJoins.findMergeJoins)(parsedQuery), curry(_findSortClauses.findSortClauses)(parsedQuery), curry(_findGroupBy.findGroupBy)(parsedQuery), curry(_findLimit.findLimit)(parsedQuery), curry(_findOffset.findOffset)(parsedQuery))(query)
  if (query) {
    throw new Error(`Unrecognized query value: ${query}`)
  }
  return parsedQuery
}
exports.parseQuery = parseQuery
