'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.mergeJoins = void 0
var _mergeJoin = require('../utilities/mergeJoin')
var _reconcileJoins = require('../utilities/reconcileJoins')
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
const mergeJoins = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    let dataSet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    const merges = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
    return (function * () {
      if (!merges.length) {
        return dataSet
      }
      for (const merge of merges) {
        dataSet = yield (0, _mergeJoin.mergeJoin)(merge.propertyA, merge.propertyB, dataSet)
        dataSet = (0, _reconcileJoins.reconcileJoins)(merge.propertyA, merge.propertyB, dataSet)
      }
      return dataSet
    }())
  })
}
exports.mergeJoins = mergeJoins
