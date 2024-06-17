'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.query = void 0
var _parser = require('./parser')
var _runQuery = require('../utilities/runQuery')
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
const query = function () {
  for (var _len = arguments.length, args_1 = new Array(_len), _key = 0; _key < _len; _key++) {
    args_1[_key] = arguments[_key]
  }
  return __awaiter(void 0, [...args_1], void 0, function () {
    const queryString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
    return (function * () {
      const parsedQueries = (0, _parser.parser)(queryString)
      const queryResults = []
      for (const parsed of parsedQueries) {
        const dataSet = yield (0, _runQuery.runQuery)(parsed)
        queryResults.push(dataSet[parsed.entity])
      }
      return queryResults
    }())
  })
}
exports.query = query
