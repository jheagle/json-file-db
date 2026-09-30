'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.runQuery = void 0
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
const _deleteEntity = require('../queries/deleteEntity')
const _insertEntity = require('../queries/insertEntity')
const _readEntity = require('../queries/readEntity')
const _updateEntity = require('../queries/updateEntity')
const _joinEntity = require('../queries/joinEntity')
const _mergeJoins = require('../queries/mergeJoins')
const _where = require('../queries/where')
const _sortBy = require('../queries/sortBy')
const _groupBy = require('../queries/groupBy')
const _limitOffset = require('../queries/limitOffset')
const _selectFields = require('../queries/selectFields')
const _retrieveRecord = require('./retrieveRecord')
const _getConditionIndexedList = require('./getConditionIndexedList')
const _getJoinIndexedList = require('./getJoinIndexedList')
const runQuery = async parsed => {
  const recordData = {
    [parsed.entity]: await (0, _retrieveRecord.retrieveRecord)(parsed.entity)
  }
  if (typeof parsed.joinEntity !== 'undefined') {
    recordData[parsed.joinEntity] = await (0, _retrieveRecord.retrieveRecord)(parsed.joinEntity)
  }
  let dataSet = {
    [parsed.entity]: []
  }
  parsed = await (0, _getConditionIndexedList.getConditionIndexedList)(parsed, recordData, dataSet)
  parsed = await (0, _getJoinIndexedList.getJoinIndexedList)(parsed, recordData, dataSet)
  // delete/update act on whatever is already in dataSet[entity] - unlike read, which loads
  // everything and lets the where-reduce below narrow it down afterward, they never get a second
  // pass. So the matching rows have to be fully resolved (indexed conditions already are, via
  // getConditionIndexedList above; anything left in parsed.conditions is not) before either runs.
  if (parsed.command === 'delete' || parsed.command === 'update') {
    dataSet = await (0, _readEntity.readEntity)(parsed.entity, dataSet)
    dataSet[parsed.entity] = parsed.conditions.reduce((remainingData, condition) => (0, _where.where)(remainingData, condition), dataSet[parsed.entity])
  }
  switch (parsed.command) {
    case 'delete':
      dataSet = await (0, _deleteEntity.deleteEntity)(parsed.entity, dataSet)
      break
    case 'insert':
      dataSet = await (0, _insertEntity.insertEntity)(parsed.entity, parsed.insertValues, dataSet)
      break
    case 'read':
      dataSet = await (0, _readEntity.readEntity)(parsed.entity, dataSet)
      break
    case 'update':
      dataSet = await (0, _updateEntity.updateEntity)(parsed.entity, parsed.updateValues, dataSet)
      break
    default:
      throw new Error(`Unknown command: ${parsed.command}`)
  }
  dataSet = await (0, _joinEntity.joinEntity)(parsed.entity, parsed.joinEntity, dataSet, parsed.joinClauses)
  dataSet = await (0, _mergeJoins.mergeJoins)(dataSet, parsed.mergeJoins)
  // delete/update already had parsed.conditions applied above, before they ran. Re-applying the
  // same conditions here would be wrong, not just redundant, for update specifically: if the
  // update just changed the very field a condition filters on, re-checking that condition against
  // the now-changed data would filter the just-updated rows back out.
  if (parsed.command !== 'delete' && parsed.command !== 'update') {
    dataSet[parsed.entity] = parsed.conditions.reduce((remainingData, condition) => {
      return (0, _where.where)(remainingData, condition)
    }, dataSet[parsed.entity])
  }
  dataSet[parsed.entity] = (0, _sortBy.sortBy)(dataSet[parsed.entity], parsed.sortClauses)
  dataSet[parsed.entity] = (0, _limitOffset.limitOffset)(dataSet[parsed.entity], parsed.offset, parsed.limit)
  dataSet[parsed.entity] = (0, _groupBy.groupBy)(dataSet[parsed.entity], parsed.groupBy)
  dataSet[parsed.entity] = (0, _selectFields.selectFields)(dataSet[parsed.entity], parsed.selectClauses)
  return dataSet
}
exports.runQuery = runQuery
