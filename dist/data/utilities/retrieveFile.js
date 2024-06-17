'use strict'

require('core-js/modules/esnext.weak-map.delete-all.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveFile = void 0
var jsEnv = _interopRequireWildcard(require('browser-or-node'))
var gulpConfig = _interopRequireWildcard(require('js-build-tools/gulp.config'))
function _getRequireWildcardCache (e) { if (typeof WeakMap !== 'function') return null; var r = new WeakMap(); var t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r })(e) }
function _interopRequireWildcard (e, r) { if (!r && e && e.__esModule) return e; if (e === null || typeof e !== 'object' && typeof e !== 'function') return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }; var a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if (u !== 'default' && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u] } return n.default = e, t && t.set(e, n), n }
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
const retrieveFile = path => __awaiter(void 0, void 0, void 0, function * () {
  let retrieveFn = url => fetch(url).then(res => res.json())
  const relativePath = jsEnv.isBrowser ? gulpConfig.get('relativePath', '') : ''
  if (jsEnv.isNode) {
    const {
      readFile
    } = require('fs/promises')
    retrieveFn = url => readFile(url).then(res => JSON.parse(res))
  }
  const databasePath = gulpConfig.get('databasePath', 'database/')
  const fetchUrl = `${relativePath}${databasePath}${path}`
  const recordInfo = yield retrieveFn(fetchUrl).catch(err => console.error(err))
  if (!recordInfo) {
    throw new Error(`Could not read ${path}`)
  }
  return recordInfo
})
exports.retrieveFile = retrieveFile
