"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveRecords = void 0;
var _retrieveFile = require("./retrieveFile");
var _retrieveRecord = require("./retrieveRecord");
const retrieveRecords = async (entity = '') => {
  const recordFile = await (0, _retrieveRecord.retrieveRecord)(entity);
  const dataSet = [];
  for (const file of recordFile.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${recordFile.path}/${file}`).catch(err => console.error(err));
    if (!data) {
      throw new Error(`Could not read entity ${file}`);
    }
    dataSet.push(data);
  }
  return dataSet;
};
exports.retrieveRecords = retrieveRecords;