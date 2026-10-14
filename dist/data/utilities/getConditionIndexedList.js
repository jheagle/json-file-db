"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConditionIndexedList = void 0;
var _isEntityProperty = require("./parsers/isEntityProperty");
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _retrieveRecord = require("./retrieveRecord");
var _where = require("../queries/where");
var _retrieveFile = require("./retrieveFile");
var _getMatchingIndexes = require("./getMatchingIndexes");
const getConditionIndexedList = async (parsed, recordData, dataSet) => {
  const reducedConditions = [];
  for (const condition of parsed.conditions) {
    let entity = parsed.entity;
    let property = condition.property;
    if ((0, _isEntityProperty.isEntityProperty)(property)) {
      const entityProperty = (0, _splitEntityProperty.splitEntityProperty)(property);
      entity = entityProperty.entity;
      property = entityProperty.property;
    }
    if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
      recordData[entity] = await (0, _retrieveRecord.retrieveRecord)(entity);
    }
    const indexed = {};
    const retrieveMatchedFiles = async (entity, property, recordData, condition, dataSet, indexed) => {
      const matchedRecords = (0, _where.where)(indexed[entity][property], {
        property: 'value',
        comparator: condition.comparator,
        value: condition.value
      });
      for (const matchedRecord of matchedRecords) {
        for (const file of matchedRecord.record) {
          dataSet[entity].push(await (0, _retrieveFile.retrieveFile)(`${entity}/${file}`));
        }
      }
    };
    const isIndexed = await (0, _getMatchingIndexes.getMatchingIndexes)(entity, property, recordData, condition, dataSet, indexed, retrieveMatchedFiles);
    if (!isIndexed) {
      reducedConditions.push(condition);
    }
  }
  parsed.conditions = reducedConditions;
  return parsed;
};
exports.getConditionIndexedList = getConditionIndexedList;