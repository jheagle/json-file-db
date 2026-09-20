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
const _retrieveRecord = require('./retrieveRecord')
const _getConditionIndexedList = require('./getConditionIndexedList')
const _getJoinIndexedList = require('./getJoinIndexedList')
const __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt (value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
        resolve(value)
      })
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled (value) {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    function rejected (value) {
      try {
        step(generator.throw(value))
      } catch (e) {
        reject(e)
      }
    }
    function step (result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next())
  })
}
const runQuery = parsed => __awaiter(void 0, void 0, void 0, function * () {
  const recordData = {
    [parsed.entity]: yield (0, _retrieveRecord.retrieveRecord)(parsed.entity)
  }
  if (typeof parsed.joinEntity !== 'undefined') {
    recordData[parsed.joinEntity] = yield (0, _retrieveRecord.retrieveRecord)(parsed.joinEntity)
  }
  let dataSet = {
    [parsed.entity]: []
  }
  parsed = yield (0, _getConditionIndexedList.getConditionIndexedList)(parsed, recordData, dataSet)
  parsed = yield (0, _getJoinIndexedList.getJoinIndexedList)(parsed, recordData, dataSet)
  switch (parsed.command) {
    case 'delete':
      dataSet = yield (0, _deleteEntity.deleteEntity)(parsed.entity, dataSet)
      break
    case 'insert':
      dataSet = yield (0, _insertEntity.insertEntity)(parsed.entity, parsed.insertValues, dataSet)
      break
    case 'read':
      dataSet = yield (0, _readEntity.readEntity)(parsed.entity, dataSet)
      break
    case 'update':
      dataSet = yield (0, _updateEntity.updateEntity)(parsed.entity, parsed.updateValues, dataSet)
      break
    default:
      throw new Error(`Unknown command: ${parsed.command}`)
  }
  dataSet = yield (0, _joinEntity.joinEntity)(parsed.entity, parsed.joinEntity, dataSet, parsed.joinClauses)
  dataSet = yield (0, _mergeJoins.mergeJoins)(dataSet, parsed.mergeJoins)
  dataSet[parsed.entity] = parsed.conditions.reduce((remainingData, condition) => {
    return (0, _where.where)(remainingData, condition)
  }, dataSet[parsed.entity])
  dataSet[parsed.entity] = (0, _sortBy.sortBy)(dataSet[parsed.entity], parsed.sortClauses)
  dataSet[parsed.entity] = (0, _groupBy.groupBy)(dataSet[parsed.entity], parsed.groupBy)
  return dataSet
})
exports.runQuery = runQuery
