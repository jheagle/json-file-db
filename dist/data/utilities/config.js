'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.getSetting = exports.configure = void 0
const defaults = {
  databasePath: 'database/',
  relativePath: ''
}
let settings = {
  ...defaults
}
/**
 * Set where this package's data lives: databasePath (a filesystem path, used in Node) and/or
 * relativePath (a URL prefix prepended to databasePath, used when reading over fetch() in a
 * browser). Call this once before using create()/drop()/query() - a fresh consumer has no other
 * way to point this package at their own data directory.
 * @param newSettings
 */
const configure = newSettings => {
  settings = {
    ...settings,
    ...newSettings
  }
}
/**
 * Read one runtime setting, falling back to the given default if it was never configured. This is
 * the package's own lightweight replacement for reading settings via js-build-tools/gulp.config -
 * that module is a dev-time build tool, not something a published package should require at
 * runtime, and it isn't available at all once a consumer installs this package on its own.
 * @param key
 * @param defaultValue
 */
exports.configure = configure
const getSetting = (key, defaultValue) => {
  return typeof settings[key] !== 'undefined' ? settings[key] : defaultValue
}
exports.getSetting = getSetting
