"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.foreignKeyExists = void 0;
var _retrieveRecords = require("../../utilities/retrieveRecords");
var _where = require("../../queries/where");
var _retrieveRecord = require("../../utilities/retrieveRecord");
var _fieldType = require("../../utilities/fieldType");
/**
 * Check whether any record in the referenced entity has the given property set to the given
 * value - the mirror image of keyUnique(), which checks that no record already has a value.
 * @param entity
 * @param property
 * @param value
 */
const foreignKeyExists = async (entity, property, value) => {
  const records = await (0, _retrieveRecords.retrieveRecords)(entity);
  const type = (0, _fieldType.fieldType)(await (0, _retrieveRecord.retrieveRecord)(entity), property);
  const found = (0, _where.where)(records, {
    property,
    comparator: '=',
    value,
    type
  });
  return found.length > 0;
};
exports.foreignKeyExists = foreignKeyExists;