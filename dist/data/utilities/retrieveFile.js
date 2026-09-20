'use strict'

require('core-js/modules/esnext.weak-map.delete-all.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveFile = void 0
const jsEnv = _interopRequireWildcard(require('browser-or-node'))
const gulpConfig = _interopRequireWildcard(require('js-build-tools/gulp.config'))
function _interopRequireWildcard (e, t) { if (typeof WeakMap === 'function') var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; let o; let i; const f = { __proto__: null, default: e }; if (e === null || typeof e !== 'object' && typeof e !== 'function') return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f) } for (const t in e) t !== 'default' && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f })(e, t) }
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
