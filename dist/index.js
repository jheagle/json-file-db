'use strict'

require('core-js/modules/esnext.async-iterator.constructor.js')
require('core-js/modules/esnext.async-iterator.drop.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.drop.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
Object.defineProperty(exports, 'configure', {
  enumerable: true,
  get: function () {
    return _config.configure
  }
})
Object.defineProperty(exports, 'create', {
  enumerable: true,
  get: function () {
    return _introspect.create
  }
})
Object.defineProperty(exports, 'describe', {
  enumerable: true,
  get: function () {
    return _introspect.describe
  }
})
Object.defineProperty(exports, 'drop', {
  enumerable: true,
  get: function () {
    return _introspect.drop
  }
})
Object.defineProperty(exports, 'query', {
  enumerable: true,
  get: function () {
    return _query.query
  }
})
var _query = require('./data/queries/query')
var _introspect = require('./data/introspect')
var _config = require('./data/utilities/config')
