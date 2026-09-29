'use strict'

require('core-js/modules/esnext.weak-map.delete-all.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.retrieveFile = void 0
const jsEnv = _interopRequireWildcard(require('browser-or-node'))
const _config = require('./config')
function _interopRequireWildcard (e, t) { if (typeof WeakMap === 'function') var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; let o; let i; const f = { __proto__: null, default: e }; if (e === null || typeof e !== 'object' && typeof e !== 'function') return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f) } for (const t in e) t !== 'default' && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f })(e, t) }
const retrieveFile = async path => {
  let retrieveFn = url => fetch(url).then(res => res.json())
  const relativePath = jsEnv.isBrowser ? (0, _config.getSetting)('relativePath', '') : ''
  if (jsEnv.isNode) {
    const {
      readFile
    } = require('fs/promises')
    retrieveFn = url => readFile(url).then(res => JSON.parse(res))
  }
  const databasePath = (0, _config.getSetting)('databasePath', 'database/')
  const fetchUrl = `${relativePath}${databasePath}${path}`
  const recordInfo = await retrieveFn(fetchUrl).catch(err => console.error(err))
  if (!recordInfo) {
    throw new Error(`Could not read ${path}`)
  }
  return recordInfo
}
exports.retrieveFile = retrieveFile
