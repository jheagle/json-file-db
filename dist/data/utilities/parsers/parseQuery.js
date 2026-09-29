'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.parseQuery = void 0
const _siFunciona = _interopRequireDefault(require('si-funciona'))
const _findCommand = require('./findCommand')
const _findInsertValues = require('./findInsertValues')
const _findUpdateValues = require('./findUpdateValues')
const _findJoinEntity = require('./findJoinEntity')
const _findSelects = require('./findSelects')
const _findConditions = require('./findConditions')
const _findJoinClauses = require('./findJoinClauses')
const _findMergeJoins = require('./findMergeJoins')
const _findSortClauses = require('./findSortClauses')
const _findGroupBy = require('./findGroupBy')
const _findLimit = require('./findLimit')
const _findOffset = require('./findOffset')
function _interopRequireDefault (e) { return e && e.__esModule ? e : { default: e } }
/**
 * Break a query down into its components.
 * @param query
 */
const parseQuery = query => {
  const parsedQuery = {
    command: undefined,
    entity: undefined,
    joinEntity: undefined,
    selectClauses: [],
    insertValues: [],
    updateValues: {},
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
  query = pipe(curry(_findCommand.findCommand)(parsedQuery), curry(_findInsertValues.findInsertValues)(parsedQuery), curry(_findUpdateValues.findUpdateValues)(parsedQuery), curry(_findJoinEntity.findJoinEntity)(parsedQuery), curry(_findSelects.findSelects)(parsedQuery), curry(_findConditions.findConditions)(parsedQuery), curry(_findJoinClauses.findJoinClauses)(parsedQuery), curry(_findMergeJoins.findMergeJoins)(parsedQuery), curry(_findSortClauses.findSortClauses)(parsedQuery), curry(_findGroupBy.findGroupBy)(parsedQuery), curry(_findLimit.findLimit)(parsedQuery), curry(_findOffset.findOffset)(parsedQuery))(query)
  if (query) {
    throw new Error(`Unrecognized query value: ${query}`)
  }
  return parsedQuery
}
exports.parseQuery = parseQuery
