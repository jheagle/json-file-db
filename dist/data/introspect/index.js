'use strict'

require('core-js/modules/esnext.async-iterator.constructor.js')
require('core-js/modules/esnext.async-iterator.drop.js')
require('core-js/modules/esnext.iterator.constructor.js')
require('core-js/modules/esnext.iterator.drop.js')
Object.defineProperty(exports, '__esModule', {
  value: true
})
Object.defineProperty(exports, 'create', {
  enumerable: true,
  get: function () {
    return _create.create
  }
})
Object.defineProperty(exports, 'describe', {
  enumerable: true,
  get: function () {
    return _describe.describe
  }
})
Object.defineProperty(exports, 'drop', {
  enumerable: true,
  get: function () {
    return _drop.drop
  }
})
var _create = require('./create')
var _drop = require('./drop')
var _describe = require('./describe')
