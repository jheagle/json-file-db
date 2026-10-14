"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveRecord = void 0;
var _retrieveFile = require("./retrieveFile");
const retrieveRecord = async (entity = '') => await (0, _retrieveFile.retrieveFile)(`${entity}.json`);
exports.retrieveRecord = retrieveRecord;