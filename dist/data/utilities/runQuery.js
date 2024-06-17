'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.runQuery = void 0
require('core-js/modules/esnext.async-iterator.reduce.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.reduce.js')
var _deleteEntity = require('../queries/deleteEntity')
var _insertEntity = require('../queries/insertEntity')
var _readEntity = require('../queries/readEntity')
var _updateEntity = require('../queries/updateEntity')
var _joinEntity = require('../queries/joinEntity')
var _mergeJoins = require('../queries/mergeJoins')
var _where = require('../queries/where')
var _sortBy = require('../queries/sortBy')
var _groupBy = require('../queries/groupBy')
var _retrieveRecord = require('./retrieveRecord')
var _getConditionIndexedList = require('./getConditionIndexedList')
var _getJoinIndexedList = require('./getJoinIndexedList')
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt (value) {
    return value instanceof P ? value : new P(function (resolve) {
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
