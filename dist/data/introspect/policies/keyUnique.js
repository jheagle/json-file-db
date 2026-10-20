"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyUnique = void 0;
var _retrieveRecords = require("../../utilities/retrieveRecords");
var _where = require("../../queries/where");
var _retrieveRecord = require("../../utilities/retrieveRecord");
var _fieldType = require("../../utilities/fieldType");
/**
 * Check that no existing record already has this combination of values across all of the given
 * fields - a single field for a normal unique/primary key, or several for a composite one.
 * references and checkKeys are parallel arrays: references[i]'s value must equal checkKeys[i].
 * @param entity
 * @param references
 * @param checkKeys
 */
const keyUnique = async (entity, references = [], checkKeys = []) => {
  if (!references.length || references.length !== checkKeys.length) {
    return false;
  }
  let records = await (0, _retrieveRecords.retrieveRecords)(entity);
  const record = await (0, _retrieveRecord.retrieveRecord)(entity);
  for (let i = 0; i < references.length; i++) {
    records = (0, _where.where)(records, {
      property: references[i],
      comparator: '=',
      value: checkKeys[i],
      type: (0, _fieldType.fieldType)(record, references[i])
    });
  }
  return !records.length;
};
exports.keyUnique = keyUnique;