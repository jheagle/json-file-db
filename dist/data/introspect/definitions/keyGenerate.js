'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.keyGenerate = void 0
var _keyUnique = require('./keyUnique')
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
const keyGenerate = function (entity_1) {
  for (var _len = arguments.length, args_1 = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args_1[_key - 1] = arguments[_key]
  }
  return __awaiter(void 0, [entity_1, ...args_1], void 0, function (entity) {
    const references = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : []
    return (function * () {
      let uuid = null
      let isUnique = false
      while (!isUnique) {
        uuid = crypto.randomUUID()
        isUnique = (0, _keyUnique.keyUnique)(entity, references, uuid)
      }
      return uuid
    }())
  })
}
exports.keyGenerate = keyGenerate
