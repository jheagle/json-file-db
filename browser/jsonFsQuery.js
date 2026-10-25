(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsonFsQuery = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = void 0;
require("core-js/modules/es.json.stringify.js");
var _record = require("./definitions/record");
var _registerRecord = require("../utilities/registerRecord");
var _config = require("../utilities/config");
/**
 * Create a new record.
 * @param recordName
 * @param definition
 * @param keys
 */
const create = async (recordName, definition = [], keys = []) => {
  const {
    writeFile,
    mkdir
  } = require('fs/promises');
  const {
    existsSync
  } = require('fs');
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  if (recordName === '__RECORDS') {
    return null;
  }
  if (existsSync(`${databasePath}${recordName}.json`)) {
    return null;
  }
  await mkdir(databasePath, {
    recursive: true
  });
  const recordContent = (0, _record.record)({
    path: recordName,
    definition,
    keys
  });
  await writeFile(`${databasePath}${recordName}.json`, JSON.stringify(recordContent, null, 2));
  await mkdir(`${databasePath}${recordName}`, {
    recursive: true
  });
  await (0, _registerRecord.registerRecord)(recordName);
  return recordContent;
};
exports.create = create;
},{"../utilities/config":31,"../utilities/registerRecord":61,"./definitions/record":5,"core-js/modules/es.json.stringify.js":218,"fs":73,"fs/promises":73}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.field = void 0;
/**
 * Generate a field for a record.
 * @param properties
 * @param properties.name
 * @param properties.type
 * @param properties.optional
 * @param properties.useDefault
 * @param properties.defaultValue
 * @param properties.autoGenerate
 */
const field = ({
  name = '',
  type = 'string',
  optional = false,
  useDefault = false,
  defaultValue = '',
  autoGenerate = false
} = {}) => {
  const returnField = {
    name,
    type,
    optional,
    autoGenerate
  };
  if (useDefault) {
    returnField['default'] = defaultValue;
  }
  return returnField;
};
exports.field = field;
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.key = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _keyReference = require("./keyReference");
/**
 * Create a field key.
 * @param properties
 * @param properties.type
 * @param properties.fields
 * @param properties.lookup
 * @param properties.references
 */
const key = ({
  type = 'index',
  fields = [],
  lookup = '',
  references = []
} = {}) => {
  switch (type) {
    case 'primary':
    case 'index':
    case 'unique':
      references = [];
      break;
    case 'multi':
      if (fields.length < 2) {
        throw new Error('Multi key indicated with less than two fields');
      }
      break;
    case 'foreign':
      if (references.length < 1) {
        throw new Error('Foreign key must have one reference to an external record');
      }
      break;
    default:
      throw new Error('Unrecognized key type; must be index, primary, unique, multi, or foreign');
  }
  const keyDefinition = {
    type,
    fields,
    lookup
  };
  if (typeof references !== 'undefined' && references.length > 0) {
    keyDefinition['references'] = references.map(_keyReference.keyReference);
  }
  return keyDefinition;
};
exports.key = key;
},{"./keyReference":4,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyReference = void 0;
/**
 * Create a reference to a remote (foreign; existing on another record) key.
 * @param properties
 * @param properties.fields
 * @param properties.lookup
 */
const keyReference = ({
  fields = [],
  lookup = ''
} = {}) => ({
  fields,
  lookup
});
exports.keyReference = keyReference;
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.record = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _field = require("./field");
var _key = require("./key");
/**
 *
 * @param properties
 * @param properties.path
 * @param properties.definition
 * @param properties.keys
 * @param properties.entries
 */
const record = ({
  path = '',
  definition = [],
  keys = [],
  entries = []
} = {}) => {
  return {
    path,
    definition: definition.map(_field.field),
    keys: keys.map(_key.key),
    entries
  };
};
exports.record = record;
},{"./field":2,"./key":3,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.describe = void 0;
var _retrieveFile = require("../utilities/retrieveFile");
const describe = async (record = '__RECORDS') => {
  const recordFile = await (0, _retrieveFile.retrieveFile)(`${record}.json`);
  if (record === '__RECORDS') {
    return recordFile.entries;
  }
  return recordFile.definition;
};
exports.describe = describe;
},{"../utilities/retrieveFile":64}],7:[function(require,module,exports){
"use strict";

require("core-js/modules/esnext.async-iterator.constructor.js");
require("core-js/modules/esnext.async-iterator.drop.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.drop.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drop = void 0;
var _retrieveFile = require("../utilities/retrieveFile");
var _deregisterRecord = require("../utilities/deregisterRecord");
var _config = require("../utilities/config");
const {
  rm
} = require('fs/promises');
const drop = async record => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  if (record === '__RECORDS') {
    return null;
  }
  const recordFile = await (0, _retrieveFile.retrieveFile)(`${record}.json`);
  for (const file of recordFile.entries) {
    await rm(`${databasePath}${recordFile.path}/${file}`);
  }
  await rm(`${databasePath}${recordFile.path}`, {
    recursive: true,
    force: true
  });
  await rm(`${databasePath}__indexes/${recordFile.path}`, {
    recursive: true,
    force: true
  });
  await rm(`${databasePath}${record}.json`);
  await (0, _deregisterRecord.deregisterRecord)(record);
};
exports.drop = drop;
},{"../utilities/config":31,"../utilities/deregisterRecord":32,"../utilities/retrieveFile":64,"core-js/modules/esnext.async-iterator.constructor.js":220,"core-js/modules/esnext.async-iterator.drop.js":221,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.drop.js":223,"fs/promises":73}],8:[function(require,module,exports){
"use strict";

require("core-js/modules/esnext.async-iterator.constructor.js");
require("core-js/modules/esnext.async-iterator.drop.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.drop.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "create", {
  enumerable: true,
  get: function () {
    return _create.create;
  }
});
Object.defineProperty(exports, "describe", {
  enumerable: true,
  get: function () {
    return _describe.describe;
  }
});
Object.defineProperty(exports, "drop", {
  enumerable: true,
  get: function () {
    return _drop.drop;
  }
});
var _create = require("./create");
var _drop = require("./drop");
var _describe = require("./describe");
},{"./create":1,"./describe":6,"./drop":7,"core-js/modules/esnext.async-iterator.constructor.js":220,"core-js/modules/esnext.async-iterator.drop.js":221,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.drop.js":223}],9:[function(require,module,exports){
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
},{"../../queries/where":28,"../../utilities/fieldType":33,"../../utilities/retrieveRecord":66,"../../utilities/retrieveRecords":67}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasDependents = void 0;
var _describe = require("../describe");
var _retrieveRecord = require("../../utilities/retrieveRecord");
var _retrieveRecords = require("../../utilities/retrieveRecords");
var _where = require("../../queries/where");
var _fieldType = require("../../utilities/fieldType");
var _splitEntityProperty = require("../../utilities/parsers/splitEntityProperty");
/**
 * Check whether any other record, in any entity, still has a single-field foreign key pointing
 * at entity.property = value - the mirror image of foreignKeyExists(), which checks the opposite
 * direction (that a new/updated foreign key value points at something real). Used to RESTRICT a
 * delete or update that would otherwise leave a dangling reference behind. Scans every record in
 * the database via the __RECORDS registry, the same "no index needed, just look" approach as
 * keyUnique()/foreignKeyExists() - correctness over speed, matching this project's overall scale.
 * @param entity
 * @param property
 * @param value
 */
const hasDependents = async (entity, property, value) => {
  const entityFiles = await (0, _describe.describe)();
  for (const entityFile of entityFiles) {
    const otherEntity = entityFile.replace(/\.json$/, '');
    const otherRecord = await (0, _retrieveRecord.retrieveRecord)(otherEntity);
    for (const key of otherRecord.keys) {
      if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
        continue;
      }
      const {
        entity: refEntity,
        property: refProperty
      } = (0, _splitEntityProperty.splitEntityProperty)(key.references[0].fields[0]);
      if (refEntity !== entity || refProperty !== property) {
        continue;
      }
      const records = await (0, _retrieveRecords.retrieveRecords)(otherEntity);
      const found = (0, _where.where)(records, {
        property: key.fields[0],
        comparator: '=',
        value,
        type: (0, _fieldType.fieldType)(otherRecord, key.fields[0])
      });
      if (found.length) {
        return true;
      }
    }
  }
  return false;
};
exports.hasDependents = hasDependents;
},{"../../queries/where":28,"../../utilities/fieldType":33,"../../utilities/parsers/splitEntityProperty":57,"../../utilities/retrieveRecord":66,"../../utilities/retrieveRecords":67,"../describe":6}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyGenerate = void 0;
var _keyUnique = require("./keyUnique");
const keyGenerate = async (entity, references = []) => {
  let uuid = null;
  let isUnique = false;
  while (!isUnique) {
    uuid = crypto.randomUUID();
    isUnique = await (0, _keyUnique.keyUnique)(entity, references, [uuid]);
  }
  return uuid;
};
exports.keyGenerate = keyGenerate;
},{"./keyUnique":12}],12:[function(require,module,exports){
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
},{"../../queries/where":28,"../../utilities/fieldType":33,"../../utilities/retrieveRecord":66,"../../utilities/retrieveRecords":67}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeCheck = void 0;
/**
 * Validate (and where sensible, coerce) a value against a field's declared type. Runs only
 * against values being written by insertEntity/updateEntity - it never re-validates data already
 * on disk, so a field whose declared type doesn't match its already-stored values (which can
 * happen, since nothing enforced this before) is left alone until something actually updates it.
 * An unrecognized type name is treated as unconstrained rather than rejected, so a typo in a
 * schema's field type can't silently block every write to that field.
 * @param type
 * @param value
 */
const typeCheck = (type = 'string', value = undefined) => {
  if (typeof value === 'undefined') {
    return value;
  }
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value : String(value);
    case 'int':
      {
        const coerced = Number(value);
        if (Number.isNaN(coerced) || !Number.isInteger(coerced)) {
          throw new Error(`Value "${value}" is not a valid int`);
        }
        return coerced;
      }
    case 'boolean':
      if (typeof value === 'boolean') {
        return value;
      }
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      throw new Error(`Value "${value}" is not a valid boolean`);
    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`Value "${value}" is not a valid object`);
      }
      return value;
    case 'array':
      if (!Array.isArray(value)) {
        throw new Error(`Value "${value}" is not a valid array`);
      }
      return value;
    default:
      return value;
  }
};
exports.typeCheck = typeCheck;
},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDefault = void 0;
const useDefault = (defaultValue = '', value = undefined) => {
  if (typeof value === 'undefined') {
    return defaultValue;
  }
  return value;
};
exports.useDefault = useDefault;
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteEntity = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.set.add-all.js");
require("core-js/modules/esnext.set.delete-all.js");
require("core-js/modules/esnext.set.difference.js");
require("core-js/modules/esnext.set.every.js");
require("core-js/modules/esnext.set.filter.js");
require("core-js/modules/esnext.set.find.js");
require("core-js/modules/esnext.set.intersection.js");
require("core-js/modules/esnext.set.is-disjoint-from.js");
require("core-js/modules/esnext.set.is-subset-of.js");
require("core-js/modules/esnext.set.is-superset-of.js");
require("core-js/modules/esnext.set.join.js");
require("core-js/modules/esnext.set.map.js");
require("core-js/modules/esnext.set.reduce.js");
require("core-js/modules/esnext.set.some.js");
require("core-js/modules/esnext.set.symmetric-difference.js");
require("core-js/modules/esnext.set.union.js");
var _retrieveRecord = require("../utilities/retrieveRecord");
var _retrieveFile = require("../utilities/retrieveFile");
var _removeFromIndex = require("../utilities/removeFromIndex");
var _computeKeyValue = require("../utilities/computeKeyValue");
var _fieldType = require("../utilities/fieldType");
var _hasDependents = require("../introspect/policies/hasDependents");
var _config = require("../utilities/config");
const {
  rm,
  writeFile
} = require('fs/promises');
/**
 * RESTRICT: reject the whole delete (before removing anything) if any row being deleted is still
 * referenced by a single-field foreign key elsewhere. Only meaningful for a single-field primary
 * key, since foreign key support itself is single-field only - a composite primary key can't be
 * the target of one yet, so there's nothing to check.
 * @param entity
 * @param primaryKey
 * @param toDelete
 */
const assertNoDependents = async (entity, primaryKey, toDelete) => {
  if (!(0, _config.getSetting)('enforceForeignKeys', true) || primaryKey.fields.length !== 1) {
    return;
  }
  const property = primaryKey.fields[0];
  for (const row of toDelete) {
    if (await (0, _hasDependents.hasDependents)(entity, property, row[property])) {
      throw new Error(`Cannot delete from "${entity}" where "${property}" = ${row[property]} - other records still reference it`);
    }
  }
};
/**
 * A record object carries no memory of which entry file it was read from, and files are not
 * guaranteed to be named after any field's value, so the only reliable way to find a record's
 * file is to re-scan every entry and match it by its primary key value(s) - a single field, or a
 * composite of several for a multi-field primary key.
 * @param entity
 * @param record
 * @param primaryKey
 * @param deletedValues
 */
const removeMatchingEntries = async (entity, record, primaryKey, deletedValues) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const remainingEntries = [];
  for (const fileName of record.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`);
    if (!deletedValues.has((0, _computeKeyValue.computeKeyValue)(primaryKey.fields, data))) {
      remainingEntries.push(fileName);
      continue;
    }
    await rm(`${databasePath}${record.path}/${fileName}`);
    for (const key of record.keys) {
      await (0, _removeFromIndex.removeFromIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, data), fileName, (0, _fieldType.keyValueType)(record, key));
    }
  }
  return remainingEntries;
};
const deleteEntity = async (entity = '', dataSet = {}) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const record = await (0, _retrieveRecord.retrieveRecord)(entity);
  const primaryKey = record.keys.find(key => key.type === 'primary');
  if (!primaryKey) {
    throw new Error(`Cannot delete from "${entity}" without a primary key`);
  }
  const toDelete = dataSet[entity] || [];
  if (!toDelete.length) {
    return dataSet;
  }
  await assertNoDependents(entity, primaryKey, toDelete);
  const deletedValues = new Set(toDelete.map(row => (0, _computeKeyValue.computeKeyValue)(primaryKey.fields, row)));
  record.entries = await removeMatchingEntries(entity, record, primaryKey, deletedValues);
  await writeFile(`${databasePath}${record.path}.json`, JSON.stringify(record, null, 2));
  return dataSet;
};
exports.deleteEntity = deleteEntity;
},{"../introspect/policies/hasDependents":10,"../utilities/computeKeyValue":30,"../utilities/config":31,"../utilities/fieldType":33,"../utilities/removeFromIndex":62,"../utilities/retrieveFile":64,"../utilities/retrieveRecord":66,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.set.add-all.js":244,"core-js/modules/esnext.set.delete-all.js":245,"core-js/modules/esnext.set.difference.js":246,"core-js/modules/esnext.set.every.js":247,"core-js/modules/esnext.set.filter.js":248,"core-js/modules/esnext.set.find.js":249,"core-js/modules/esnext.set.intersection.js":250,"core-js/modules/esnext.set.is-disjoint-from.js":251,"core-js/modules/esnext.set.is-subset-of.js":252,"core-js/modules/esnext.set.is-superset-of.js":253,"core-js/modules/esnext.set.join.js":254,"core-js/modules/esnext.set.map.js":255,"core-js/modules/esnext.set.reduce.js":256,"core-js/modules/esnext.set.some.js":257,"core-js/modules/esnext.set.symmetric-difference.js":258,"core-js/modules/esnext.set.union.js":259,"fs/promises":73}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.groupBy = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
const groupBy = (dataSet = [], groupProperty = '') => {
  if (!groupProperty) {
    return dataSet;
  }
  return dataSet.reduce((groupedData, data) => {
    const property = data[groupProperty];
    if (!Object.prototype.hasOwnProperty.call(groupedData, property)) {
      groupedData[property] = [];
    }
    groupedData[property].push(data);
    return groupedData;
  }, {});
};
exports.groupBy = groupBy;
},{"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertEntity = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
require("core-js/modules/esnext.iterator.map.js");
var _retrieveRecord = require("../utilities/retrieveRecord");
var _updateIndex = require("../utilities/updateIndex");
var _keyGenerate = require("../introspect/policies/keyGenerate");
var _keyUnique = require("../introspect/policies/keyUnique");
var _useDefault = require("../introspect/policies/useDefault");
var _typeCheck = require("../introspect/policies/typeCheck");
var _foreignKeyExists = require("../introspect/policies/foreignKeyExists");
var _splitEntityProperty = require("../utilities/parsers/splitEntityProperty");
var _computeKeyValue = require("../utilities/computeKeyValue");
var _fieldType = require("../utilities/fieldType");
var _config = require("../utilities/config");
const {
  writeFile
} = require('fs/promises');
/**
 * Build one entity's stored values from the raw input values, generating any autoGenerate
 * fields and applying field defaults, then throw if a required field still has no value.
 * @param entity
 * @param record
 * @param rowValues
 */
const buildEntityValues = async (entity, record, rowValues = {}) => {
  const entityValues = {};
  for (const field of record.definition) {
    let value = rowValues[field.name];
    if (field.autoGenerate) {
      value = await (0, _keyGenerate.keyGenerate)(entity, [field.name]);
    } else if (Object.prototype.hasOwnProperty.call(field, 'default')) {
      value = (0, _useDefault.useDefault)(field['default'], value);
    }
    if (typeof value === 'undefined') {
      if (!field.optional) {
        throw new Error(`Missing required field "${field.name}" for ${entity}`);
      }
      continue;
    }
    entityValues[field.name] = (0, _typeCheck.typeCheck)(field.type, value);
  }
  return entityValues;
};
/**
 * Reject the insert if it collides with an existing primary or unique key value - a single field,
 * or a composite of several for a multi-field key.
 * @param entity
 * @param record
 * @param entityValues
 */
const assertUnique = async (entity, record, entityValues) => {
  for (const key of record.keys) {
    if (key.type !== 'primary' && key.type !== 'unique') {
      continue;
    }
    const checkKeys = key.fields.map(field => entityValues[field]);
    const isUnique = await (0, _keyUnique.keyUnique)(entity, key.fields, checkKeys);
    if (!isUnique) {
      throw new Error(`Duplicate value for ${key.type} key "${key.fields.join(', ')}" on ${entity}`);
    }
  }
};
/**
 * Reject the insert if a single-field foreign key's value doesn't exist in the record it
 * references.
 * @param entity
 * @param record
 * @param entityValues
 */
const assertForeignKeys = async (entity, record, entityValues) => {
  for (const key of record.keys) {
    if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
      continue;
    }
    const field = key.fields[0];
    if (!Object.prototype.hasOwnProperty.call(entityValues, field)) {
      continue;
    }
    const {
      entity: refEntity,
      property: refProperty
    } = (0, _splitEntityProperty.splitEntityProperty)(key.references[0].fields[0]);
    const exists = await (0, _foreignKeyExists.foreignKeyExists)(refEntity, refProperty, entityValues[field]);
    if (!exists) {
      throw new Error(`Foreign key "${field}" on ${entity} references a nonexistent ${refEntity}.${refProperty} = ${entityValues[field]}`);
    }
  }
};
const insertEntity = async (entity = '', values = [], dataSet = {}) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const record = await (0, _retrieveRecord.retrieveRecord)(entity);
  const primaryKey = record.keys.find(key => key.type === 'primary' && key.fields.length === 1);
  if (!Object.prototype.hasOwnProperty.call(dataSet, entity)) {
    dataSet[entity] = [];
  }
  for (const rowValues of values) {
    const entityValues = await buildEntityValues(entity, record, rowValues);
    await assertUnique(entity, record, entityValues);
    await assertForeignKeys(entity, record, entityValues);
    const fileName = `${primaryKey ? entityValues[primaryKey.fields[0]] : crypto.randomUUID()}.json`;
    await writeFile(`${databasePath}${record.path}/${fileName}`, JSON.stringify(entityValues, null, 2));
    record.entries.push(fileName);
    await writeFile(`${databasePath}${record.path}.json`, JSON.stringify(record, null, 2));
    for (const key of record.keys) {
      await (0, _updateIndex.updateIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, entityValues), fileName, (0, _fieldType.keyValueType)(record, key));
    }
    dataSet[entity].push(entityValues);
  }
  return dataSet;
};
exports.insertEntity = insertEntity;
},{"../introspect/policies/foreignKeyExists":9,"../introspect/policies/keyGenerate":11,"../introspect/policies/keyUnique":12,"../introspect/policies/typeCheck":13,"../introspect/policies/useDefault":14,"../utilities/computeKeyValue":30,"../utilities/config":31,"../utilities/fieldType":33,"../utilities/parsers/splitEntityProperty":57,"../utilities/retrieveRecord":66,"../utilities/updateIndex":69,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226,"core-js/modules/esnext.iterator.map.js":228,"fs/promises":73}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.joinEntity = void 0;
var _siFunciona = _interopRequireDefault(require("si-funciona"));
var _readEntity = require("./readEntity");
var _useJoinClause = require("../utilities/useJoinClause");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const joinEntity = async (entity, joinEntity, dataSets = {}, joinClauses = [], entityAlreadyResolved = false) => {
  // Same ambiguity readEntity() always has (can't tell "never loaded" from "loaded, zero rows
  // matched") - runQuery already resolved entity's rows via an indexed condition in that second
  // case, so entityAlreadyResolved tells this call not to reload and silently discard that result.
  if (!entityAlreadyResolved) {
    dataSets = await (0, _readEntity.readEntity)(entity, dataSets);
  }
  if (!joinClauses.length) {
    return dataSets;
  }
  dataSets = await (0, _readEntity.readEntity)(joinEntity, dataSets);
  for (const anEntity in dataSets[entity]) {
    let filterJoins = _siFunciona.default.cloneObject(dataSets);
    filterJoins[entity] = [dataSets[entity][anEntity]];
    for (const joinClause of joinClauses) {
      filterJoins = await (0, _useJoinClause.useJoinClause)(joinClause, dataSets, filterJoins);
    }
    dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity];
  }
  return dataSets;
};
exports.joinEntity = joinEntity;
},{"../utilities/useJoinClause":70,"./readEntity":24,"si-funciona":343}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.limitOffset = void 0;
/**
 * Slice a dataSet down to at most `limit` rows, starting after the first `offset` of them.
 * @param dataSet
 * @param offset
 * @param limit
 */
const limitOffset = (dataSet = [], offset, limit) => {
  if (typeof offset === 'undefined' && typeof limit === 'undefined') {
    return dataSet;
  }
  const start = offset ?? 0;
  const end = typeof limit === 'number' ? start + limit : undefined;
  return dataSet.slice(start, end);
};
exports.limitOffset = limitOffset;
},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeJoins = void 0;
var _mergeJoin = require("../utilities/mergeJoin");
var _reconcileJoins = require("../utilities/reconcileJoins");
const mergeJoins = async (dataSet = {}, merges = []) => {
  if (!merges.length) {
    return dataSet;
  }
  for (const merge of merges) {
    dataSet = await (0, _mergeJoin.mergeJoin)(merge.propertyA, merge.propertyB, dataSet);
    dataSet = (0, _reconcileJoins.reconcileJoins)(merge.propertyA, merge.propertyB, dataSet);
  }
  return dataSet;
};
exports.mergeJoins = mergeJoins;
},{"../utilities/mergeJoin":38,"../utilities/reconcileJoins":60}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parser = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _splitQueries = require("../utilities/parsers/splitQueries");
var _parseQuery = require("../utilities/parsers/parseQuery");
const parser = (queries = '') => {
  const queryArray = (0, _splitQueries.splitQueries)(queries);
  return queryArray.map((query, index) => {
    try {
      return (0, _parseQuery.parseQuery)(query);
    } catch (e) {
      const which = queryArray.length > 1 ? ` query ${index + 1} of ${queryArray.length}` : '';
      throw new Error(`Failed to interpret${which}: ${query} (${e.message})`);
    }
  });
};
exports.parser = parser;
},{"../utilities/parsers/parseQuery":54,"../utilities/parsers/splitQueries":58,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.query = void 0;
var _parser = require("./parser");
var _runQuery = require("../utilities/runQuery");
const query = async (queryString = '') => {
  const parsedQueries = (0, _parser.parser)(queryString);
  const queryResults = [];
  for (const parsed of parsedQueries) {
    const dataSet = await (0, _runQuery.runQuery)(parsed);
    queryResults.push(dataSet[parsed.entity]);
  }
  return queryResults;
};
exports.query = query;
},{"../utilities/runQuery":68,"./parser":21}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quote = void 0;
/**
 * Write a value as a quoted string for a query, so any text can be used in one: the backslash and the quote are
 * escaped, so the parser reads back exactly the text given.
 * @example
 * query(`insert exercises values name = ${quote("Farmer's walk")}`)
 * // insert exercises values name = 'Farmer\'s walk'
 * @param value - the text to quote (anything else is converted with String first)
 * @param quoteChar - the quote to wrap it in
 */
const quote = (value, quoteChar = '\'') => `${quoteChar}${String(value).replace(/\\/g, '\\\\').split(quoteChar).join(`\\${quoteChar}`)}${quoteChar}`;
exports.quote = quote;
},{}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readEntity = void 0;
var _retrieveRecords = require("../utilities/retrieveRecords");
const readEntity = async (entity = '', dataSet = {}) => {
  if (!Object.prototype.hasOwnProperty.call(dataSet, entity) || !dataSet[entity].length) {
    dataSet[entity] = await (0, _retrieveRecords.retrieveRecords)(entity);
  }
  return dataSet;
};
exports.readEntity = readEntity;
},{"../utilities/retrieveRecords":67}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectFields = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
const shapeRow = (row, selectClauses) => selectClauses.reduce((shaped, {
  property,
  alias
}) => {
  shaped[alias || property] = row[property];
  return shaped;
}, {});
/**
 * Shape each row down to only the selected properties (aliased, when given). dataSet is either a plain array of
 * rows, or (once groupBy has run) a plain object keyed by group value, each value an array of rows - both are
 * shaped the same way, row by row.
 * @param dataSet
 * @param selectClauses
 */
const selectFields = (dataSet = [], selectClauses = []) => {
  if (!selectClauses.length) {
    return dataSet;
  }
  if (Array.isArray(dataSet)) {
    return dataSet.map(row => shapeRow(row, selectClauses));
  }
  return Object.keys(dataSet).reduce((shaped, key) => {
    shaped[key] = dataSet[key].map(row => shapeRow(row, selectClauses));
    return shaped;
  }, {});
};
exports.selectFields = selectFields;
},{"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortBy = void 0;
const sortBy = (dataSet = [], sortClauses = []) => {
  if (!sortClauses.length) {
    return dataSet;
  }
  dataSet.sort((a, b) => {
    for (const sortClause of sortClauses) {
      const property = sortClause.property;
      const direction = sortClause.direction;
      // Ordering compares the raw stored values, not by declared type (that's only for equality, see where), so
      // numeric ids in a string field still sort numerically. Loose so '3' and 3 still tie.
      // eslint-disable-next-line eqeqeq
      if (a[property] == b[property]) {
        continue;
      }
      const result = a[property] < b[property] ? -1 : 1;
      return direction === 'asc' ? result : result * -1;
    }
    return 0;
  });
  return dataSet;
};
exports.sortBy = sortBy;
},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateEntity = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.some.js");
var _retrieveRecord = require("../utilities/retrieveRecord");
var _retrieveFile = require("../utilities/retrieveFile");
var _updateIndex = require("../utilities/updateIndex");
var _removeFromIndex = require("../utilities/removeFromIndex");
var _computeKeyValue = require("../utilities/computeKeyValue");
var _fieldType = require("../utilities/fieldType");
var _compareAs = require("../utilities/compareAs");
var _keyUnique = require("../introspect/policies/keyUnique");
var _typeCheck = require("../introspect/policies/typeCheck");
var _foreignKeyExists = require("../introspect/policies/foreignKeyExists");
var _hasDependents = require("../introspect/policies/hasDependents");
var _splitEntityProperty = require("../utilities/parsers/splitEntityProperty");
var _config = require("../utilities/config");
const {
  writeFile
} = require('fs/promises');
/**
 * Same reasoning as deleteEntity: a record object carries no memory of which entry file it came
 * from, so re-scan entries[] and match by the record's own primary key value(s) - a single field,
 * or a composite of several for a multi-field primary key.
 * @param record
 * @param primaryKey
 * @param primaryValue
 */
const findEntryFile = async (record, primaryKey, primaryValue) => {
  for (const fileName of record.entries) {
    const data = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`);
    if ((0, _compareAs.sameValue)((0, _fieldType.keyValueType)(record, primaryKey), (0, _computeKeyValue.computeKeyValue)(primaryKey.fields, data), primaryValue)) {
      return fileName;
    }
  }
  return null;
};
/**
 * True if the update actually changes at least one of this key's fields - a key none of whose
 * fields appear in newValues, or whose given values are all unchanged, doesn't need re-checking.
 * @param record
 * @param key
 * @param oldData
 * @param newValues
 */
const keyFieldsChanged = (record, key, oldData, newValues) => key.fields.some(field => Object.prototype.hasOwnProperty.call(newValues, field) && !(0, _compareAs.sameValue)((0, _fieldType.fieldType)(record, field), newValues[field], oldData[field]));
/**
 * Only check uniqueness for a primary/unique key (single-field, or composite) whose value is
 * actually changing - checking an unchanged value would find the record's own existing entry and
 * wrongly report it as a duplicate of itself.
 * @param entity
 * @param record
 * @param oldData
 * @param newData
 * @param newValues
 */
const assertUniqueForUpdate = async (entity, record, oldData, newData, newValues) => {
  for (const key of record.keys) {
    if (key.type !== 'primary' && key.type !== 'unique' || !keyFieldsChanged(record, key, oldData, newValues)) {
      continue;
    }
    const checkKeys = key.fields.map(field => newData[field]);
    const isUnique = await (0, _keyUnique.keyUnique)(entity, key.fields, checkKeys);
    if (!isUnique) {
      throw new Error(`Duplicate value for ${key.type} key "${key.fields.join(', ')}" on ${entity}`);
    }
  }
};
/**
 * Same "only if it actually changed" scoping as assertUniqueForUpdate: re-checking an unchanged
 * foreign key value would re-validate a reference this update never touches, which could fail an
 * unrelated field's update if that parent record happened to be deleted since.
 * @param entity
 * @param record
 * @param oldData
 * @param newValues
 */
const assertForeignKeysForUpdate = async (entity, record, oldData, newValues) => {
  for (const key of record.keys) {
    if (key.type !== 'foreign' || key.fields.length !== 1 || !key.references || key.references.length !== 1) {
      continue;
    }
    const field = key.fields[0];
    if (!Object.prototype.hasOwnProperty.call(newValues, field) || (0, _compareAs.sameValue)((0, _fieldType.fieldType)(record, field), newValues[field], oldData[field])) {
      continue;
    }
    const {
      entity: refEntity,
      property: refProperty
    } = (0, _splitEntityProperty.splitEntityProperty)(key.references[0].fields[0]);
    const exists = await (0, _foreignKeyExists.foreignKeyExists)(refEntity, refProperty, newValues[field]);
    if (!exists) {
      throw new Error(`Foreign key "${field}" on ${entity} references a nonexistent ${refEntity}.${refProperty} = ${newValues[field]}`);
    }
  }
};
/**
 * RESTRICT: reject an update that would change a single-field primary key's value while another
 * entity's foreign key still points at the old one - that reference would otherwise be left
 * dangling, since the row itself isn't gone, just re-keyed. Only meaningful for a single-field
 * primary key, matching foreign key support's own single-field-only scope.
 * @param entity
 * @param record
 * @param primaryKey
 * @param oldData
 * @param newValues
 */
const assertNoDependentsForUpdate = async (entity, record, primaryKey, oldData, newValues) => {
  if (!(0, _config.getSetting)('enforceForeignKeys', true) || primaryKey.fields.length !== 1 || !keyFieldsChanged(record, primaryKey, oldData, newValues)) {
    return;
  }
  const property = primaryKey.fields[0];
  if (await (0, _hasDependents.hasDependents)(entity, property, oldData[property])) {
    throw new Error(`Cannot update "${entity}" where "${property}" = ${oldData[property]} - other records still reference it`);
  }
};
/**
 * Move a key's index entry (single-field, or a composite for a multi-field key) from the old
 * value to the new one wherever the update actually changed one of its fields.
 * @param record
 * @param oldData
 * @param newData
 * @param newValues
 * @param fileName
 */
const reconcileIndexes = async (record, oldData, newData, newValues, fileName) => {
  for (const key of record.keys) {
    if (!keyFieldsChanged(record, key, oldData, newValues)) {
      continue;
    }
    await (0, _removeFromIndex.removeFromIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, oldData), fileName, (0, _fieldType.keyValueType)(record, key));
    await (0, _updateIndex.updateIndex)(record.path, key, (0, _computeKeyValue.computeKeyValue)(key.fields, newData), fileName, (0, _fieldType.keyValueType)(record, key));
  }
};
const assertRequiredFields = (entity, record, newData) => {
  for (const field of record.definition) {
    if (!field.optional && typeof newData[field.name] === 'undefined') {
      throw new Error(`Missing required field "${field.name}" for ${entity}`);
    }
  }
};
/**
 * Type-check (and coerce) only the fields actually present in an update's values, never the rest
 * of the merged record - a field whose already-stored value doesn't match its declared type
 * (nothing enforced this before typeCheck() existed) must not block an update that never touches
 * that field.
 * @param record
 * @param values
 */
const applyFieldTypes = (record, values) => {
  const typedValues = Object.assign({}, values);
  for (const field of record.definition) {
    if (Object.prototype.hasOwnProperty.call(typedValues, field.name)) {
      typedValues[field.name] = (0, _typeCheck.typeCheck)(field.type, typedValues[field.name]);
    }
  }
  return typedValues;
};
const updateEntity = async (entity = '', values = {}, dataSet = {}) => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const record = await (0, _retrieveRecord.retrieveRecord)(entity);
  const primaryKey = record.keys.find(key => key.type === 'primary');
  if (!primaryKey) {
    throw new Error(`Cannot update "${entity}" without a primary key`);
  }
  const typedValues = applyFieldTypes(record, values);
  const toUpdate = dataSet[entity] || [];
  const updatedRows = [];
  for (const row of toUpdate) {
    const fileName = await findEntryFile(record, primaryKey, (0, _computeKeyValue.computeKeyValue)(primaryKey.fields, row));
    if (!fileName) {
      throw new Error(`Could not find entry for ${entity} where "${primaryKey.fields.join(', ')}" = ${(0, _computeKeyValue.computeKeyValue)(primaryKey.fields, row)}`);
    }
    const oldData = await (0, _retrieveFile.retrieveFile)(`${record.path}/${fileName}`);
    const newData = Object.assign({}, oldData, typedValues);
    await assertUniqueForUpdate(entity, record, oldData, newData, typedValues);
    await assertForeignKeysForUpdate(entity, record, oldData, typedValues);
    await assertNoDependentsForUpdate(entity, record, primaryKey, oldData, typedValues);
    assertRequiredFields(entity, record, newData);
    await reconcileIndexes(record, oldData, newData, typedValues, fileName);
    await writeFile(`${databasePath}${record.path}/${fileName}`, JSON.stringify(newData, null, 2));
    updatedRows.push(newData);
  }
  dataSet[entity] = updatedRows;
  return dataSet;
};
exports.updateEntity = updateEntity;
},{"../introspect/policies/foreignKeyExists":9,"../introspect/policies/hasDependents":10,"../introspect/policies/keyUnique":12,"../introspect/policies/typeCheck":13,"../utilities/compareAs":29,"../utilities/computeKeyValue":30,"../utilities/config":31,"../utilities/fieldType":33,"../utilities/parsers/splitEntityProperty":57,"../utilities/removeFromIndex":62,"../utilities/retrieveFile":64,"../utilities/retrieveRecord":66,"../utilities/updateIndex":69,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.some.js":230,"fs/promises":73}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.where = void 0;
require("core-js/modules/es.array.includes.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.some.js");
var _compareAs = require("../utilities/compareAs");
const likeMatch = (dataValue, pattern) => {
  if (typeof dataValue !== 'string' || typeof pattern !== 'string') {
    return false;
  }
  const regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
  return new RegExp(`^${regexPattern}$`, 'i').test(dataValue);
};
/**
 * Equality (=, !=, <>, in) compares by the field's declared type when given one (see sameValue), so
 * '3' and 3 match in a string or int field. Ordering (>, <, between, like) compares the raw values.
 * @param data
 * @param property
 * @param comparator
 * @param value
 * @param type
 */
const makeCondition = (data, property, comparator, value, type = undefined) => {
  if (!Object.prototype.hasOwnProperty.call(data, property)) {
    return false;
  }
  const dataValue = data[property];
  switch (comparator) {
    case '=':
      return (0, _compareAs.sameValue)(type, dataValue, value);
    case '!=':
    case '<>':
      return !(0, _compareAs.sameValue)(type, dataValue, value);
    case '>':
      return dataValue > value;
    case '>=':
      return dataValue >= value;
    case '<':
      return dataValue < value;
    case '<=':
      return dataValue <= value;
    case 'in':
      return Array.isArray(value) && (type ? value.some(item => (0, _compareAs.sameValue)(type, dataValue, item)) : value.includes(dataValue));
    case 'between':
      return Array.isArray(value) && value.length === 2 && dataValue >= value[0] && dataValue <= value[1];
    case 'like':
      return likeMatch(dataValue, value);
  }
  return false;
};
const where = (dataSet = [], {
  property = '',
  joinEntity = undefined,
  comparator = '=',
  value = null,
  type = undefined
} = {}) => {
  return dataSet.filter(data => {
    const testProperty = joinEntity ? `${joinEntity}.${property}` : property;
    return makeCondition(data, testProperty, comparator, value, type);
  });
};
exports.where = where;
},{"../utilities/compareAs":29,"core-js/modules/es.array.includes.js":208,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.some.js":230}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sameValue = exports.compareAs = void 0;
require("core-js/modules/es.array.includes.js");
/**
 * Normalize a value to a field's declared type for an equality comparison - never written back,
 * only compared. Writes are coerced to the declared type (typeCheck), but values already stored
 * may not match it (ids declared string, so they can hold an integer or a UUID, are often stored
 * as numbers), and query literals carry their own type. A declared type is what says '3' and 3
 * are the same value. A missing or unrecognized type returns the value unchanged.
 * @param type
 * @param value
 */
const compareAs = (type, value) => {
  if (value === null || typeof value === 'undefined') {
    return value;
  }
  switch (type) {
    case 'string':
      return typeof value === 'object' ? value : String(value);
    case 'int':
      {
        const coerced = Number(value);
        return Number.isNaN(coerced) ? value : coerced;
      }
    case 'boolean':
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      return value;
    default:
      return value;
  }
};
exports.compareAs = compareAs;
const comparableTypes = ['string', 'int', 'boolean'];
/**
 * Whether two values are equal for a field of the given declared type: both are normalized to
 * that type (see compareAs) and compared strictly. A field with no declared type, or one that
 * can't be normalized (object, array, or an unrecognized type), keeps loose equality.
 * @param type
 * @param a
 * @param b
 */
const sameValue = (type, a, b) => {
  if (!comparableTypes.includes(type)) {
    // eslint-disable-next-line eqeqeq
    return a == b;
  }
  return compareAs(type, a) === compareAs(type, b);
};
exports.sameValue = sameValue;
},{"core-js/modules/es.array.includes.js":208}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeKeyValue = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
/**
 * The value a key (of any field count) indexes and checks uniqueness by. A single-field key uses
 * the field's own raw value directly - this is the pre-existing, already-shipped index file
 * format (e.g. a plain "2024-06-02" or 1), and stays exactly as it was for backward compatibility
 * with real fixture data. A multi-field key has no single value to use, so its fields' values are
 * combined into one deterministic composite (a JSON array), in the same field order as key.fields
 * - two records only share a composite value if every field matches.
 * @param fields
 * @param values
 */
const computeKeyValue = (fields, values) => {
  if (fields.length === 1) {
    return values[fields[0]];
  }
  return JSON.stringify(fields.map(field => values[field]));
};
exports.computeKeyValue = computeKeyValue;
},{"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSetting = exports.configure = void 0;
const defaults = {
  databasePath: 'database/',
  relativePath: '',
  enforceForeignKeys: true
};
let settings = {
  ...defaults
};
/**
 * Set where this package's data lives: databasePath (a filesystem path, used in Node) and/or
 * relativePath (a URL prefix prepended to databasePath, used when reading over fetch() in a
 * browser). Call this once before using create()/drop()/query() - a fresh consumer has no other
 * way to point this package at their own data directory.
 *
 * enforceForeignKeys (default true) controls whether deleteEntity/updateEntity block an operation
 * that would leave another record's foreign key pointing at a value that no longer exists -
 * mirroring MySQL's own foreign_key_checks setting, which is also toggleable rather than always
 * on, since strict enforcement isn't always what every consumer wants.
 * @param newSettings
 */
const configure = newSettings => {
  settings = {
    ...settings,
    ...newSettings
  };
};
/**
 * Read one runtime setting, falling back to the given default if it was never configured. This is
 * the package's own lightweight replacement for reading settings via js-build-tools/gulp.config -
 * that module is a dev-time build tool, not something a published package should require at
 * runtime, and it isn't available at all once a consumer installs this package on its own.
 * @param key
 * @param defaultValue
 */
exports.configure = configure;
const getSetting = (key, defaultValue) => {
  return typeof settings[key] !== 'undefined' ? settings[key] : defaultValue;
};
exports.getSetting = getSetting;
},{}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deregisterRecord = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
var _config = require("./config");
const {
  readFile,
  writeFile
} = require('fs/promises');
/**
 * Remove a record's filename from the __RECORDS registry. A missing registry file is left
 * untouched rather than created, since there's nothing to remove from it.
 * @param recordName
 */
const deregisterRecord = async recordName => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const registryPath = `${databasePath}__RECORDS.json`;
  let registry;
  try {
    registry = JSON.parse(await readFile(registryPath, 'utf8'));
  } catch (err) {
    return null;
  }
  const fileName = `${recordName}.json`;
  registry.entries = registry.entries.filter(entry => entry !== fileName);
  await writeFile(registryPath, JSON.stringify(registry, null, 2));
  return registry;
};
exports.deregisterRecord = deregisterRecord;
},{"./config":31,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"fs/promises":73}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyValueType = exports.fieldType = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
/**
 * The declared type of one of a record's fields, or undefined when the record or field is unknown.
 * @param record
 * @param property
 */
const fieldType = (record, property) => record?.definition?.find(field => field.name === property)?.type;
/**
 * The declared type of the value a key indexes: its field's type for a single-field key. A
 * multi-field key's value is a composite (see computeKeyValue), so it has no single declared type.
 * @param record
 * @param key
 */
exports.fieldType = fieldType;
const keyValueType = (record, key) => key.fields.length === 1 ? fieldType(record, key.fields[0]) : undefined;
exports.keyValueType = keyValueType;
},{"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226}],34:[function(require,module,exports){
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
        value: condition.value,
        type: condition.type
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
},{"../queries/where":28,"./getMatchingIndexes":36,"./parsers/isEntityProperty":51,"./parsers/splitEntityProperty":57,"./retrieveFile":64,"./retrieveRecord":66}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJoinIndexedList = void 0;
var _siFunciona = _interopRequireDefault(require("si-funciona"));
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _retrieveRecord = require("./retrieveRecord");
var _getMatchingIndexes = require("./getMatchingIndexes");
var _matchIndexedJoins = require("./matchIndexedJoins");
var _restrictIndexedList = require("./restrictIndexedList");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const getJoinIndexedList = async (parsed, recordData, dataSets) => {
  const reducedJoins = [];
  const indexed = {};
  let firstIteration = true;
  const entity = parsed.entity;
  const joinEntity = parsed.joinEntity;
  const joinClauses = parsed.joinClauses;
  if (!dataSets[entity].length) {
    // Nothing indexed entity's own rows yet (no WHERE condition narrowed them down ahead of this -
    // that only happens via getConditionIndexedList, called just before this). The loop below can't
    // pre-resolve anything against zero rows, so leave parsed.joinClauses exactly as parsed: the
    // later, unconditional joinEntity() call (once this command's own read actually runs) still
    // needs the real clauses to do the join itself. Previously this fell through to the loop,
    // which never ran, leaving reducedJoins (and so parsed.joinClauses) empty regardless of what
    // was actually parsed - silently discarding every join clause whenever the query had no WHERE.
    return parsed;
  }
  if (!joinClauses.length) {
    // A WHERE condition DID index entity's own rows above, but this query has no join at all -
    // joinEntity is undefined. The loop below writes dataSets[entity][anEntity][joinEntity]
    // unconditionally; left unguarded, that assigns a literal "undefined" key (object[undefined]
    // coerces to the string "undefined") onto every row, since there's no join to actually attach.
    return parsed;
  }
  for (const anEntity in dataSets[entity]) {
    const currentEntity = dataSets[entity][anEntity];
    // Loop over each of the main entities
    const filterJoins = {};
    filterJoins[entity] = [_siFunciona.default.cloneObject(currentEntity)];
    for (const joinClause of joinClauses) {
      let indexedClone = _siFunciona.default.cloneObject(indexed);
      const {
        entity: entityA,
        property: propertyA
      } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyA);
      const {
        entity: entityB,
        property: propertyB
      } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyB);
      // Get the record for the entities A and B, store on the recordData
      if (!Object.prototype.hasOwnProperty.call(recordData, entityA)) {
        recordData[entityA] = await (0, _retrieveRecord.retrieveRecord)(entityA);
      }
      if (!Object.prototype.hasOwnProperty.call(recordData, entityB)) {
        recordData[entityB] = await (0, _retrieveRecord.retrieveRecord)(entityB);
      }
      indexedClone = (0, _restrictIndexedList.restrictIndexedList)(joinClause, filterJoins, indexedClone);
      const retrieveMatchedFiles = (0, _matchIndexedJoins.matchIndexedJoins)(entity, indexedClone, dataSets);
      // Check if there are matching keys for the join condition
      const matchAResult = await (0, _getMatchingIndexes.getMatchingIndexes)(entityA, propertyA, recordData, joinClause, filterJoins, indexed);
      const matchBResult = await (0, _getMatchingIndexes.getMatchingIndexes)(entityB, propertyB, recordData, joinClause, filterJoins, indexed, retrieveMatchedFiles);
      const isIndexed = matchAResult || matchBResult;
      if (!isIndexed && firstIteration) {
        reducedJoins.push(joinClause);
        firstIteration = false;
      }
    }
    dataSets[entity][anEntity][joinEntity] = filterJoins[joinEntity];
  }
  parsed.joinClauses = reducedJoins;
  return parsed;
};
exports.getJoinIndexedList = getJoinIndexedList;
},{"./getMatchingIndexes":36,"./matchIndexedJoins":37,"./parsers/splitEntityProperty":57,"./restrictIndexedList":63,"./retrieveRecord":66,"si-funciona":343}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMatchingIndexes = void 0;
require("core-js/modules/es.array.includes.js");
var _retrieveIndexes = require("./retrieveIndexes");
const getMatchingIndexes = async (entity, property, recordData, clause, dataSet, indexed, cb = null) => {
  let isIndexed = false;
  for (const key of recordData[entity].keys) {
    if (key.fields.includes(property)) {
      dataSet[entity] = [];
      if (!Object.prototype.hasOwnProperty.call(indexed, entity)) {
        indexed[entity] = {};
      }
      if (!Object.prototype.hasOwnProperty.call(indexed[entity], property)) {
        indexed[entity][property] = (await (0, _retrieveIndexes.retrieveIndexes)(entity, [property], recordData))[property];
      }
      if (typeof cb === 'function') {
        await cb(entity, property, recordData, clause, dataSet, indexed);
      }
      isIndexed = true;
    }
  }
  return isIndexed;
};
exports.getMatchingIndexes = getMatchingIndexes;
},{"./retrieveIndexes":65,"core-js/modules/es.array.includes.js":208}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchIndexedJoins = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _siFunciona = _interopRequireDefault(require("si-funciona"));
var _where = require("../queries/where");
var _retrieveFile = require("./retrieveFile");
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _fieldType = require("./fieldType");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const matchIndexedJoins = (entity, indexedClone, dataSets) => async (focusEntity, property, recordData, joinClause, filterJoins, indexed) => {
  const {
    entity: entityA,
    property: propertyA
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyA);
  const {
    entity: entityB,
    property: propertyB
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyB);
  const properties = [{
    entityFirst: entityA,
    propertyFirst: propertyA,
    entitySecond: entityB,
    propertySecond: propertyB
  }, {
    entityFirst: entityB,
    propertyFirst: propertyB,
    entitySecond: entityA,
    propertySecond: propertyA
  }];
  for (const checkProp of properties) {
    if (!Object.prototype.hasOwnProperty.call(indexedClone, checkProp.entitySecond)) {
      indexedClone[checkProp.entitySecond] = _siFunciona.default.cloneObject(indexed[checkProp.entitySecond]);
    }
    const matchedRecords = indexedClone[checkProp.entitySecond][checkProp.propertySecond].reduce((dataA, dataB) => _siFunciona.default.mergeArrays(dataA, (0, _where.where)(indexedClone[checkProp.entityFirst][checkProp.propertyFirst], {
      property: 'value',
      comparator: joinClause.comparator,
      value: dataB.value,
      type: (0, _fieldType.fieldType)(recordData[checkProp.entityFirst], checkProp.propertyFirst)
    })), []);
    const skipPush = checkProp.entityFirst === entity;
    if (!Object.prototype.hasOwnProperty.call(dataSets, checkProp.entityFirst)) {
      dataSets[checkProp.entityFirst] = [];
    }
    for (const matchedRecord of matchedRecords) {
      for (const file of matchedRecord.record) {
        let entityRecord = file;
        if (typeof file === 'string') {
          entityRecord = await (0, _retrieveFile.retrieveFile)(`${checkProp.entityFirst}/${file}`);
        }
        if (!skipPush) {
          dataSets[checkProp.entityFirst].push(entityRecord);
        }
        filterJoins[checkProp.entityFirst].push(entityRecord);
      }
    }
  }
};
exports.matchIndexedJoins = matchIndexedJoins;
},{"../queries/where":28,"./fieldType":33,"./parsers/splitEntityProperty":57,"./retrieveFile":64,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229,"si-funciona":343}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeJoin = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _readEntity = require("../queries/readEntity");
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _where = require("../queries/where");
var _retrieveRecord = require("./retrieveRecord");
var _fieldType = require("./fieldType");
const mergeJoin = async (propertyA = '', propertyB = '', dataSets = {}) => {
  const {
    entity: entityA,
    property: propA
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyA);
  const {
    entity: entityB,
    property: propB
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyB);
  dataSets = await (0, _readEntity.readEntity)(entityA, dataSets);
  dataSets = await (0, _readEntity.readEntity)(entityB, dataSets);
  const typeB = (0, _fieldType.fieldType)(await (0, _retrieveRecord.retrieveRecord)(entityB), propB);
  dataSets[entityA] = dataSets[entityA].map(dataA => {
    const matches = (0, _where.where)(dataSets[entityB], {
      property: propB,
      comparator: '=',
      value: dataA[propA],
      type: typeB
    });
    if (!matches.length) {
      return dataA;
    }
    const mergeMatch = matches[0];
    for (const prop in mergeMatch) {
      if (prop === propB) {
        // Skip the condition property since it is irrelevant
        continue;
      }
      dataA[`${entityB}.${prop}`] = mergeMatch[prop];
    }
    return dataA;
  });
  return dataSets;
};
exports.mergeJoin = mergeJoin;
},{"../queries/readEntity":24,"../queries/where":28,"./fieldType":33,"./parsers/splitEntityProperty":57,"./retrieveRecord":66,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findCommand = void 0;
var _removeFromQuery = require("./removeFromQuery");
const commandMatch = /^(delete|insert|read|update)\s+([a-z0-9_-]+)[\w\n]*/i;
/**
 * Extract command clauses from the query.
 * @param parsed
 * @param query
 */
const findCommand = (parsed, query) => {
  const commandFound = query.match(commandMatch);
  parsed['command'] = undefined;
  parsed['entity'] = undefined;
  if (commandFound) {
    parsed['command'] = commandFound[1];
    parsed['entity'] = commandFound[2];
    return (0, _removeFromQuery.removeFromQuery)(commandFound[0], query);
  }
  return query;
};
exports.findCommand = findCommand;
},{"./removeFromQuery":55}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findConditions = void 0;
var _removeFromQuery = require("./removeFromQuery");
var _parseLiteralValue = require("./parseLiteralValue");
var _maskStrings = require("./maskStrings");
const conditionMatch = new RegExp(`(and|or)?\\s*(where)\\s+([a-z0-9_-]+\\.?[a-z0-9_-]*)\\s+(=|!=|>|<|>=|<=|in|between|like)\\s+(${_maskStrings.placeholderSource}|([0-9]+)|${_maskStrings.arraySource}|(null)|(true)|(false))`, 'ig');
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
const findConditions = (parsed, query) => {
  const conditionsFound = query.matchAll(conditionMatch);
  // @ts-ignore
  for (const condition of conditionsFound) {
    parsed['conditions'].push({
      property: condition[3],
      comparator: condition[4],
      value: (0, _parseLiteralValue.parseLiteralValue)(condition, 6)
    });
    query = (0, _removeFromQuery.removeFromQuery)(condition[0], query);
  }
  return query;
};
exports.findConditions = findConditions;
},{"./maskStrings":52,"./parseLiteralValue":53,"./removeFromQuery":55}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findGroupBy = void 0;
var _removeFromQuery = require("./removeFromQuery");
const groupMatch = /group\s+by\s+(,?[a-z0-9._-]+)+/i;
/**
 * Extract the group by clauses from the query.
 * @param parsed
 * @param query
 */
const findGroupBy = (parsed, query) => {
  const groupFound = query.match(groupMatch);
  if (groupFound) {
    parsed['groupBy'] = groupFound ? groupFound[1] : undefined;
    return (0, _removeFromQuery.removeFromQuery)(groupFound[0], query);
  }
  return query;
};
exports.findGroupBy = findGroupBy;
},{"./removeFromQuery":55}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findInsertValues = void 0;
var _removeFromQuery = require("./removeFromQuery");
var _parseLiteralValue = require("./parseLiteralValue");
var _maskStrings = require("./maskStrings");
const literal = `(?:${_maskStrings.placeholderSource.replace('(', '(?:')}|[0-9]+|${_maskStrings.arraySource.replace('(', '(?:')}|null|true|false)`;
const valuesClauseMatch = new RegExp(`(values)\\s+([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i');
const assignmentMatch = new RegExp(`([a-z0-9_-]+)\\s*=\\s*(${_maskStrings.placeholderSource}|([0-9]+)|${_maskStrings.arraySource}|(null)|(true)|(false))`, 'ig');
/**
 * Extract an insert's "values field = value, field2 = value2" clause from the query, the same way
 * findUpdateValues() does for "set". insertEntity() accepts an array of rows for bulk inserts, but
 * a query string only describes a single row for now - wrapped in a one-element array to match.
 * @param parsed
 * @param query
 */
const findInsertValues = (parsed, query) => {
  const clauseFound = query.match(valuesClauseMatch);
  parsed['insertValues'] = [];
  if (!clauseFound) {
    return query;
  }
  const row = {};
  const assignmentsFound = clauseFound[2].matchAll(assignmentMatch);
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    row[assignment[1]] = (0, _parseLiteralValue.parseLiteralValue)(assignment, 3);
  }
  parsed['insertValues'] = [row];
  return (0, _removeFromQuery.removeFromQuery)(clauseFound[0], query);
};
exports.findInsertValues = findInsertValues;
},{"./maskStrings":52,"./parseLiteralValue":53,"./removeFromQuery":55}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findJoinClauses = void 0;
var _removeFromQuery = require("./removeFromQuery");
const joinClauseMatch = /(and)?\s*on\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+(=|!=|>|<|>=|<=|in|between|like)\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig;
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
const findJoinClauses = (parsed, query) => {
  const joinClausesFound = query.matchAll(joinClauseMatch);
  // @ts-ignore
  for (const joinClause of joinClausesFound) {
    parsed['joinClauses'].push({
      propertyA: joinClause[2],
      comparator: joinClause[3],
      propertyB: joinClause[4]
    });
    query = (0, _removeFromQuery.removeFromQuery)(joinClause[0], query);
  }
  return query;
};
exports.findJoinClauses = findJoinClauses;
},{"./removeFromQuery":55}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findJoinEntity = void 0;
var _removeFromQuery = require("./removeFromQuery");
const joinEntityMatch = /\.([a-z0-9_-]+)/i;
/**
 * Extract the main join entity from the query.
 * @param parsed
 * @param query
 */
const findJoinEntity = (parsed, query) => {
  const joinEntityFound = query.match(joinEntityMatch);
  if (joinEntityFound) {
    parsed['joinEntity'] = joinEntityFound ? joinEntityFound[1] : undefined;
    return (0, _removeFromQuery.removeFromQuery)(joinEntityFound[0], query);
  }
  return query;
};
exports.findJoinEntity = findJoinEntity;
},{"./removeFromQuery":55}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findLimit = void 0;
var _removeFromQuery = require("./removeFromQuery");
const limitMatch = /limit\s*(\d+)/i;
/**
 * Extract the limit clauses from the query.
 * @param parsed
 * @param query
 */
const findLimit = (parsed, query) => {
  const limitFound = query.match(limitMatch);
  if (limitFound) {
    parsed['limit'] = limitFound ? parseInt(limitFound[1]) : undefined;
    return (0, _removeFromQuery.removeFromQuery)(limitFound[0], query);
  }
  return query;
};
exports.findLimit = findLimit;
},{"./removeFromQuery":55}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findMergeJoins = void 0;
var _removeFromQuery = require("./removeFromQuery");
const mergeJoinMatch = /(and)?\s*merge\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+with\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig;
/**
 * Extract merge-join clauses from the query.
 * @param parsed
 * @param query
 */
const findMergeJoins = (parsed, query) => {
  const mergeJoinsFound = query.matchAll(mergeJoinMatch);
  // @ts-ignore
  for (const mergeJoin of mergeJoinsFound) {
    parsed['mergeJoins'].push({
      propertyA: mergeJoin[2],
      propertyB: mergeJoin[3]
    });
    query = (0, _removeFromQuery.removeFromQuery)(mergeJoin[0].trim(), query);
  }
  return query;
};
exports.findMergeJoins = findMergeJoins;
},{"./removeFromQuery":55}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findOffset = void 0;
var _removeFromQuery = require("./removeFromQuery");
const offsetMatch = /offset\s*(\d+)/i;
/**
 * Extract the offset clauses from the query.
 * @param parsed
 * @param query
 */
const findOffset = (parsed, query) => {
  const offsetFound = query.match(offsetMatch);
  if (offsetFound) {
    parsed['offset'] = offsetFound ? parseInt(offsetFound[1]) : undefined;
    return (0, _removeFromQuery.removeFromQuery)(offsetFound[0], query);
  }
  return query;
};
exports.findOffset = findOffset;
},{"./removeFromQuery":55}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSelects = void 0;
var _removeFromQuery = require("./removeFromQuery");
const selectClausesMatch = /select\s+([a-z0-9=._-]+\s*(as\s+)?([a-z0-9_-]+)?)+\s*(,\s*[a-z0-9=._-]+\s*(as\s*[a-z0-9_-]+)?)*/i;
const selectClauseMatch = /(select)?\s*,?\s*([a-z0-9=._-]+)\s*(as\s+)?([a-z0-9_-]+)?/ig;
/**
 * Extract select clauses from the query.
 * @param parsed
 * @param query
 */
const findSelects = (parsed, query) => {
  const selectsFound = query.match(selectClausesMatch);
  if (selectsFound) {
    const selectClausesFound = selectsFound[0].matchAll(selectClauseMatch);
    // @ts-ignore
    for (const selectClause of selectClausesFound) {
      parsed['selectClauses'].push({
        property: selectClause[2],
        alias: selectClause[4]
      });
    }
    return (0, _removeFromQuery.removeFromQuery)(selectsFound[0], query);
  }
  return query;
};
exports.findSelects = findSelects;
},{"./removeFromQuery":55}],49:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSortClauses = void 0;
var _removeFromQuery = require("./removeFromQuery");
const sortMatch = /sort\s+([a-z0-9._-]+\s*(asc|desc)?)+\s*(,\s*[a-z0-9._-]+\s*(asc|desc)?)*/i;
const sortRuleMatch = /(sort)?\s*,?\s*([a-z0-9._-]+)\s*(asc|desc)?/ig;
/**
 * Extract sort clauses from the query.
 * @param parsed
 * @param query
 */
const findSortClauses = (parsed, query) => {
  const sortFound = query.match(sortMatch);
  if (sortFound) {
    const sortRulesFound = sortFound[0].matchAll(sortRuleMatch);
    // @ts-ignore
    for (const sortClause of sortRulesFound) {
      parsed['sortClauses'].push({
        property: sortClause[2],
        direction: sortClause[3] || 'asc'
      });
    }
    return (0, _removeFromQuery.removeFromQuery)(sortFound[0], query);
  }
  return query;
};
exports.findSortClauses = findSortClauses;
},{"./removeFromQuery":55}],50:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findUpdateValues = void 0;
var _removeFromQuery = require("./removeFromQuery");
var _parseLiteralValue = require("./parseLiteralValue");
var _maskStrings = require("./maskStrings");
const literal = `(?:${_maskStrings.placeholderSource.replace('(', '(?:')}|[0-9]+|${_maskStrings.arraySource.replace('(', '(?:')}|null|true|false)`;
const setClauseMatch = new RegExp(`(set)\\s+([a-z0-9_-]+\\s*=\\s*${literal}(?:\\s*,\\s*[a-z0-9_-]+\\s*=\\s*${literal})*)`, 'i');
const assignmentMatch = new RegExp(`([a-z0-9_-]+)\\s*=\\s*(${_maskStrings.placeholderSource}|([0-9]+)|${_maskStrings.arraySource}|(null)|(true)|(false))`, 'ig');
/**
 * Extract an update's "set field = value, field2 = value2" clause from the query. Uses a two-pass
 * match, unlike the other parsers here: the set clause's own boundary is found first (so it can
 * be removed from the query as a whole, and so the comma-separated list doesn't get confused with
 * anything that follows, like a where clause), then each individual assignment is parsed out of
 * that captured substring.
 * @param parsed
 * @param query
 */
const findUpdateValues = (parsed, query) => {
  const clauseFound = query.match(setClauseMatch);
  parsed['updateValues'] = {};
  if (!clauseFound) {
    return query;
  }
  const assignmentsFound = clauseFound[2].matchAll(assignmentMatch);
  // @ts-ignore
  for (const assignment of assignmentsFound) {
    parsed['updateValues'][assignment[1]] = (0, _parseLiteralValue.parseLiteralValue)(assignment, 3);
  }
  return (0, _removeFromQuery.removeFromQuery)(clauseFound[0], query);
};
exports.findUpdateValues = findUpdateValues;
},{"./maskStrings":52,"./parseLiteralValue":53,"./removeFromQuery":55}],51:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEntityProperty = void 0;
const isEntityProperty = property => /^[a-z0-9_-]+\.([a-z0-9_-]+)$/i.test(property);
exports.isEntityProperty = isEntityProperty;
},{}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unmaskStrings = exports.placeholderSource = exports.maskStrings = exports.maskArrays = exports.fromPlaceholder = exports.arraySource = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.some.js");
var _scanQuery = require("./scanQuery");
/**
 * Regex source matching one placeholder from maskStrings, with the hex-encoded value as its only group. The
 * find* parsers use it where they would otherwise match a quoted string.
 */
const placeholderSource = exports.placeholderSource = '\\u0000([0-9a-f]*)\\u0000';
const placeholderMatch = new RegExp(placeholderSource, 'g');
/**
 * Regex source matching one placeholder from maskArrays, with the hex-encoded JSON of the array as its only group.
 * The find* parsers use it where they would otherwise match `[...]`.
 */
const arraySource = exports.arraySource = '\\u0001([0-9a-f]*)\\u0001';
const arrayMatch = new RegExp(arraySource, 'g');
/**
 * Encode a value as hex, four digits per UTF-16 code unit: only 0-9 and a-f, so no keyword, quote, space or
 * bracket a parser looks for can appear in it.
 * @param value
 */
const toHex = value => value.split('').map(char => char.charCodeAt(0).toString(16).padStart(4, '0')).join('');
/**
 * Turn the hex of a placeholder back into the string's value.
 * @param hex
 */
const fromPlaceholder = hex => (hex.match(/.{4}/g) || []).map(code => String.fromCharCode(parseInt(code, 16))).join('');
/**
 * Replace every quoted string in a query with a placeholder holding its value (with the escapes applied), so that
 * nothing inside a string (a keyword, a quote, `and`, a `]`) can be matched by the find* parsers.
 * @param query
 * @throws {Error} For an unclosed string, comment or bracket, or a NUL or SOH character outside a string (which
 * could otherwise pass for a placeholder).
 */
exports.fromPlaceholder = fromPlaceholder;
const maskStrings = query => {
  const {
    strings
  } = (0, _scanQuery.assertClosed)((0, _scanQuery.scanQuery)(query));
  for (const [character, name] of [['\u0000', 'NUL'], ['\u0001', 'SOH']]) {
    for (let index = query.indexOf(character); index !== -1; index = query.indexOf(character, index + 1)) {
      if (!strings.some(({
        start,
        end
      }) => start < index && index < end)) {
        throw new Error(`Unexpected ${name} character at position ${index}`);
      }
    }
  }
  return strings.reduceRight((masked, {
    start,
    end,
    value
  }) => `${masked.slice(0, start)}\u0000${toHex(value)}\u0000${masked.slice(end)}`, query);
};
/**
 * Put every placeholder back the way it would be written in a query: strings quoted, arrays as JSON. For error
 * messages, and for reading an array's text as JSON.
 * @param text
 * @param quote - wrap strings with JSON's double quotes (the default) or with single quotes
 */
exports.maskStrings = maskStrings;
const unmaskStrings = (text, quote = 'json') => text.replace(placeholderMatch, (placeholder, hex) => {
  const value = fromPlaceholder(hex);
  return quote === 'json' ? JSON.stringify(value) : `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`;
}).replace(arrayMatch, (placeholder, hex) => fromPlaceholder(hex));
/**
 * Read one array's text (its strings already placeholders) as JSON, so it is checked once, here, with a clear error.
 * @param text
 */
exports.unmaskStrings = unmaskStrings;
const arrayJson = text => {
  try {
    // A number too big for a double reads as Infinity, which JSON would write back as null: refuse it instead
    return JSON.stringify(JSON.parse(unmaskStrings(text), (key, value) => {
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new Error(`${value} is too large`);
      }
      return value;
    }));
  } catch (e) {
    throw new Error(`Invalid array ${unmaskStrings(text, '\'')}: ${e.message}`);
  }
};
/**
 * Replace every array (outermost brackets only, so a nested array stays inside its parent) with a placeholder holding
 * its JSON, so that the find* parsers never have to find where an array ends, and nothing inside one (a `.`, a `]`,
 * a keyword) can be matched by them. Run it on the output of maskStrings, where no `[` or `]` is inside a string.
 * @param masked
 * @throws {Error} For an array which is not valid JSON once its strings are put back.
 */
const maskArrays = masked => {
  let result = '';
  let depth = 0;
  let start = 0;
  for (let index = 0; index < masked.length; index++) {
    const char = masked[index];
    if (char === '[') {
      if (depth === 0) {
        start = index;
      }
      depth++;
    } else if (char === ']' && depth > 0) {
      depth--;
      if (depth === 0) {
        result += `\u0001${toHex(arrayJson(masked.slice(start, index + 1)))}\u0001`;
        continue;
      }
    }
    if (depth === 0) {
      result += char;
    }
  }
  return depth > 0 ? result + masked.slice(start) : result;
};
exports.maskArrays = maskArrays;
},{"./scanQuery":56,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.some.js":230}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseLiteralValue = void 0;
var _maskStrings = require("./maskStrings");
/**
 * Several parsers (findConditions, findInsertValues, findUpdateValues) capture a query-string
 * literal into one of six consecutive alternation groups depending on its shape - quoted string
 * (by then a placeholder from maskStrings, holding the string's value as hex),
 * number, array, null, true, false - since a single regex can't otherwise tell them apart. Given
 * the match and the index of the first of those six groups (which shifts depending on how many
 * groups come before it in the parent regex), return the literal with its real JS type.
 * @param match
 * @param baseIndex
 */
const parseLiteralValue = (match, baseIndex) => {
  if (typeof match[baseIndex] !== 'undefined') {
    return (0, _maskStrings.fromPlaceholder)(match[baseIndex]);
  }
  if (typeof match[baseIndex + 1] !== 'undefined') {
    return Number(match[baseIndex + 1]);
  }
  if (typeof match[baseIndex + 2] !== 'undefined') {
    // An array is a placeholder from maskArrays, holding its JSON
    return JSON.parse((0, _maskStrings.fromPlaceholder)(match[baseIndex + 2]));
  }
  if (typeof match[baseIndex + 3] !== 'undefined') {
    return null;
  }
  if (typeof match[baseIndex + 4] !== 'undefined') {
    return true;
  }
  return false;
};
exports.parseLiteralValue = parseLiteralValue;
},{"./maskStrings":52}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseQuery = void 0;
var _siFunciona = _interopRequireDefault(require("si-funciona"));
var _findCommand = require("./findCommand");
var _findInsertValues = require("./findInsertValues");
var _findUpdateValues = require("./findUpdateValues");
var _findJoinEntity = require("./findJoinEntity");
var _findSelects = require("./findSelects");
var _findConditions = require("./findConditions");
var _findJoinClauses = require("./findJoinClauses");
var _findMergeJoins = require("./findMergeJoins");
var _findSortClauses = require("./findSortClauses");
var _findGroupBy = require("./findGroupBy");
var _findLimit = require("./findLimit");
var _findOffset = require("./findOffset");
var _maskStrings = require("./maskStrings");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Break a query down into its components.
 * @param query
 */
const parseQuery = query => {
  const parsedQuery = {
    command: undefined,
    entity: undefined,
    joinEntity: undefined,
    selectClauses: [],
    insertValues: [],
    updateValues: {},
    conditions: [],
    joinClauses: [],
    mergeJoins: [],
    sortClauses: [],
    groupBy: undefined,
    limit: undefined,
    offset: undefined
  };
  const {
    curry,
    pipe
  } = _siFunciona.default;
  // No find* step may see inside a string or an array: each one becomes a placeholder holding its value
  query = (0, _maskStrings.maskArrays)((0, _maskStrings.maskStrings)(query));
  query = pipe(curry(_findCommand.findCommand)(parsedQuery), curry(_findInsertValues.findInsertValues)(parsedQuery), curry(_findUpdateValues.findUpdateValues)(parsedQuery), curry(_findJoinEntity.findJoinEntity)(parsedQuery), curry(_findSelects.findSelects)(parsedQuery), curry(_findConditions.findConditions)(parsedQuery), curry(_findJoinClauses.findJoinClauses)(parsedQuery), curry(_findMergeJoins.findMergeJoins)(parsedQuery), curry(_findSortClauses.findSortClauses)(parsedQuery), curry(_findGroupBy.findGroupBy)(parsedQuery), curry(_findLimit.findLimit)(parsedQuery), curry(_findOffset.findOffset)(parsedQuery))(query);
  if (query) {
    if (/^\s*(delete|insert|read|update)\s/i.test(query)) {
      throw new Error(`Missing ; before: ${(0, _maskStrings.unmaskStrings)(query.trim(), '\'')}`);
    }
    throw new Error(`Unrecognized query value: ${(0, _maskStrings.unmaskStrings)(query, '\'')}`);
  }
  return parsedQuery;
};
exports.parseQuery = parseQuery;
},{"./findCommand":39,"./findConditions":40,"./findGroupBy":41,"./findInsertValues":42,"./findJoinClauses":43,"./findJoinEntity":44,"./findLimit":45,"./findMergeJoins":46,"./findOffset":47,"./findSelects":48,"./findSortClauses":49,"./findUpdateValues":50,"./maskStrings":52,"si-funciona":343}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeFromQuery = void 0;
const removeFromQuery = (substring, query) => query.replace(substring, '').trim();
exports.removeFromQuery = removeFromQuery;
},{}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scanQuery = exports.assertClosed = void 0;
const escapes = {
  n: '\n',
  t: '\t'
};
const closers = {
  ']': '[',
  ')': '('
};
/**
 * Walk a query once, left to right, finding its strings, comments and the `;` between statements.
 *
 * Strings use `'` or `"` and close only with the quote they opened with. Inside a string a backslash escapes the
 * next character: `\n` and `\t` are a newline and a tab, any other `\x` is `x` (so `\'`, `\"` and `\\` are a quote
 * and a backslash). Outside strings a backslash has no meaning. Comments run from `--` to the end of the line, or
 * from `/*` to `*\/`; anything inside a comment is ignored, and comment markers inside a string are just text. A `--`
 * starts a comment only at the start of the text or after whitespace or a `;`, since names can contain `-`
 * (`my--table` is a name). A `;` inside brackets does not end a query.
 *
 * Never throws: whatever is left open is reported in `end`, for a prompt which asks for more input. Use
 * assertClosed to turn it into an error.
 * @param text
 */
const scanQuery = (text = '') => {
  const strings = [];
  const comments = [];
  const semicolons = [];
  const brackets = [];
  let strayCloser;
  let openQuote;
  let escape = false;
  let blockComment = false;
  let lastCode = -1;
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '\'' || char === '"') {
      const start = index;
      let value = '';
      index++;
      while (index < text.length && text[index] !== char) {
        if (text[index] === '\\') {
          if (index + 1 === text.length) {
            escape = true;
            index++;
            break;
          }
          value += escapes[text[index + 1]] ?? text[index + 1];
          index += 2;
          continue;
        }
        value += text[index];
        index++;
      }
      if (index < text.length) {
        index++;
      } else {
        openQuote = char;
      }
      strings.push({
        start,
        end: index,
        quote: char,
        value
      });
      lastCode = start;
      continue;
    }
    if (char === '-' && next === '-' && (index === 0 || /[\s;]/.test(text[index - 1]))) {
      const newline = text.indexOf('\n', index + 2);
      const end = newline === -1 ? text.length : newline + 1;
      comments.push({
        start: index,
        end,
        kind: 'line'
      });
      index = end;
      continue;
    }
    if (char === '/' && next === '*') {
      const close = text.indexOf('*/', index + 2);
      const end = close === -1 ? text.length : close + 2;
      blockComment = close === -1;
      comments.push({
        start: index,
        end,
        kind: 'block'
      });
      index = end;
      continue;
    }
    if (char === '[' || char === '(') {
      brackets.push(char);
    } else if (closers[char]) {
      if (brackets[brackets.length - 1] === closers[char]) {
        brackets.pop();
      } else if (!strayCloser) {
        strayCloser = {
          char,
          index
        };
      }
    } else if (char === ';' && brackets.length === 0) {
      semicolons.push(index);
    }
    if (!/\s/.test(char)) {
      lastCode = index;
    }
    index++;
  }
  const end = {
    quote: openQuote,
    escape,
    blockComment,
    brackets,
    strayCloser
  };
  const closed = !end.quote && !end.blockComment && brackets.length === 0;
  return {
    strings,
    comments,
    semicolons,
    end,
    closed,
    terminated: closed && semicolons.length > 0 && semicolons[semicolons.length - 1] === lastCode
  };
};
/**
 * Throw a clear error for anything scanQuery found left open or unmatched: a string, a block comment or a bracket.
 * @param scanned
 */
exports.scanQuery = scanQuery;
const assertClosed = scanned => {
  const {
    end
  } = scanned;
  if (end.quote) {
    const open = scanned.strings[scanned.strings.length - 1];
    throw new Error(`Unclosed string: the ${end.quote} at position ${open.start} is never closed`);
  }
  if (end.blockComment) {
    throw new Error(`Unclosed comment: the /* at position ${scanned.comments[scanned.comments.length - 1].start} is never closed`);
  }
  if (end.strayCloser) {
    throw new Error(`Unexpected ${end.strayCloser.char} at position ${end.strayCloser.index}: there is nothing to close`);
  }
  if (end.brackets.length > 0) {
    throw new Error(`Unclosed bracket: ${end.brackets.join(' ')} never closed`);
  }
  return scanned;
};
exports.assertClosed = assertClosed;
},{}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitEntityProperty = void 0;
const entityMatch = /^[a-z0-9_-]+/i;
const propertyMatch = /\.([a-z0-9_-]+)$/i;
const splitEntityProperty = entityProp => {
  const entityFound = entityProp.match(entityMatch);
  if (!entityFound) {
    throw new Error(`Unable to use property: ${entityProp}`);
  }
  const propFound = entityProp.match(propertyMatch);
  if (!propFound) {
    throw new Error(`Unable to use property: ${entityProp}`);
  }
  return {
    entity: entityFound[0],
    property: propFound[1]
  };
};
exports.splitEntityProperty = splitEntityProperty;
},{}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitQueries = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _scanQuery = require("./scanQuery");
/**
 * Split a string of queries into one query each, on the `;` between them. A `;` inside a string or a comment does
 * not count, comments are removed, and the `;` after the last query is optional.
 * @param queries
 * @throws {Error} For an unclosed string, block comment or bracket.
 */
const splitQueries = (queries = '') => {
  const {
    comments,
    semicolons
  } = (0, _scanQuery.assertClosed)((0, _scanQuery.scanQuery)(queries));
  // Blank each comment out with spaces, so the positions of the ; stay the same and the words either side stay apart
  const uncommented = comments.reduce((text, {
    start,
    end
  }) => `${text.slice(0, start)}${' '.repeat(end - start)}${text.slice(end)}`, queries);
  return [...semicolons, uncommented.length].map((end, index) => uncommented.slice(index === 0 ? 0 : semicolons[index - 1] + 1, end).trim()).filter(query => query.length > 0);
};
exports.splitQueries = splitQueries;
},{"./scanQuery":56,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.reduce.js":229}],59:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reconcileJoin = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.for-each.js");
var _where = require("../queries/where");
const reconcileJoin = (dataSet, entityName, entityKey, joinEntity, joinProp) => {
  const entity = dataSet[entityName][entityKey];
  if (Object.prototype.hasOwnProperty.call(entity, joinEntity) && Array.isArray(entity[joinEntity])) {
    entity[joinEntity].forEach((mergedEntity, k) => {
      const matchedEntity = (0, _where.where)(dataSet[joinEntity], {
        property: joinProp,
        comparator: '=',
        value: mergedEntity[joinProp]
      });
      if (matchedEntity.length) {
        dataSet[entityName][entityKey][joinEntity][k] = matchedEntity[0];
      }
    });
  }
  return dataSet;
};
exports.reconcileJoin = reconcileJoin;
},{"../queries/where":28,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.for-each.js":227}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reconcileJoins = void 0;
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _reconcileJoin = require("./reconcileJoin");
const reconcileJoins = (propertyA, propertyB, dataSet) => {
  const {
    entity: entityA,
    property: propA
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyA);
  const {
    entity: entityB,
    property: propB
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyB);
  for (const entityName in dataSet) {
    for (const entityKey in dataSet[entityName]) {
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityA, propA);
      dataSet = (0, _reconcileJoin.reconcileJoin)(dataSet, entityName, entityKey, entityB, propB);
    }
  }
  return dataSet;
};
exports.reconcileJoins = reconcileJoins;
},{"./parsers/splitEntityProperty":57,"./reconcileJoin":59}],61:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerRecord = void 0;
require("core-js/modules/es.array.includes.js");
require("core-js/modules/es.json.stringify.js");
var _config = require("./config");
const {
  readFile,
  writeFile
} = require('fs/promises');
/**
 * __RECORDS is itself an ordinary record - path/definition/keys/entries - whose entries are the
 * filenames of every other record that has been created. This is the schema it's given the first
 * time a record is registered and no __RECORDS.json exists yet, matching what a hand-authored
 * database (see test-data/__RECORDS.json) already expects to find.
 */
const defaultRegistry = () => ({
  path: '',
  definition: [{
    name: 'path',
    type: 'string',
    optional: false,
    autoGenerate: false
  }, {
    name: 'definition',
    type: 'object',
    optional: false,
    autoGenerate: false
  }, {
    name: 'keys',
    type: 'array',
    optional: false,
    autoGenerate: false
  }, {
    name: 'entries',
    type: 'array',
    optional: false,
    autoGenerate: false
  }],
  keys: [],
  entries: []
});
/**
 * Add a record's filename to the __RECORDS registry, creating the registry file the first time
 * a record is created if it doesn't already exist.
 * @param recordName
 */
const registerRecord = async recordName => {
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const registryPath = `${databasePath}__RECORDS.json`;
  let registry;
  try {
    registry = JSON.parse(await readFile(registryPath, 'utf8'));
  } catch (err) {
    registry = defaultRegistry();
  }
  const fileName = `${recordName}.json`;
  if (!registry.entries.includes(fileName)) {
    registry.entries.push(fileName);
  }
  await writeFile(registryPath, JSON.stringify(registry, null, 2));
  return registry;
};
exports.registerRecord = registerRecord;
},{"./config":31,"core-js/modules/es.array.includes.js":208,"core-js/modules/es.json.stringify.js":218,"fs/promises":73}],62:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeFromIndex = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.map.js");
var _config = require("./config");
var _compareAs = require("./compareAs");
const {
  readFile,
  writeFile
} = require('fs/promises');
/**
 * Remove a single entry file from the index that backs one of a record's keys, dropping a value
 * entirely once its last file is removed. A key with no lookup, or an index file that doesn't
 * exist yet, is left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 * @param type - The declared type of the indexed value (see keyValueType), so '3' and 3 are one entry.
 */
const removeFromIndex = async (path = '', key = null, value = undefined, fileName = '', type = undefined) => {
  if (!key || !key.lookup) {
    return null;
  }
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const indexPath = `${databasePath}__indexes/${path}/${key.lookup}`;
  let index = [];
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'));
  } catch (err) {
    return null;
  }
  index = index.map(entry => (0, _compareAs.sameValue)(type, entry.value, value) ? {
    value: entry.value,
    record: entry.record.filter(record => record !== fileName)
  } : entry).filter(entry => entry.record.length);
  await writeFile(indexPath, JSON.stringify(index, null, 2));
  return index;
};
exports.removeFromIndex = removeFromIndex;
},{"./compareAs":29,"./config":31,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.map.js":228,"fs/promises":73}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.restrictIndexedList = void 0;
var _splitEntityProperty = require("./parsers/splitEntityProperty");
const restrictIndexedList = (joinClause, filterJoins, indexedClone) => {
  const {
    entity: entityA,
    property: propertyA
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyA);
  const {
    entity: entityB,
    property: propertyB
  } = (0, _splitEntityProperty.splitEntityProperty)(joinClause.propertyB);
  if (Object.prototype.hasOwnProperty.call(filterJoins, entityA)) {
    const existingEntities = filterJoins[entityA];
    if (!Object.prototype.hasOwnProperty.call(indexedClone, entityA)) {
      indexedClone[entityA] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(indexedClone[entityA], propertyA)) {
      indexedClone[entityA][propertyA] = {};
    }
    indexedClone[entityA][propertyA] = [{
      value: existingEntities[0][propertyA],
      record: existingEntities
    }];
  }
  if (Object.prototype.hasOwnProperty.call(filterJoins, entityB)) {
    const existingEntities = filterJoins[entityB];
    if (!Object.prototype.hasOwnProperty.call(indexedClone, entityB)) {
      indexedClone[entityB] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(indexedClone[entityB], propertyB)) {
      indexedClone[entityB][propertyB] = {};
    }
    indexedClone[entityB][propertyB] = [{
      value: existingEntities[0][propertyB],
      record: existingEntities
    }];
  }
  return indexedClone;
};
exports.restrictIndexedList = restrictIndexedList;
},{"./parsers/splitEntityProperty":57}],64:[function(require,module,exports){
"use strict";

require("core-js/modules/esnext.weak-map.delete-all.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveFile = void 0;
var jsEnv = _interopRequireWildcard(require("browser-or-node"));
var _config = require("./config");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const retrieveFile = async path => {
  let retrieveFn = url => fetch(url).then(res => res.json());
  const relativePath = jsEnv.isBrowser ? (0, _config.getSetting)('relativePath', '') : '';
  if (jsEnv.isNode) {
    const {
      readFile
    } = require('fs/promises');
    retrieveFn = url => readFile(url).then(res => JSON.parse(res));
  }
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const fetchUrl = `${relativePath}${databasePath}${path}`;
  const recordInfo = await retrieveFn(fetchUrl).catch(err => console.error(err));
  if (!recordInfo) {
    throw new Error(`Could not read ${path}`);
  }
  return recordInfo;
};
exports.retrieveFile = retrieveFile;
},{"./config":31,"browser-or-node":72,"core-js/modules/esnext.weak-map.delete-all.js":260,"fs/promises":73}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveIndexes = void 0;
require("core-js/modules/es.array.includes.js");
var _retrieveFile = require("./retrieveFile");
var _retrieveRecord = require("./retrieveRecord");
const retrieveIndexes = async (entity = '', properties = [], recordData = {}) => {
  if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
    recordData[entity] = await (0, _retrieveRecord.retrieveRecord)(entity);
  }
  const indexSet = {};
  for (const property of properties) {
    for (const key of recordData[entity].keys) {
      if (key.fields.includes(property)) {
        indexSet[property] = await (0, _retrieveFile.retrieveFile)(`__indexes/${entity}/${key.lookup}`);
      }
    }
  }
  return indexSet;
};
exports.retrieveIndexes = retrieveIndexes;
},{"./retrieveFile":64,"./retrieveRecord":66,"core-js/modules/es.array.includes.js":208}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retrieveRecord = void 0;
var _retrieveFile = require("./retrieveFile");
const retrieveRecord = async (entity = '') => await (0, _retrieveFile.retrieveFile)(`${entity}.json`);
exports.retrieveRecord = retrieveRecord;
},{"./retrieveFile":64}],67:[function(require,module,exports){
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
},{"./retrieveFile":64,"./retrieveRecord":66}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runQuery = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _deleteEntity = require("../queries/deleteEntity");
var _insertEntity = require("../queries/insertEntity");
var _readEntity = require("../queries/readEntity");
var _updateEntity = require("../queries/updateEntity");
var _joinEntity = require("../queries/joinEntity");
var _mergeJoins = require("../queries/mergeJoins");
var _where = require("../queries/where");
var _sortBy = require("../queries/sortBy");
var _groupBy = require("../queries/groupBy");
var _limitOffset = require("../queries/limitOffset");
var _selectFields = require("../queries/selectFields");
var _retrieveRecord = require("./retrieveRecord");
var _getConditionIndexedList = require("./getConditionIndexedList");
var _getJoinIndexedList = require("./getJoinIndexedList");
var _isEntityProperty = require("./parsers/isEntityProperty");
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _fieldType = require("./fieldType");
/**
 * Give each condition its field's declared type, so where compares by it (a joined entity's field
 * is looked up on that entity's record).
 * @param parsed
 * @param recordData
 */
const typeConditions = async (parsed, recordData) => {
  for (const condition of parsed.conditions) {
    let entity = parsed.entity;
    let property = condition.property;
    if ((0, _isEntityProperty.isEntityProperty)(property)) {
      ({
        entity,
        property
      } = (0, _splitEntityProperty.splitEntityProperty)(property));
    }
    if (!Object.prototype.hasOwnProperty.call(recordData, entity)) {
      recordData[entity] = await (0, _retrieveRecord.retrieveRecord)(entity);
    }
    condition.type = (0, _fieldType.fieldType)(recordData[entity], property);
  }
};
const runQuery = async parsed => {
  const recordData = {
    [parsed.entity]: await (0, _retrieveRecord.retrieveRecord)(parsed.entity)
  };
  if (typeof parsed.joinEntity !== 'undefined') {
    recordData[parsed.joinEntity] = await (0, _retrieveRecord.retrieveRecord)(parsed.joinEntity);
  }
  await typeConditions(parsed, recordData);
  let dataSet = {
    [parsed.entity]: []
  };
  // A condition that's indexed but genuinely matches nothing leaves dataSet[entity] at [] - the
  // same state it starts in before anything has looked at it at all. readEntity() (below) can't
  // tell those two states apart on its own (it reloads whenever the array is empty, regardless of
  // why), so capture here, before that ambiguity can happen, whether every condition actually got
  // resolved this way - if so, dataSet[entity] is already correct and must not be reloaded.
  const hadConditions = parsed.conditions.length > 0;
  parsed = await (0, _getConditionIndexedList.getConditionIndexedList)(parsed, recordData, dataSet);
  const conditionsFullyIndexed = hadConditions && parsed.conditions.length === 0;
  parsed = await (0, _getJoinIndexedList.getJoinIndexedList)(parsed, recordData, dataSet);
  // delete/update act on whatever is already in dataSet[entity] - unlike read, which loads
  // everything and lets the where-reduce below narrow it down afterward, they never get a second
  // pass. So the matching rows have to be fully resolved (indexed conditions already are, via
  // getConditionIndexedList above; anything left in parsed.conditions is not) before either runs.
  if (parsed.command === 'delete' || parsed.command === 'update') {
    if (!conditionsFullyIndexed) {
      dataSet = await (0, _readEntity.readEntity)(parsed.entity, dataSet);
    }
    dataSet[parsed.entity] = parsed.conditions.reduce((remainingData, condition) => (0, _where.where)(remainingData, condition), dataSet[parsed.entity]);
  }
  switch (parsed.command) {
    case 'delete':
      dataSet = await (0, _deleteEntity.deleteEntity)(parsed.entity, dataSet);
      break;
    case 'insert':
      dataSet = await (0, _insertEntity.insertEntity)(parsed.entity, parsed.insertValues, dataSet);
      break;
    case 'read':
      if (!conditionsFullyIndexed) {
        dataSet = await (0, _readEntity.readEntity)(parsed.entity, dataSet);
      }
      break;
    case 'update':
      dataSet = await (0, _updateEntity.updateEntity)(parsed.entity, parsed.updateValues, dataSet);
      break;
    default:
      throw new Error(`Unknown command: ${parsed.command}`);
  }
  dataSet = await (0, _joinEntity.joinEntity)(parsed.entity, parsed.joinEntity, dataSet, parsed.joinClauses, conditionsFullyIndexed);
  dataSet = await (0, _mergeJoins.mergeJoins)(dataSet, parsed.mergeJoins);
  // delete/update already had parsed.conditions applied above, before they ran. Re-applying the
  // same conditions here would be wrong, not just redundant, for update specifically: if the
  // update just changed the very field a condition filters on, re-checking that condition against
  // the now-changed data would filter the just-updated rows back out.
  if (parsed.command !== 'delete' && parsed.command !== 'update') {
    dataSet[parsed.entity] = parsed.conditions.reduce((remainingData, condition) => {
      return (0, _where.where)(remainingData, condition);
    }, dataSet[parsed.entity]);
  }
  dataSet[parsed.entity] = (0, _sortBy.sortBy)(dataSet[parsed.entity], parsed.sortClauses);
  dataSet[parsed.entity] = (0, _limitOffset.limitOffset)(dataSet[parsed.entity], parsed.offset, parsed.limit);
  dataSet[parsed.entity] = (0, _groupBy.groupBy)(dataSet[parsed.entity], parsed.groupBy);
  dataSet[parsed.entity] = (0, _selectFields.selectFields)(dataSet[parsed.entity], parsed.selectClauses);
  return dataSet;
};
exports.runQuery = runQuery;
},{"../queries/deleteEntity":15,"../queries/groupBy":16,"../queries/insertEntity":17,"../queries/joinEntity":18,"../queries/limitOffset":19,"../queries/mergeJoins":20,"../queries/readEntity":24,"../queries/selectFields":25,"../queries/sortBy":26,"../queries/updateEntity":27,"../queries/where":28,"./fieldType":33,"./getConditionIndexedList":34,"./getJoinIndexedList":35,"./parsers/isEntityProperty":51,"./parsers/splitEntityProperty":57,"./retrieveRecord":66,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateIndex = void 0;
require("core-js/modules/es.array.includes.js");
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
var _config = require("./config");
var _compareAs = require("./compareAs");
const {
  readFile,
  writeFile,
  mkdir
} = require('fs/promises');
/**
 * Add a single entry file to the index that backs one of a record's keys, creating the index
 * file (and its __indexes/{record} directory) the first time a value is indexed. Keys with no
 * lookup (multi-field keys are not indexed here) are left untouched.
 * @param path
 * @param key
 * @param value
 * @param fileName
 * @param type - The declared type of the indexed value (see keyValueType), so '3' and 3 share one entry.
 */
const updateIndex = async (path = '', key = null, value = undefined, fileName = '', type = undefined) => {
  if (!key || !key.lookup) {
    return null;
  }
  const databasePath = (0, _config.getSetting)('databasePath', 'database/');
  const indexDir = `${databasePath}__indexes/${path}`;
  const indexPath = `${indexDir}/${key.lookup}`;
  let index = [];
  try {
    index = JSON.parse(await readFile(indexPath, 'utf8'));
  } catch (err) {
    index = [];
  }
  const existingEntry = index.find(entry => (0, _compareAs.sameValue)(type, entry.value, value));
  if (existingEntry) {
    if (!existingEntry.record.includes(fileName)) {
      existingEntry.record.push(fileName);
    }
  } else {
    index.push({
      value,
      record: [fileName]
    });
  }
  await mkdir(indexDir, {
    recursive: true
  });
  await writeFile(indexPath, JSON.stringify(index, null, 2));
  return index;
};
exports.updateIndex = updateIndex;
},{"./compareAs":29,"./config":31,"core-js/modules/es.array.includes.js":208,"core-js/modules/es.json.stringify.js":218,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226,"fs/promises":73}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useJoinClause = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _readEntity = require("../queries/readEntity");
var _where = require("../queries/where");
var _splitEntityProperty = require("./parsers/splitEntityProperty");
var _siFunciona = _interopRequireDefault(require("si-funciona"));
var _retrieveRecord = require("./retrieveRecord");
var _fieldType = require("./fieldType");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const useJoinClause = async ({
  propertyA = null,
  comparator = '=',
  propertyB = null
} = {}, dataSets = {}, filterJoins = {}) => {
  const {
    entity: entityA,
    property: propA
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyA);
  const {
    entity: entityB,
    property: propB
  } = (0, _splitEntityProperty.splitEntityProperty)(propertyB);
  if (!Object.prototype.hasOwnProperty.call(dataSets, entityA)) {
    dataSets = await (0, _readEntity.readEntity)(entityA, dataSets);
  }
  if (!Object.prototype.hasOwnProperty.call(dataSets, entityB)) {
    dataSets = await (0, _readEntity.readEntity)(entityB, dataSets);
  }
  if (!Object.prototype.hasOwnProperty.call(filterJoins, entityA)) {
    filterJoins[entityA] = _siFunciona.default.cloneObject(dataSets[entityA]);
  }
  if (!Object.prototype.hasOwnProperty.call(filterJoins, entityB)) {
    filterJoins[entityB] = _siFunciona.default.cloneObject(dataSets[entityB]);
  }
  const typeA = (0, _fieldType.fieldType)(await (0, _retrieveRecord.retrieveRecord)(entityA), propA);
  const typeB = (0, _fieldType.fieldType)(await (0, _retrieveRecord.retrieveRecord)(entityB), propB);
  filterJoins[entityA] = filterJoins[entityB].reduce((dataA, dataB) => _siFunciona.default.mergeArrays(dataA, (0, _where.where)(filterJoins[entityA], {
    property: propA,
    comparator,
    value: dataB[propB],
    type: typeA
  })), []);
  filterJoins[entityB] = filterJoins[entityA].reduce((dataB, dataA) => _siFunciona.default.mergeArrays(dataB, (0, _where.where)(filterJoins[entityB], {
    property: propB,
    comparator,
    value: dataA[propA],
    type: typeB
  })), []);
  return filterJoins;
};
exports.useJoinClause = useJoinClause;
},{"../queries/readEntity":24,"../queries/where":28,"./fieldType":33,"./parsers/splitEntityProperty":57,"./retrieveRecord":66,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229,"si-funciona":343}],71:[function(require,module,exports){
"use strict";

require("core-js/modules/esnext.async-iterator.constructor.js");
require("core-js/modules/esnext.async-iterator.drop.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.drop.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "configure", {
  enumerable: true,
  get: function () {
    return _config.configure;
  }
});
Object.defineProperty(exports, "create", {
  enumerable: true,
  get: function () {
    return _introspect.create;
  }
});
Object.defineProperty(exports, "describe", {
  enumerable: true,
  get: function () {
    return _introspect.describe;
  }
});
Object.defineProperty(exports, "drop", {
  enumerable: true,
  get: function () {
    return _introspect.drop;
  }
});
Object.defineProperty(exports, "query", {
  enumerable: true,
  get: function () {
    return _query.query;
  }
});
Object.defineProperty(exports, "quote", {
  enumerable: true,
  get: function () {
    return _quote.quote;
  }
});
var _query = require("./data/queries/query");
var _quote = require("./data/queries/quote");
var _introspect = require("./data/introspect");
var _config = require("./data/utilities/config");
},{"./data/introspect":8,"./data/queries/query":22,"./data/queries/quote":23,"./data/utilities/config":31,"core-js/modules/esnext.async-iterator.constructor.js":220,"core-js/modules/esnext.async-iterator.drop.js":221,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.drop.js":223}],72:[function(require,module,exports){
(function (process){(function (){
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  isBrowser: () => isBrowser,
  isBun: () => isBun,
  isDeno: () => isDeno,
  isJsDom: () => isJsDom,
  isNode: () => isNode,
  isWebWorker: () => isWebWorker
});
module.exports = __toCommonJS(src_exports);
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
var isNode = (
  // @ts-expect-error
  typeof process !== "undefined" && // @ts-expect-error
  process.versions != null && // @ts-expect-error
  process.versions.node != null
);
var isWebWorker = typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
var isJsDom = typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && "userAgent" in navigator && typeof navigator.userAgent === "string" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom"));
var isDeno = (
  // @ts-expect-error
  typeof Deno !== "undefined" && // @ts-expect-error
  typeof Deno.version !== "undefined" && // @ts-expect-error
  typeof Deno.version.deno !== "undefined"
);
var isBun = typeof process !== "undefined" && process.versions != null && process.versions.bun != null;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isBrowser,
  isBun,
  isDeno,
  isJsDom,
  isNode,
  isWebWorker
});

}).call(this)}).call(this,require('_process'))
},{"_process":263}],73:[function(require,module,exports){

},{}],74:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var tryToString = require('../internals/try-to-string');

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a function');
};

},{"../internals/is-callable":129,"../internals/try-to-string":200}],75:[function(require,module,exports){
'use strict';
var has = require('../internals/map-helpers').has;

// Perform ? RequireInternalSlot(M, [[MapData]])
module.exports = function (it) {
  has(it);
  return it;
};

},{"../internals/map-helpers":149}],76:[function(require,module,exports){
'use strict';
var has = require('../internals/set-helpers').has;

// Perform ? RequireInternalSlot(M, [[SetData]])
module.exports = function (it) {
  has(it);
  return it;
};

},{"../internals/set-helpers":175}],77:[function(require,module,exports){
'use strict';
var has = require('../internals/weak-map-helpers').has;

// Perform ? RequireInternalSlot(M, [[WeakMapData]])
module.exports = function (it) {
  has(it);
  return it;
};

},{"../internals/weak-map-helpers":205}],78:[function(require,module,exports){
'use strict';
var has = require('../internals/weak-set-helpers').has;

// Perform ? RequireInternalSlot(M, [[WeakSetData]])
module.exports = function (it) {
  has(it);
  return it;
};

},{"../internals/weak-set-helpers":206}],79:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');
var create = require('../internals/object-create');
var defineProperty = require('../internals/object-define-property').f;

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

},{"../internals/object-create":154,"../internals/object-define-property":156,"../internals/well-known-symbol":207}],80:[function(require,module,exports){
'use strict';
var isPrototypeOf = require('../internals/object-is-prototype-of');

var $TypeError = TypeError;

module.exports = function (it, Prototype) {
  if (isPrototypeOf(Prototype, it)) return it;
  throw new $TypeError('Incorrect invocation');
};

},{"../internals/object-is-prototype-of":161}],81:[function(require,module,exports){
'use strict';
var isObject = require('../internals/is-object');

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError($String(argument) + ' is not an object');
};

},{"../internals/is-object":133}],82:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    if (length === 0) return !IS_INCLUDES && -1;
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

},{"../internals/length-of-array-like":147,"../internals/to-absolute-index":189,"../internals/to-indexed-object":190}],83:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var perform = require('../internals/perform');
var anObject = require('../internals/an-object');
var create = require('../internals/object-create');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIns = require('../internals/define-built-ins');
var wellKnownSymbol = require('../internals/well-known-symbol');
var InternalStateModule = require('../internals/internal-state');
var getBuiltIn = require('../internals/get-built-in');
var getMethod = require('../internals/get-method');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var createIterResultObject = require('../internals/create-iter-result-object');
var cleanupState = require('../internals/iterator-cleanup-state');

var Promise = getBuiltIn('Promise');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ASYNC_ITERATOR_HELPER = 'AsyncIteratorHelper';
var WRAP_FOR_VALID_ASYNC_ITERATOR = 'WrapForValidAsyncIterator';
var setInternalState = InternalStateModule.set;

var createAsyncIteratorProxyPrototype = function (IS_ITERATOR) {
  var IS_GENERATOR = !IS_ITERATOR;
  var getInternalState = InternalStateModule.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER);

  var getStateOrEarlyExit = function (that) {
    var stateCompletion = perform(function () {
      return getInternalState(that);
    });

    var stateError = stateCompletion.error;
    var state = stateCompletion.value;

    if (stateError || (IS_GENERATOR && state.done)) {
      return { exit: true, value: stateError ? Promise.reject(state) : Promise.resolve(createIterResultObject(undefined, true)) };
    } return { exit: false, value: state };
  };

  return defineBuiltIns(create(AsyncIteratorPrototype), {
    next: function next() {
      var stateCompletion = getStateOrEarlyExit(this);
      var state = stateCompletion.value;
      if (stateCompletion.exit) return state;
      var handlerCompletion = perform(function () {
        return anObject(state.nextHandler(Promise));
      });
      var handlerError = handlerCompletion.error;
      var value = handlerCompletion.value;
      if (handlerError) {
        state.done = true;
        if (IS_GENERATOR) cleanupState(state);
        return Promise.reject(value);
      }
      return IS_GENERATOR ? Promise.resolve(value).then(function (result) {
        if (state.done) cleanupState(state);
        return result;
      }, function (error) {
        cleanupState(state);
        throw error;
      }) : Promise.resolve(value);
    },
    'return': function () {
      var stateCompletion = getStateOrEarlyExit(this);
      var state = stateCompletion.value;
      if (stateCompletion.exit) return state;
      state.done = true;
      var iterator = state.iterator;
      var inner = state.inner;
      if (IS_GENERATOR) cleanupState(state);
      var returnMethod, result;
      var closeOuterIterator = function () {
        var completion = perform(function () {
          return getMethod(iterator, 'return');
        });
        returnMethod = result = completion.value;
        if (completion.error) return Promise.reject(result);
        if (returnMethod === undefined) return Promise.resolve(createIterResultObject(undefined, true));
        completion = perform(function () {
          return call(returnMethod, iterator);
        });
        result = completion.value;
        if (completion.error) return Promise.reject(result);
        return IS_ITERATOR ? Promise.resolve(result) : Promise.resolve(result).then(function (resolved) {
          anObject(resolved);
          return createIterResultObject(undefined, true);
        });
      };

      var closeAndReject = function (error) {
        return closeOuterIterator().then(function () {
          throw error;
        }, function () {
          throw error;
        });
      };

      if (inner) {
        var innerIterator = inner.iterator;
        var innerReturn;
        var completion = perform(function () {
          innerReturn = getMethod(innerIterator, 'return');
          if (innerReturn) return call(innerReturn, innerIterator);
        });
        if (completion.error) return closeAndReject(completion.value);
        if (innerReturn) {
          return Promise.resolve(completion.value).then(function (innerResult) {
            try {
              anObject(innerResult);
            } catch (error) {
              return closeAndReject(error);
            }
            return closeOuterIterator();
          }, closeAndReject);
        }
      }

      return closeOuterIterator();
    }
  });
};

var WrapForValidAsyncIteratorPrototype = createAsyncIteratorProxyPrototype(true);
var AsyncIteratorHelperPrototype = createAsyncIteratorProxyPrototype(false);

createNonEnumerableProperty(AsyncIteratorHelperPrototype, TO_STRING_TAG, 'Async Iterator Helper');

module.exports = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState(this, state);
  };

  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

  return AsyncIteratorProxy;
};

},{"../internals/an-object":81,"../internals/async-iterator-prototype":84,"../internals/create-iter-result-object":90,"../internals/create-non-enumerable-property":91,"../internals/define-built-ins":96,"../internals/function-call":108,"../internals/get-built-in":113,"../internals/get-method":117,"../internals/internal-state":126,"../internals/iterator-cleanup-state":139,"../internals/object-create":154,"../internals/perform":168,"../internals/well-known-symbol":207}],84:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var shared = require('../internals/shared-store');
var isCallable = require('../internals/is-callable');
var create = require('../internals/object-create');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');
var AsyncIterator = globalThis.AsyncIterator;
var PassedAsyncIteratorPrototype = shared.AsyncIteratorPrototype;
var AsyncIteratorPrototype, prototype;

if (PassedAsyncIteratorPrototype) {
  AsyncIteratorPrototype = PassedAsyncIteratorPrototype;
} else if (isCallable(AsyncIterator)) {
  AsyncIteratorPrototype = AsyncIterator.prototype;
} else if (shared[USE_FUNCTION_CONSTRUCTOR] || globalThis[USE_FUNCTION_CONSTRUCTOR]) {
  try {
    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
    prototype = getPrototypeOf(getPrototypeOf(getPrototypeOf(Function('return async function*(){}()')())));
    if (getPrototypeOf(prototype) === Object.prototype) AsyncIteratorPrototype = prototype;
  } catch (error) { /* empty */ }
}

if (!AsyncIteratorPrototype) AsyncIteratorPrototype = {};
else if (IS_PURE) AsyncIteratorPrototype = create(AsyncIteratorPrototype);

if (!isCallable(AsyncIteratorPrototype[ASYNC_ITERATOR])) {
  defineBuiltIn(AsyncIteratorPrototype, ASYNC_ITERATOR, function () {
    return this;
  });
}

module.exports = AsyncIteratorPrototype;

},{"../internals/define-built-in":95,"../internals/global-this":119,"../internals/is-callable":129,"../internals/is-pure":134,"../internals/object-create":154,"../internals/object-get-prototype-of":160,"../internals/shared-store":185,"../internals/well-known-symbol":207}],85:[function(require,module,exports){
'use strict';
var anObject = require('../internals/an-object');
var iteratorClose = require('../internals/iterator-close');

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

},{"../internals/an-object":81,"../internals/iterator-close":141}],86:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};

},{"../internals/function-uncurry-this":112}],87:[function(require,module,exports){
'use strict';
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var isCallable = require('../internals/is-callable');
var classofRaw = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};

},{"../internals/classof-raw":86,"../internals/is-callable":129,"../internals/to-string-tag-support":198,"../internals/well-known-symbol":207}],88:[function(require,module,exports){
'use strict';
var hasOwn = require('../internals/has-own-property');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

},{"../internals/has-own-property":120,"../internals/object-define-property":156,"../internals/object-get-own-property-descriptor":157,"../internals/own-keys":166}],89:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

},{"../internals/fails":104}],90:[function(require,module,exports){
'use strict';
// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
module.exports = function (value, done) {
  return { value: value, done: done };
};

},{}],91:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":92,"../internals/descriptors":98,"../internals/object-define-property":156}],92:[function(require,module,exports){
'use strict';
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],93:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, key, value) {
  if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
  else object[key] = value;
};

},{"../internals/create-property-descriptor":92,"../internals/descriptors":98,"../internals/object-define-property":156}],94:[function(require,module,exports){
'use strict';
var makeBuiltIn = require('../internals/make-built-in');
var defineProperty = require('../internals/object-define-property');

module.exports = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
  return defineProperty.f(target, name, descriptor);
};

},{"../internals/make-built-in":148,"../internals/object-define-property":156}],95:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var definePropertyModule = require('../internals/object-define-property');
var makeBuiltIn = require('../internals/make-built-in');
var defineGlobalProperty = require('../internals/define-global-property');

module.exports = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

},{"../internals/define-global-property":97,"../internals/is-callable":129,"../internals/make-built-in":148,"../internals/object-define-property":156}],96:[function(require,module,exports){
'use strict';
var defineBuiltIn = require('../internals/define-built-in');

module.exports = function (target, src, options) {
  for (var key in src) defineBuiltIn(target, key, src[key], options);
  return target;
};

},{"../internals/define-built-in":95}],97:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(globalThis, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    globalThis[key] = value;
  } return value;
};

},{"../internals/global-this":119}],98:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

},{"../internals/fails":104}],99:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var isObject = require('../internals/is-object');

var document = globalThis.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};

},{"../internals/global-this":119,"../internals/is-object":133}],100:[function(require,module,exports){
'use strict';
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],101:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');

var navigator = globalThis.navigator;
var userAgent = navigator && navigator.userAgent;

module.exports = userAgent ? String(userAgent) : '';

},{"../internals/global-this":119}],102:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var userAgent = require('../internals/environment-user-agent');

var process = globalThis.process;
var Deno = globalThis.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;

},{"../internals/environment-user-agent":101,"../internals/global-this":119}],103:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIn = require('../internals/define-built-in');
var defineGlobalProperty = require('../internals/define-global-property');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isForced = require('../internals/is-forced');

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = globalThis;
  } else if (STATIC) {
    target = globalThis[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = globalThis[TARGET] && globalThis[TARGET].prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};

},{"../internals/copy-constructor-properties":88,"../internals/create-non-enumerable-property":91,"../internals/define-built-in":95,"../internals/define-global-property":97,"../internals/global-this":119,"../internals/is-forced":130,"../internals/object-get-own-property-descriptor":157}],104:[function(require,module,exports){
'use strict';
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

},{}],105:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var apply = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-function-prototype-bind, es/no-reflect -- safe
module.exports = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
  return call.apply(apply, arguments);
});

},{"../internals/function-bind-native":107}],106:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this-clause');
var aCallable = require('../internals/a-callable');
var NATIVE_BIND = require('../internals/function-bind-native');

var bind = uncurryThis(uncurryThis.bind);

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"../internals/a-callable":74,"../internals/function-bind-native":107,"../internals/function-uncurry-this-clause":111}],107:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = function () { /* empty */ }.bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

},{"../internals/fails":104}],108:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var call = Function.prototype.call;
// eslint-disable-next-line es/no-function-prototype-bind -- safe
module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};

},{"../internals/function-bind-native":107}],109:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var hasOwn = require('../internals/has-own-property');

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && function something() { /* empty */ }.name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

},{"../internals/descriptors":98,"../internals/has-own-property":120}],110:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');

module.exports = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

},{"../internals/a-callable":74,"../internals/function-uncurry-this":112}],111:[function(require,module,exports){
'use strict';
var classofRaw = require('../internals/classof-raw');
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
};

},{"../internals/classof-raw":86,"../internals/function-uncurry-this":112}],112:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
// eslint-disable-next-line es/no-function-prototype-bind -- safe
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};

},{"../internals/function-bind-native":107}],113:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var isCallable = require('../internals/is-callable');

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(globalThis[namespace]) : globalThis[namespace] && globalThis[namespace][method];
};

},{"../internals/global-this":119,"../internals/is-callable":129}],114:[function(require,module,exports){
'use strict';
// `GetIteratorDirect(obj)` abstract operation
// https://tc39.es/ecma262/#sec-getiteratordirect
module.exports = function (obj) {
  return {
    iterator: obj,
    next: obj.next,
    done: false
  };
};

},{}],115:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var getIteratorMethod = require('../internals/get-iterator-method-internal');

var $TypeError = TypeError;

module.exports = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (isCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
  throw new $TypeError(tryToString(argument) + ' is not iterable');
};

},{"../internals/an-object":81,"../internals/function-call":108,"../internals/get-iterator-method-internal":116,"../internals/is-callable":129,"../internals/try-to-string":200}],116:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof-raw');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var getMethod = require('../internals/get-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
    || getMethod(it, '@@iterator')
    || (classof(it) === 'Arguments' ? ArrayPrototype[ITERATOR] : undefined);
};

},{"../internals/classof-raw":86,"../internals/get-method":117,"../internals/is-null-or-undefined":132,"../internals/well-known-symbol":207}],117:[function(require,module,exports){
'use strict';
var aCallable = require('../internals/a-callable');
var isNullOrUndefined = require('../internals/is-null-or-undefined');

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};

},{"../internals/a-callable":74,"../internals/is-null-or-undefined":132}],118:[function(require,module,exports){
'use strict';
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var call = require('../internals/function-call');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var getIteratorDirect = require('../internals/get-iterator-direct');

var INVALID_SIZE = 'Invalid size';
var $RangeError = RangeError;
var $TypeError = TypeError;
var max = Math.max;

var SetRecord = function (set, intSize) {
  this.set = set;
  this.size = max(intSize, 0);
  this.has = aCallable(set.has);
  this.keys = aCallable(set.keys);
};

SetRecord.prototype = {
  getIterator: function () {
    return getIteratorDirect(anObject(call(this.keys, this.set)));
  },
  includes: function (it) {
    return call(this.has, this.set, it);
  }
};

// `GetSetRecord` abstract operation
// https://tc39.es/proposal-set-methods/#sec-getsetrecord
module.exports = function (obj) {
  anObject(obj);
  var numSize = +obj.size;
  // NOTE: If size is undefined, then numSize will be NaN
  // eslint-disable-next-line no-self-compare -- NaN check
  if (numSize !== numSize) throw new $TypeError(INVALID_SIZE);
  var intSize = toIntegerOrInfinity(numSize);
  if (intSize < 0) throw new $RangeError(INVALID_SIZE);
  return new SetRecord(obj, intSize);
};

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/to-integer-or-infinity":191}],119:[function(require,module,exports){
(function (global){(function (){
'use strict';
var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  check(typeof this == 'object' && this) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],120:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

},{"../internals/function-uncurry-this":112,"../internals/to-object":193}],121:[function(require,module,exports){
'use strict';
module.exports = {};

},{}],122:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');

module.exports = getBuiltIn('document', 'documentElement');

},{"../internals/get-built-in":113}],123:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var createElement = require('../internals/document-create-element');

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

},{"../internals/descriptors":98,"../internals/document-create-element":99,"../internals/fails":104}],124:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;

},{"../internals/classof-raw":86,"../internals/fails":104,"../internals/function-uncurry-this":112}],125:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var store = require('../internals/shared-store');

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;

},{"../internals/function-uncurry-this":112,"../internals/is-callable":129,"../internals/shared-store":185}],126:[function(require,module,exports){
'use strict';
var NATIVE_WEAK_MAP = require('../internals/weak-map-basic-detection');
var globalThis = require('../internals/global-this');
var isObject = require('../internals/is-object');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');
var shared = require('../internals/shared-store');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = globalThis.TypeError;
var WeakMap = globalThis.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/create-non-enumerable-property":91,"../internals/global-this":119,"../internals/has-own-property":120,"../internals/hidden-keys":121,"../internals/is-object":133,"../internals/shared-key":184,"../internals/shared-store":185,"../internals/weak-map-basic-detection":204}],127:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

},{"../internals/iterators":146,"../internals/well-known-symbol":207}],128:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof-raw');

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};

},{"../internals/classof-raw":86}],129:[function(require,module,exports){
'use strict';
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
module.exports = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

},{}],130:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":104,"../internals/is-callable":129}],131:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  return it[ITERATOR] !== undefined
    || it['@@iterator'] !== undefined
    || classof(it) === 'Arguments';
};

},{"../internals/classof-raw":86,"../internals/well-known-symbol":207}],132:[function(require,module,exports){
'use strict';
// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};

},{}],133:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');

module.exports = function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};

},{"../internals/is-callable":129}],134:[function(require,module,exports){
'use strict';
module.exports = false;

},{}],135:[function(require,module,exports){
'use strict';
var isObject = require('../internals/is-object');
var getInternalState = require('../internals/internal-state').get;

module.exports = function isRawJSON(O) {
  if (!isObject(O)) return false;
  var state = getInternalState(O);
  return !!state && state.type === 'RawJSON';
};

},{"../internals/internal-state":126,"../internals/is-object":133}],136:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};

},{"../internals/get-built-in":113,"../internals/is-callable":129,"../internals/object-is-prototype-of":161,"../internals/use-symbol-as-uid":202}],137:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');

module.exports = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
  var next = record.next;
  var step, result;
  while (!(step = call(next, iterator)).done) {
    result = fn(step.value);
    if (result !== undefined) return result;
  }
};

},{"../internals/function-call":108}],138:[function(require,module,exports){
'use strict';
var bind = require('../internals/function-bind-context');
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var getIterator = require('../internals/get-iterator-internal');
var getIteratorMethod = require('../internals/get-iterator-method-internal');
var iteratorClose = require('../internals/iterator-close');

var $TypeError = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

module.exports = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    var $iterator = iterator;
    iterator = undefined;
    if ($iterator) iteratorClose($iterator, 'normal');
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (!iterFn) throw new $TypeError(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = call(next, iterator)).done) {
    // `IteratorValue` errors should propagate without closing the iterator
    var value = step.value;
    try {
      result = callFn(value);
    } catch (error) {
      if (iterator) iteratorClose(iterator, 'throw', error);
      else throw error;
    }
    if (typeof result == 'object' && result && isPrototypeOf(ResultPrototype, result)) return result;
  } return new Result(false);
};

},{"../internals/an-object":81,"../internals/function-bind-context":106,"../internals/function-call":108,"../internals/get-iterator-internal":115,"../internals/get-iterator-method-internal":116,"../internals/is-array-iterator-method":127,"../internals/iterator-close":141,"../internals/length-of-array-like":147,"../internals/object-is-prototype-of":161,"../internals/try-to-string":200}],139:[function(require,module,exports){
'use strict';
// release references held by exhausted / closed iterator helpers to allow GC of the source chain
module.exports = function (state) {
  state.iterator = state.next = state.nextHandler = state.mapper = state.predicate = state.inner =
    state.iterables = state.iters = state.openIters = state.padding = state.finishResults = state.buffer = null;
};

},{}],140:[function(require,module,exports){
'use strict';
var iteratorClose = require('../internals/iterator-close');

module.exports = function (iters, kind, value) {
  for (var i = iters.length - 1; i >= 0; i--) {
    if (iters[i] === undefined) continue;
    try {
      value = iteratorClose(iters[i].iterator, kind, value);
    } catch (error) {
      kind = 'throw';
      value = error;
    }
  }
  if (kind === 'throw') throw value;
  return value;
};

},{"../internals/iterator-close":141}],141:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getMethod = require('../internals/get-method');

module.exports = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};

},{"../internals/an-object":81,"../internals/function-call":108,"../internals/get-method":117}],142:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var create = require('../internals/object-create');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIns = require('../internals/define-built-ins');
var wellKnownSymbol = require('../internals/well-known-symbol');
var InternalStateModule = require('../internals/internal-state');
var getMethod = require('../internals/get-method');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var createIterResultObject = require('../internals/create-iter-result-object');
var iteratorClose = require('../internals/iterator-close');
var iteratorCloseAll = require('../internals/iterator-close-all');
var cleanupState = require('../internals/iterator-cleanup-state');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ITERATOR_HELPER = 'IteratorHelper';
var WRAP_FOR_VALID_ITERATOR = 'WrapForValidIterator';
var NORMAL = 'normal';
var THROW = 'throw';
var setInternalState = InternalStateModule.set;

var createIteratorProxyPrototype = function (IS_ITERATOR) {
  var getInternalState = InternalStateModule.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER);

  return defineBuiltIns(create(IteratorPrototype), {
    next: function next() {
      var state = getInternalState(this);
      // for simplification:
      //   for `%WrapForValidIteratorPrototype%.next` or with `state.returnHandlerResult` our `nextHandler` returns `IterResultObject`
      //   for `%IteratorHelperPrototype%.next` - just a value
      if (IS_ITERATOR) return state.nextHandler();
      if (state.done) return createIterResultObject(undefined, true);
      try {
        var result = state.nextHandler();
        if (state.done) cleanupState(state);
        return state.returnHandlerResult ? result : createIterResultObject(result, state.done);
      } catch (error) {
        state.done = true;
        cleanupState(state);
        throw error;
      }
    },
    'return': function () {
      var state = getInternalState(this);
      var iterator = state.iterator;
      var inner = state.inner;
      var openIters = state.openIters;
      var done = state.done;
      state.done = true;
      if (IS_ITERATOR) {
        var returnMethod = getMethod(iterator, 'return');
        return returnMethod ? call(returnMethod, iterator) : createIterResultObject(undefined, true);
      }
      cleanupState(state);
      if (done) return createIterResultObject(undefined, true);
      if (inner) try {
        iteratorClose(inner.iterator, NORMAL);
      } catch (error) {
        return iteratorClose(iterator, THROW, error);
      }
      if (openIters) try {
        iteratorCloseAll(openIters, NORMAL);
      } catch (error) {
        if (iterator) return iteratorClose(iterator, THROW, error);
        throw error;
      }
      if (iterator) iteratorClose(iterator, NORMAL);
      return createIterResultObject(undefined, true);
    }
  });
};

var WrapForValidIteratorPrototype = createIteratorProxyPrototype(true);
var IteratorHelperPrototype = createIteratorProxyPrototype(false);

createNonEnumerableProperty(IteratorHelperPrototype, TO_STRING_TAG, 'Iterator Helper');

module.exports = function (nextHandler, IS_ITERATOR, RETURN_HANDLER_RESULT) {
  var IteratorProxy = function Iterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER;
    state.returnHandlerResult = !!RETURN_HANDLER_RESULT;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState(this, state);
  };

  IteratorProxy.prototype = IS_ITERATOR ? WrapForValidIteratorPrototype : IteratorHelperPrototype;

  return IteratorProxy;
};

},{"../internals/create-iter-result-object":90,"../internals/create-non-enumerable-property":91,"../internals/define-built-ins":96,"../internals/function-call":108,"../internals/get-method":117,"../internals/internal-state":126,"../internals/iterator-cleanup-state":139,"../internals/iterator-close":141,"../internals/iterator-close-all":140,"../internals/iterators-core":145,"../internals/object-create":154,"../internals/well-known-symbol":207}],143:[function(require,module,exports){
'use strict';
// Should throw an error on invalid iterator
// https://issues.chromium.org/issues/336839115
module.exports = function (methodName, argument) {
  // eslint-disable-next-line es/no-iterator -- required for testing
  var method = typeof Iterator == 'function' && Iterator.prototype[methodName];
  if (method) try {
    method.call({ next: null }, argument).next();
  } catch (error) {
    return true;
  }
};

},{}],144:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');

// https://github.com/tc39/ecma262/pull/3467
module.exports = function (METHOD_NAME, ExpectedError) {
  var Iterator = globalThis.Iterator;
  var IteratorPrototype = Iterator && Iterator.prototype;
  var method = IteratorPrototype && IteratorPrototype[METHOD_NAME];

  var CLOSED = false;

  if (method) try {
    method.call({
      next: function () { return { done: true }; },
      'return': function () { CLOSED = true; }
    }, -1);
  } catch (error) {
    // https://bugs.webkit.org/show_bug.cgi?id=291195
    if (!(error instanceof ExpectedError)) CLOSED = false;
  }

  if (!CLOSED) return method;
};

},{"../internals/global-this":119}],145:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');
var create = require('../internals/object-create');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR])) {
  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

},{"../internals/define-built-in":95,"../internals/fails":104,"../internals/is-callable":129,"../internals/is-object":133,"../internals/is-pure":134,"../internals/object-create":154,"../internals/object-get-prototype-of":160,"../internals/well-known-symbol":207}],146:[function(require,module,exports){
'use strict';
module.exports = Object.create ? Object.create(null) : {};

},{}],147:[function(require,module,exports){
'use strict';
var toLength = require('../internals/to-length');

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};

},{"../internals/to-length":192}],148:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var hasOwn = require('../internals/has-own-property');
var DESCRIPTORS = require('../internals/descriptors');
var CONFIGURABLE_FUNCTION_NAME = require('../internals/function-name').CONFIGURABLE;
var inspectSource = require('../internals/inspect-source');
var InternalStateModule = require('../internals/internal-state');

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis(''.slice);
var replace = uncurryThis(''.replace);
var join = uncurryThis([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');

},{"../internals/descriptors":98,"../internals/fails":104,"../internals/function-name":109,"../internals/function-uncurry-this":112,"../internals/has-own-property":120,"../internals/inspect-source":125,"../internals/internal-state":126,"../internals/is-callable":129}],149:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-map -- safe
var MapPrototype = Map.prototype;

module.exports = {
  // eslint-disable-next-line es/no-map -- safe
  Map: Map,
  set: uncurryThis(MapPrototype.set),
  get: uncurryThis(MapPrototype.get),
  has: uncurryThis(MapPrototype.has),
  remove: uncurryThis(MapPrototype['delete']),
  proto: MapPrototype
};

},{"../internals/function-uncurry-this":112}],150:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var iterateSimple = require('../internals/iterate-simple');
var MapHelpers = require('../internals/map-helpers');

var Map = MapHelpers.Map;
var MapPrototype = MapHelpers.proto;
var forEach = uncurryThis(MapPrototype.forEach);
var entries = uncurryThis(MapPrototype.entries);
var next = entries(new Map()).next;

module.exports = function (map, fn, interruptible) {
  return interruptible ? iterateSimple({ iterator: entries(map), next: next }, function (entry) {
    return fn(entry[1], entry[0]);
  }) : forEach(map, fn);
};

},{"../internals/function-uncurry-this":112,"../internals/iterate-simple":137,"../internals/map-helpers":149}],151:[function(require,module,exports){
'use strict';
var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};

},{}],152:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-json -- safe */
var fails = require('../internals/fails');

module.exports = !fails(function () {
  var unsafeInt = '9007199254740993';
  // eslint-disable-next-line es/no-json-rawjson -- feature detection
  var raw = JSON.rawJSON(unsafeInt);
  // eslint-disable-next-line es/no-json-israwjson -- feature detection
  return !JSON.isRawJSON(raw) || JSON.stringify(raw) !== unsafeInt;
});

},{"../internals/fails":104}],153:[function(require,module,exports){
'use strict';
var $RangeError = RangeError;

module.exports = function (it) {
  // eslint-disable-next-line no-self-compare -- NaN check
  if (it === it) return it;
  throw new $RangeError('NaN is not allowed');
};

},{}],154:[function(require,module,exports){
'use strict';
/* global ActiveXObject -- old IE, WSH */
var anObject = require('../internals/an-object');
var definePropertiesModule = require('../internals/object-define-properties');
var enumBugKeys = require('../internals/enum-bug-keys');
var hiddenKeys = require('../internals/hidden-keys');
var html = require('../internals/html');
var documentCreateElement = require('../internals/document-create-element');
var sharedKey = require('../internals/shared-key');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  // eslint-disable-next-line no-useless-assignment -- avoid memory leak
  activeXDocument = null;
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};

},{"../internals/an-object":81,"../internals/document-create-element":99,"../internals/enum-bug-keys":100,"../internals/hidden-keys":121,"../internals/html":122,"../internals/object-define-properties":155,"../internals/shared-key":184}],155:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var toIndexedObject = require('../internals/to-indexed-object');
var objectKeys = require('../internals/object-keys');

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};

},{"../internals/an-object":81,"../internals/descriptors":98,"../internals/object-define-property":156,"../internals/object-keys":163,"../internals/to-indexed-object":190,"../internals/v8-prototype-define-bug":203}],156:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var anObject = require('../internals/an-object');
var toPropertyKey = require('../internals/to-property-key');

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":81,"../internals/descriptors":98,"../internals/ie8-dom-define":123,"../internals/to-property-key":196,"../internals/v8-prototype-define-bug":203}],157:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var call = require('../internals/function-call');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPropertyKey = require('../internals/to-property-key');
var hasOwn = require('../internals/has-own-property');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};

},{"../internals/create-property-descriptor":92,"../internals/descriptors":98,"../internals/function-call":108,"../internals/has-own-property":120,"../internals/ie8-dom-define":123,"../internals/object-property-is-enumerable":164,"../internals/to-indexed-object":190,"../internals/to-property-key":196}],158:[function(require,module,exports){
'use strict';
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":100,"../internals/object-keys-internal":162}],159:[function(require,module,exports){
'use strict';
// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;

},{}],160:[function(require,module,exports){
'use strict';
var hasOwn = require('../internals/has-own-property');
var isCallable = require('../internals/is-callable');
var toObject = require('../internals/to-object');
var sharedKey = require('../internals/shared-key');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

var IE_PROTO = sharedKey('IE_PROTO');
var $Object = Object;
var ObjectPrototype = $Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object ? ObjectPrototype : null;
};

},{"../internals/correct-prototype-getter":89,"../internals/has-own-property":120,"../internals/is-callable":129,"../internals/shared-key":184,"../internals/to-object":193}],161:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = uncurryThis({}.isPrototypeOf);

},{"../internals/function-uncurry-this":112}],162:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var hasOwn = require('../internals/has-own-property');
var toIndexedObject = require('../internals/to-indexed-object');
var indexOf = require('../internals/array-includes').indexOf;
var hiddenKeys = require('../internals/hidden-keys');

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};

},{"../internals/array-includes":82,"../internals/function-uncurry-this":112,"../internals/has-own-property":120,"../internals/hidden-keys":121,"../internals/to-indexed-object":190}],163:[function(require,module,exports){
'use strict';
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};

},{"../internals/enum-bug-keys":100,"../internals/object-keys-internal":162}],164:[function(require,module,exports){
'use strict';
var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

},{}],165:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw new $TypeError("Can't convert object to primitive value");
};

},{"../internals/function-call":108,"../internals/is-callable":129,"../internals/is-object":133}],166:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":81,"../internals/function-uncurry-this":112,"../internals/get-built-in":113,"../internals/object-get-own-property-names":158,"../internals/object-get-own-property-symbols":159}],167:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var hasOwn = require('../internals/has-own-property');

var $SyntaxError = SyntaxError;
var $parseInt = parseInt;
var fromCharCode = String.fromCharCode;
var at = uncurryThis(''.charAt);
var slice = uncurryThis(''.slice);
var exec = uncurryThis(/./.exec);

var codePoints = {
  '\\"': '"',
  '\\\\': '\\',
  '\\/': '/',
  '\\b': '\b',
  '\\f': '\f',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t'
};

var IS_4_HEX_DIGITS = /^[\da-f]{4}$/i;
// eslint-disable-next-line regexp/no-control-character -- safe
var IS_C0_CONTROL_CODE = /^[\u0000-\u001F]$/;

module.exports = function (source, i) {
  var unterminated = true;
  var value = '';
  while (i < source.length) {
    var chr = at(source, i);
    if (chr === '\\') {
      var twoChars = slice(source, i, i + 2);
      if (hasOwn(codePoints, twoChars)) {
        value += codePoints[twoChars];
        i += 2;
      } else if (twoChars === '\\u') {
        i += 2;
        var fourHexDigits = slice(source, i, i + 4);
        if (!exec(IS_4_HEX_DIGITS, fourHexDigits)) throw new $SyntaxError('Bad Unicode escape at: ' + i);
        value += fromCharCode($parseInt(fourHexDigits, 16));
        i += 4;
      } else throw new $SyntaxError('Unknown escape sequence: "' + twoChars + '"');
    } else if (chr === '"') {
      unterminated = false;
      i++;
      break;
    } else {
      if (exec(IS_C0_CONTROL_CODE, chr)) throw new $SyntaxError('Bad control character in string literal at: ' + i);
      value += chr;
      i++;
    }
  }
  if (unterminated) throw new $SyntaxError('Unterminated string at: ' + i);
  return { value: value, end: i };
};

},{"../internals/function-uncurry-this":112,"../internals/has-own-property":120}],168:[function(require,module,exports){
'use strict';
module.exports = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

},{}],169:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var fails = require('../internals/fails');

// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
var RegExp = globalThis.RegExp;

var FLAGS_GETTER_IS_CORRECT = !fails(function () {
  var INDICES_SUPPORT = true;
  try {
    RegExp('.', 'd');
  } catch (error) {
    INDICES_SUPPORT = false;
  }

  var O = {};
  // modern V8 bug
  var calls = '';
  var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

  var addGetter = function (key, chr) {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty(O, key, { get: function () {
      calls += chr;
      return true;
    } });
  };

  var pairs = {
    dotAll: 's',
    global: 'g',
    ignoreCase: 'i',
    multiline: 'm',
    sticky: 'y'
  };

  if (INDICES_SUPPORT) pairs.hasIndices = 'd';

  for (var key in pairs) addGetter(key, pairs[key]);

  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  var result = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(O);

  return result !== expected || calls !== expected;
});

module.exports = { correct: FLAGS_GETTER_IS_CORRECT };

},{"../internals/fails":104,"../internals/global-this":119}],170:[function(require,module,exports){
'use strict';
var anObject = require('../internals/an-object');

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.hasIndices) result += 'd';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.unicodeSets) result += 'v';
  if (that.sticky) result += 'y';
  return result;
};

},{"../internals/an-object":81}],171:[function(require,module,exports){
'use strict';
var isNullOrUndefined = require('../internals/is-null-or-undefined');

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};

},{"../internals/is-null-or-undefined":132}],172:[function(require,module,exports){
'use strict';
// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
module.exports = function (x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y || x !== x && y !== y;
};

},{}],173:[function(require,module,exports){
'use strict';
var SetHelpers = require('../internals/set-helpers');
var iterate = require('../internals/set-iterate');

var Set = SetHelpers.Set;
var add = SetHelpers.add;

module.exports = function (set) {
  var result = new Set();
  iterate(set, function (it) {
    add(result, it);
  });
  return result;
};

},{"../internals/set-helpers":175,"../internals/set-iterate":180}],174:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var clone = require('../internals/set-clone');
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');

var has = SetHelpers.has;
var remove = SetHelpers.remove;

// `Set.prototype.difference` method
// https://tc39.es/ecma262/#sec-set.prototype.difference
module.exports = function difference(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  var result = clone(O);
  if (size(result) <= otherRec.size) iterateSet(result, function (e) {
    if (otherRec.includes(e)) remove(result, e);
  });
  else iterateSimple(otherRec.getIterator(), function (e) {
    if (has(result, e)) remove(result, e);
  });
  return result;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/iterate-simple":137,"../internals/set-clone":173,"../internals/set-helpers":175,"../internals/set-iterate":180,"../internals/set-size":181}],175:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-set -- safe
var SetPrototype = Set.prototype;

module.exports = {
  // eslint-disable-next-line es/no-set -- safe
  Set: Set,
  add: uncurryThis(SetPrototype.add),
  has: uncurryThis(SetPrototype.has),
  remove: uncurryThis(SetPrototype['delete']),
  proto: SetPrototype
};

},{"../internals/function-uncurry-this":112}],176:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');

var Set = SetHelpers.Set;
var add = SetHelpers.add;
var has = SetHelpers.has;

// `Set.prototype.intersection` method
// https://tc39.es/ecma262/#sec-set.prototype.intersection
module.exports = function intersection(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  var result = new Set();

  if (size(O) > otherRec.size) {
    iterateSimple(otherRec.getIterator(), function (e) {
      if (has(O, e)) add(result, e);
    });
  } else {
    iterateSet(O, function (e) {
      if (otherRec.includes(e)) add(result, e);
    });
  }

  return result;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/iterate-simple":137,"../internals/set-helpers":175,"../internals/set-iterate":180,"../internals/set-size":181}],177:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var has = require('../internals/set-helpers').has;
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSet = require('../internals/set-iterate');
var iterateSimple = require('../internals/iterate-simple');
var iteratorClose = require('../internals/iterator-close');

// `Set.prototype.isDisjointFrom` method
// https://tc39.es/ecma262/#sec-set.prototype.isdisjointfrom
module.exports = function isDisjointFrom(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  if (size(O) <= otherRec.size) return iterateSet(O, function (e) {
    if (otherRec.includes(e)) return false;
  }, true) !== false;
  var iterator = otherRec.getIterator();
  return iterateSimple(iterator, function (e) {
    if (has(O, e)) return iteratorClose(iterator.iterator, 'normal', false);
  }) !== false;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/iterate-simple":137,"../internals/iterator-close":141,"../internals/set-helpers":175,"../internals/set-iterate":180,"../internals/set-size":181}],178:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var size = require('../internals/set-size');
var iterate = require('../internals/set-iterate');
var getSetRecord = require('../internals/get-set-record');

// `Set.prototype.isSubsetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issubsetof
module.exports = function isSubsetOf(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  if (size(O) > otherRec.size) return false;
  return iterate(O, function (e) {
    if (!otherRec.includes(e)) return false;
  }, true) !== false;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/set-iterate":180,"../internals/set-size":181}],179:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var has = require('../internals/set-helpers').has;
var size = require('../internals/set-size');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');
var iteratorClose = require('../internals/iterator-close');

// `Set.prototype.isSupersetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issupersetof
module.exports = function isSupersetOf(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  if (size(O) < otherRec.size) return false;
  var iterator = otherRec.getIterator();
  return iterateSimple(iterator, function (e) {
    if (!has(O, e)) return iteratorClose(iterator.iterator, 'normal', false);
  }) !== false;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/iterate-simple":137,"../internals/iterator-close":141,"../internals/set-helpers":175,"../internals/set-size":181}],180:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var iterateSimple = require('../internals/iterate-simple');
var SetHelpers = require('../internals/set-helpers');

var Set = SetHelpers.Set;
var SetPrototype = SetHelpers.proto;
var forEach = uncurryThis(SetPrototype.forEach);
var keys = uncurryThis(SetPrototype.keys);
var next = keys(new Set()).next;

module.exports = function (set, fn, interruptible) {
  return interruptible ? iterateSimple({ iterator: keys(set), next: next }, fn) : forEach(set, fn);
};

},{"../internals/function-uncurry-this":112,"../internals/iterate-simple":137,"../internals/set-helpers":175}],181:[function(require,module,exports){
'use strict';
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var SetHelpers = require('../internals/set-helpers');

module.exports = uncurryThisAccessor(SetHelpers.proto, 'size', 'get') || function (set) {
  return set.size;
};

},{"../internals/function-uncurry-this-accessor":110,"../internals/set-helpers":175}],182:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var clone = require('../internals/set-clone');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');

var add = SetHelpers.add;
var has = SetHelpers.has;
var remove = SetHelpers.remove;

// `Set.prototype.symmetricDifference` method
// https://tc39.es/ecma262/#sec-set.prototype.symmetricdifference
module.exports = function symmetricDifference(other) {
  var O = aSet(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple(keysIter, function (e) {
    if (has(O, e)) remove(result, e);
    else add(result, e);
  });
  return result;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/iterate-simple":137,"../internals/set-clone":173,"../internals/set-helpers":175}],183:[function(require,module,exports){
'use strict';
var aSet = require('../internals/a-set');
var add = require('../internals/set-helpers').add;
var clone = require('../internals/set-clone');
var getSetRecord = require('../internals/get-set-record');
var iterateSimple = require('../internals/iterate-simple');

// `Set.prototype.union` method
// https://tc39.es/ecma262/#sec-set.prototype.union
module.exports = function union(other) {
  var O = aSet(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple(keysIter, function (it) {
    add(result, it);
  });
  return result;
};

},{"../internals/a-set":76,"../internals/get-set-record":118,"../internals/iterate-simple":137,"../internals/set-clone":173,"../internals/set-helpers":175}],184:[function(require,module,exports){
'use strict';
var shared = require('../internals/shared');
var uid = require('../internals/uid');

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

},{"../internals/shared":186,"../internals/uid":201}],185:[function(require,module,exports){
'use strict';
var IS_PURE = require('../internals/is-pure');
var globalThis = require('../internals/global-this');
var defineGlobalProperty = require('../internals/define-global-property');

var SHARED = '__core-js_shared__';
var store = module.exports = globalThis[SHARED] || defineGlobalProperty(SHARED, {});

(store.versions || (store.versions = [])).push({
  version: '3.51.0',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.',
  license: 'https://github.com/zloirock/core-js/blob/v3.51.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

},{"../internals/define-global-property":97,"../internals/global-this":119,"../internals/is-pure":134}],186:[function(require,module,exports){
'use strict';
var store = require('../internals/shared-store');
// eslint-disable-next-line es/no-object-create -- safe
var create = Object.create || Object;

module.exports = function (key, value) {
  return store[key] || (store[key] = value || create(null));
};

},{"../internals/shared-store":185}],187:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = require('../internals/environment-v8-version');
var fails = require('../internals/fails');
var globalThis = require('../internals/global-this');

var $String = globalThis.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});

},{"../internals/environment-v8-version":102,"../internals/fails":104,"../internals/global-this":119}],188:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
module.exports = uncurryThis(1.1.valueOf);

},{"../internals/function-uncurry-this":112}],189:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer-or-infinity":191}],190:[function(require,module,exports){
'use strict';
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":124,"../internals/require-object-coercible":171}],191:[function(require,module,exports){
'use strict';
var trunc = require('../internals/math-trunc');

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};

},{"../internals/math-trunc":151}],192:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  var len = toIntegerOrInfinity(argument);
  return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

},{"../internals/to-integer-or-infinity":191}],193:[function(require,module,exports){
'use strict';
var requireObjectCoercible = require('../internals/require-object-coercible');

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};

},{"../internals/require-object-coercible":171}],194:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var $RangeError = RangeError;

module.exports = function (it) {
  var result = toIntegerOrInfinity(it);
  if (result < 0) throw new $RangeError("The argument can't be less than 0");
  return result;
};

},{"../internals/to-integer-or-infinity":191}],195:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var getMethod = require('../internals/get-method');
var ordinaryToPrimitive = require('../internals/ordinary-to-primitive');
var wellKnownSymbol = require('../internals/well-known-symbol');

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

},{"../internals/function-call":108,"../internals/get-method":117,"../internals/is-object":133,"../internals/is-symbol":136,"../internals/ordinary-to-primitive":165,"../internals/well-known-symbol":207}],196:[function(require,module,exports){
'use strict';
var toPrimitive = require('../internals/to-primitive');
var isSymbol = require('../internals/is-symbol');

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};

},{"../internals/is-symbol":136,"../internals/to-primitive":195}],197:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var isCallable = require('../internals/is-callable');
var isIterable = require('../internals/is-iterable');
var isObject = require('../internals/is-object');

var Set = getBuiltIn('Set');

var isSetLike = function (it) {
  return isObject(it)
    && typeof it.size == 'number'
    && isCallable(it.has)
    && isCallable(it.keys);
};

// fallback old -> new set methods proposal arguments
module.exports = function (it) {
  if (isSetLike(it)) return it;
  return isIterable(it) ? new Set(it) : it;
};

},{"../internals/get-built-in":113,"../internals/is-callable":129,"../internals/is-iterable":131,"../internals/is-object":133}],198:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};
// eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';

},{"../internals/well-known-symbol":207}],199:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');

var $String = String;

module.exports = function (argument) {
  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String(argument);
};

},{"../internals/classof":87}],200:[function(require,module,exports){
'use strict';
var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};

},{}],201:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.1.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};

},{"../internals/function-uncurry-this":112}],202:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

module.exports = NATIVE_SYMBOL &&
  !Symbol.sham &&
  typeof Symbol.iterator == 'symbol';

},{"../internals/symbol-constructor-detection":187}],203:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

},{"../internals/descriptors":98,"../internals/fails":104}],204:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var isCallable = require('../internals/is-callable');

var WeakMap = globalThis.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));

},{"../internals/global-this":119,"../internals/is-callable":129}],205:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-weak-map -- safe
var WeakMapPrototype = WeakMap.prototype;

module.exports = {
  // eslint-disable-next-line es/no-weak-map -- safe
  WeakMap: WeakMap,
  set: uncurryThis(WeakMapPrototype.set),
  get: uncurryThis(WeakMapPrototype.get),
  has: uncurryThis(WeakMapPrototype.has),
  remove: uncurryThis(WeakMapPrototype['delete'])
};

},{"../internals/function-uncurry-this":112}],206:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-weak-set -- safe
var WeakSetPrototype = WeakSet.prototype;

module.exports = {
  // eslint-disable-next-line es/no-weak-set -- safe
  WeakSet: WeakSet,
  add: uncurryThis(WeakSetPrototype.add),
  has: uncurryThis(WeakSetPrototype.has),
  remove: uncurryThis(WeakSetPrototype['delete'])
};

},{"../internals/function-uncurry-this":112}],207:[function(require,module,exports){
'use strict';
var globalThis = require('../internals/global-this');
var shared = require('../internals/shared');
var hasOwn = require('../internals/has-own-property');
var uid = require('../internals/uid');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var Symbol = globalThis.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

},{"../internals/global-this":119,"../internals/has-own-property":120,"../internals/shared":186,"../internals/symbol-constructor-detection":187,"../internals/uid":201,"../internals/use-symbol-as-uid":202}],208:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $includes = require('../internals/array-includes').includes;
var fails = require('../internals/fails');
var addToUnscopables = require('../internals/add-to-unscopables');

// FF99+ bug
var BROKEN_ON_SPARSE = fails(function () {
  // eslint-disable-next-line es/no-array-prototype-includes -- detection
  return !Array(1).includes();
});

// Safari 26.4- bug
var BROKEN_ON_SPARSE_WITH_FROM_INDEX = fails(function () {
  // eslint-disable-next-line no-sparse-arrays, es/no-array-prototype-includes -- detection
  return [, 1].includes(undefined, 1);
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE || BROKEN_ON_SPARSE_WITH_FROM_INDEX }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

},{"../internals/add-to-unscopables":79,"../internals/array-includes":82,"../internals/export":103,"../internals/fails":104}],209:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var anInstance = require('../internals/an-instance');
var anObject = require('../internals/an-object');
var isCallable = require('../internals/is-callable');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var createProperty = require('../internals/create-property');
var fails = require('../internals/fails');
var hasOwn = require('../internals/has-own-property');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var DESCRIPTORS = require('../internals/descriptors');
var IS_PURE = require('../internals/is-pure');

var CONSTRUCTOR = 'constructor';
var ITERATOR = 'Iterator';
var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var $TypeError = TypeError;
var NativeIterator = globalThis[ITERATOR];

// FF56- have non-standard global helper `Iterator`
var FORCED = IS_PURE
  || !isCallable(NativeIterator)
  || NativeIterator.prototype !== IteratorPrototype
  // FF44- non-standard `Iterator` passes previous tests
  || !fails(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorPrototype);
  if (getPrototypeOf(this) === IteratorPrototype) throw new $TypeError('Abstract class Iterator not directly constructable');
};

var defineIteratorPrototypeAccessor = function (key, value) {
  if (DESCRIPTORS) {
    defineBuiltInAccessor(IteratorPrototype, key, {
      configurable: true,
      get: function () {
        return value;
      },
      set: function (replacement) {
        anObject(this);
        if (this === IteratorPrototype) throw new $TypeError("You can't redefine this property");
        if (hasOwn(this, key)) this[key] = replacement;
        else createProperty(this, key, replacement);
      }
    });
  } else IteratorPrototype[key] = value;
};

if (!hasOwn(IteratorPrototype, TO_STRING_TAG)) defineIteratorPrototypeAccessor(TO_STRING_TAG, ITERATOR);

if (FORCED || !hasOwn(IteratorPrototype, CONSTRUCTOR) || IteratorPrototype[CONSTRUCTOR] === Object) {
  defineIteratorPrototypeAccessor(CONSTRUCTOR, IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype;

// `Iterator` constructor
// https://tc39.es/ecma262/#sec-iterator
$({ global: true, constructor: true, forced: FORCED }, {
  Iterator: IteratorConstructor
});

},{"../internals/an-instance":80,"../internals/an-object":81,"../internals/create-property":93,"../internals/define-built-in-accessor":94,"../internals/descriptors":98,"../internals/export":103,"../internals/fails":104,"../internals/global-this":119,"../internals/has-own-property":120,"../internals/is-callable":129,"../internals/is-pure":134,"../internals/iterators-core":145,"../internals/object-get-prototype-of":160,"../internals/well-known-symbol":207}],210:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var notANaN = require('../internals/not-a-nan');
var toPositiveInteger = require('../internals/to-positive-integer');
var iteratorClose = require('../internals/iterator-close');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var iteratorHelperThrowsOnInvalidIterator = require('../internals/iterator-helper-throws-on-invalid-iterator');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');
var IS_PURE = require('../internals/is-pure');

var $RangeError = RangeError;
var $Infinity = Infinity;

var DROP_WITHOUT_THROWING_ON_INVALID_ITERATOR = !IS_PURE && !iteratorHelperThrowsOnInvalidIterator('drop', 0);
var dropWithoutClosingOnEarlyError = !IS_PURE && !DROP_WITHOUT_THROWING_ON_INVALID_ITERATOR
  && iteratorHelperWithoutClosingOnEarlyError('drop', RangeError);

var FORCED = IS_PURE || DROP_WITHOUT_THROWING_ON_INVALID_ITERATOR || dropWithoutClosingOnEarlyError || !function () {
  try {
    // eslint-disable-next-line es/no-iterator, es/no-iterator-prototype-drop -- detection
    Iterator.prototype.drop.call({
      next: function () { return { done: true }; }
    }, 0x20000000000000);
  } catch (error) {
    return error instanceof $RangeError;
  }
}();

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject(call(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject(call(next, iterator));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

// `Iterator.prototype.drop` method
// https://tc39.es/ecma262/#sec-iterator.prototype.drop
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  drop: function drop(limit) {
    anObject(this);
    var remaining;
    try {
      remaining = toPositiveInteger(notANaN(+limit));
      if (remaining > 0x1FFFFFFFFFFFFF && remaining !== $Infinity) {
        throw new $RangeError('The argument should be a safe integer');
      }
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (dropWithoutClosingOnEarlyError) return call(dropWithoutClosingOnEarlyError, this, remaining);

    return new IteratorProxy(getIteratorDirect(this), {
      remaining: remaining
    });
  }
});

},{"../internals/an-object":81,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/is-pure":134,"../internals/iterator-close":141,"../internals/iterator-create-proxy":142,"../internals/iterator-helper-throws-on-invalid-iterator":143,"../internals/iterator-helper-without-closing-on-early-error":144,"../internals/not-a-nan":153,"../internals/to-positive-integer":194}],211:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var iterate = require('../internals/iterate');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');

var everyWithoutClosingOnEarlyError = iteratorHelperWithoutClosingOnEarlyError('every', TypeError);

// `Iterator.prototype.every` method
// https://tc39.es/ecma262/#sec-iterator.prototype.every
$({ target: 'Iterator', proto: true, real: true, forced: everyWithoutClosingOnEarlyError }, {
  every: function every(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (everyWithoutClosingOnEarlyError) return call(everyWithoutClosingOnEarlyError, this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return !iterate(record, function (value, stop) {
      if (!predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/iterate":138,"../internals/iterator-close":141,"../internals/iterator-helper-without-closing-on-early-error":144}],212:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var IS_PURE = require('../internals/is-pure');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperThrowsOnInvalidIterator = require('../internals/iterator-helper-throws-on-invalid-iterator');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');

var FILTER_WITHOUT_THROWING_ON_INVALID_ITERATOR = !IS_PURE && !iteratorHelperThrowsOnInvalidIterator('filter', function () { /* empty */ });
var filterWithoutClosingOnEarlyError = !IS_PURE && !FILTER_WITHOUT_THROWING_ON_INVALID_ITERATOR
  && iteratorHelperWithoutClosingOnEarlyError('filter', TypeError);

var FORCED = IS_PURE || FILTER_WITHOUT_THROWING_ON_INVALID_ITERATOR || filterWithoutClosingOnEarlyError;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var predicate = this.predicate;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject(call(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing(iterator, predicate, [value, this.counter++], true)) return value;
  }
});

// `Iterator.prototype.filter` method
// https://tc39.es/ecma262/#sec-iterator.prototype.filter
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  filter: function filter(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (filterWithoutClosingOnEarlyError) return call(filterWithoutClosingOnEarlyError, this, predicate);

    return new IteratorProxy(getIteratorDirect(this), {
      predicate: predicate
    });
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/call-with-safe-iteration-closing":85,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/is-pure":134,"../internals/iterator-close":141,"../internals/iterator-create-proxy":142,"../internals/iterator-helper-throws-on-invalid-iterator":143,"../internals/iterator-helper-without-closing-on-early-error":144}],213:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var iterate = require('../internals/iterate');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');

var findWithoutClosingOnEarlyError = iteratorHelperWithoutClosingOnEarlyError('find', TypeError);

// `Iterator.prototype.find` method
// https://tc39.es/ecma262/#sec-iterator.prototype.find
$({ target: 'Iterator', proto: true, real: true, forced: findWithoutClosingOnEarlyError }, {
  find: function find(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (findWithoutClosingOnEarlyError) return call(findWithoutClosingOnEarlyError, this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return iterate(record, function (value, stop) {
      if (predicate(value, counter++)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/iterate":138,"../internals/iterator-close":141,"../internals/iterator-helper-without-closing-on-early-error":144}],214:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var iterate = require('../internals/iterate');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');

var forEachWithoutClosingOnEarlyError = iteratorHelperWithoutClosingOnEarlyError('forEach', TypeError);

// `Iterator.prototype.forEach` method
// https://tc39.es/ecma262/#sec-iterator.prototype.foreach
$({ target: 'Iterator', proto: true, real: true, forced: forEachWithoutClosingOnEarlyError }, {
  forEach: function forEach(fn) {
    anObject(this);
    try {
      aCallable(fn);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (forEachWithoutClosingOnEarlyError) return call(forEachWithoutClosingOnEarlyError, this, fn);

    var record = getIteratorDirect(this);
    var counter = 0;
    iterate(record, function (value) {
      fn(value, counter++);
    }, { IS_RECORD: true });
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/iterate":138,"../internals/iterator-close":141,"../internals/iterator-helper-without-closing-on-early-error":144}],215:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperThrowsOnInvalidIterator = require('../internals/iterator-helper-throws-on-invalid-iterator');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');
var IS_PURE = require('../internals/is-pure');

var MAP_WITHOUT_THROWING_ON_INVALID_ITERATOR = !IS_PURE && !iteratorHelperThrowsOnInvalidIterator('map', function () { /* empty */ });
var mapWithoutClosingOnEarlyError = !IS_PURE && !MAP_WITHOUT_THROWING_ON_INVALID_ITERATOR
  && iteratorHelperWithoutClosingOnEarlyError('map', TypeError);

var FORCED = IS_PURE || MAP_WITHOUT_THROWING_ON_INVALID_ITERATOR || mapWithoutClosingOnEarlyError;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var result = anObject(call(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, [result.value, this.counter++], true);
});

// `Iterator.prototype.map` method
// https://tc39.es/ecma262/#sec-iterator.prototype.map
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  map: function map(mapper) {
    anObject(this);
    try {
      aCallable(mapper);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (mapWithoutClosingOnEarlyError) return call(mapWithoutClosingOnEarlyError, this, mapper);

    return new IteratorProxy(getIteratorDirect(this), {
      mapper: mapper
    });
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/call-with-safe-iteration-closing":85,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/is-pure":134,"../internals/iterator-close":141,"../internals/iterator-create-proxy":142,"../internals/iterator-helper-throws-on-invalid-iterator":143,"../internals/iterator-helper-without-closing-on-early-error":144}],216:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');
var apply = require('../internals/function-apply');
var fails = require('../internals/fails');

var $TypeError = TypeError;

// https://bugs.webkit.org/show_bug.cgi?id=291651
var FAILS_ON_INITIAL_UNDEFINED = fails(function () {
  // eslint-disable-next-line es/no-iterator-prototype-reduce, es/no-array-prototype-keys, array-callback-return -- required for testing
  [].keys().reduce(function () { /* empty */ }, undefined);
});

var reduceWithoutClosingOnEarlyError = !FAILS_ON_INITIAL_UNDEFINED && iteratorHelperWithoutClosingOnEarlyError('reduce', $TypeError);

// `Iterator.prototype.reduce` method
// https://tc39.es/ecma262/#sec-iterator.prototype.reduce
$({ target: 'Iterator', proto: true, real: true, forced: FAILS_ON_INITIAL_UNDEFINED || reduceWithoutClosingOnEarlyError }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject(this);
    try {
      aCallable(reducer);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    if (reduceWithoutClosingOnEarlyError) {
      return apply(reduceWithoutClosingOnEarlyError, this, noInitial ? [reducer] : [reducer, accumulator]);
    }
    var record = getIteratorDirect(this);
    var counter = 0;
    iterate(record, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value, counter);
      }
      counter++;
    }, { IS_RECORD: true });
    if (noInitial) throw new $TypeError('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/export":103,"../internals/fails":104,"../internals/function-apply":105,"../internals/get-iterator-direct":114,"../internals/iterate":138,"../internals/iterator-close":141,"../internals/iterator-helper-without-closing-on-early-error":144}],217:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var iterate = require('../internals/iterate');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var iteratorHelperWithoutClosingOnEarlyError = require('../internals/iterator-helper-without-closing-on-early-error');

var someWithoutClosingOnEarlyError = iteratorHelperWithoutClosingOnEarlyError('some', TypeError);

// `Iterator.prototype.some` method
// https://tc39.es/ecma262/#sec-iterator.prototype.some
$({ target: 'Iterator', proto: true, real: true, forced: someWithoutClosingOnEarlyError }, {
  some: function some(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (someWithoutClosingOnEarlyError) return call(someWithoutClosingOnEarlyError, this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return iterate(record, function (value, stop) {
      if (predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

},{"../internals/a-callable":74,"../internals/an-object":81,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/iterate":138,"../internals/iterator-close":141,"../internals/iterator-helper-without-closing-on-early-error":144}],218:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var isArray = require('../internals/is-array');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');
var create = require('../internals/object-create');
var isRawJSON = require('../internals/is-raw-json');
var isSymbol = require('../internals/is-symbol');
var classof = require('../internals/classof-raw');
var thisNumberValue = require('../internals/this-number-value');
var includes = require('../internals/array-includes').includes;
var hasOwn = require('../internals/has-own-property');
var toString = require('../internals/to-string');
var parseJSONString = require('../internals/parse-json-string');
var uid = require('../internals/uid');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var NATIVE_RAW_JSON = require('../internals/native-raw-json');

var $String = String;
var $TypeError = TypeError;
var $stringify = getBuiltIn('JSON', 'stringify');
var $BigInt = getBuiltIn('BigInt');
var stringValueOf = uncurryThis(''.valueOf);
var booleanValueOf = uncurryThis(true.valueOf);
var bigIntValueOf = $BigInt && uncurryThis($BigInt.prototype.valueOf);
var exec = uncurryThis(/./.exec);
var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var replace = uncurryThis(''.replace);
var slice = uncurryThis(''.slice);
var push = uncurryThis([].push);
var pop = uncurryThis([].pop);
var numberToString = uncurryThis(1.1.toString);

var surrogates = /[\uD800-\uDFFF]/g;
var leadingSurrogates = /^[\uD800-\uDBFF]$/;
var trailingSurrogates = /^[\uDC00-\uDFFF]$/;
var digits = /^\d+$/;

// a placeholder of a raw JSON value
var RAW_MARK = uid();
// a prefix of keys of a reordered object, see `createOrderedObject`
var KEY_MARK = uid();
// the last key of a reordered object, marks the end of its serialization
var END_MARK = uid();
var RAW_MARK_LENGTH = RAW_MARK.length;
var KEY_MARK_LENGTH = KEY_MARK.length;

var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
  var symbol = getBuiltIn('Symbol')('stringify detection');
  // MS Edge converts symbol values to JSON as {}
  return $stringify([symbol]) !== '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify({ a: symbol }) !== '{}'
    // V8 throws on boxed symbols
    || $stringify(Object(symbol)) !== '{}';
});

// https://github.com/tc39/proposal-well-formed-stringify
var ILL_FORMED_UNICODE = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

var isRawJSONValue = NATIVE_RAW_JSON ? getBuiltIn('JSON', 'isRawJSON') : isRawJSON;

var stringifyWithProperSymbolsConversion = WRONG_SYMBOLS_CONVERSION ? function (it, replacer, space) {
  return $stringify(it, function (key, value) {
    var replaced = call(replacer, this, key, value);
    if (!isSymbol(replaced)) return replaced;
  }, space);
} : $stringify;

var fixIllFormedJSON = function (match, offset, string) {
  var prev = charAt(string, offset - 1);
  var next = charAt(string, offset + 1);
  if (
    (exec(leadingSurrogates, match) && !exec(trailingSurrogates, next)) ||
    (exec(trailingSurrogates, match) && !exec(leadingSurrogates, prev))
  ) {
    return '\\u' + numberToString(charCodeAt(match, 0), 16);
  } return match;
};

// `PropertyList` of `JSON.stringify`
// https://tc39.es/ecma262/#sec-json.stringify
var getPropertyList = function (replacer) {
  if (!isArray(replacer)) return;
  var rawLength = replacer.length;
  var propertyList = [];
  // a null prototype object is used as a set of already added keys to keep the deduplication linear
  var addedKeys = create(null);
  for (var i = 0; i < rawLength; i++) {
    var element = replacer[i];
    var key;
    if (typeof element == 'string') key = element;
    else if (typeof element == 'number' || classof(element) === 'Number' || classof(element) === 'String') key = toString(element);
    else continue;
    if (!hasOwn(addedKeys, key)) {
      addedKeys[key] = true;
      push(propertyList, key);
    }
  }
  return propertyList;
};

// values with such an internal slot are unwrapped by `SerializeJSONProperty` instead of being serialized as objects
var hasInternalSlot = function (valueOf, it) {
  try {
    valueOf(it);
    return true;
  } catch (error) {
    return false;
  }
};

// the slot check is expensive, so it's performed only for the kind reported by the value itself -
// a value lying about its kind via `Symbol.toStringTag` is serialized as an ordinary object
var isBoxedPrimitive = function (it) {
  var kind = classof(it);
  return (kind === 'Number' && hasInternalSlot(thisNumberValue, it))
    || (kind === 'String' && hasInternalSlot(stringValueOf, it))
    || (kind === 'Boolean' && hasInternalSlot(booleanValueOf, it))
    || (!!bigIntValueOf && kind === 'BigInt' && hasInternalSlot(bigIntValueOf, it));
};

// only objects serialized by `SerializeJSONObject` are affected by the property list
var isSerializedAsObject = function (it) {
  if (!isObject(it) || isCallable(it) || isArray(it)) return false;
  try {
    return !isBoxedPrimitive(it);
  // `classof` reads `Symbol.toStringTag`, so a proxy could throw - it has no internal slots anyway
  } catch (error) {
    return true;
  }
};

// the engine unwraps it in the same order as it would read the original property,
// so the property is read lazily and `toJSON` is called once and with the original key
var createElementHolder = function (holder, key) {
  return {
    toJSON: function () {
      var element = holder[key];
      if (isObject(element) || typeof element == 'bigint') {
        var elementToJSON = element.toJSON;
        if (isCallable(elementToJSON)) element = call(elementToJSON, element, key);
      } return element;
    }
  };
};

// own keys of objects are sorted - integer-like keys are moved to the beginning,
// so such keys should be marked and restored in the serialized string
var getKeyPrefix = function (propertyList) {
  for (var i = 0, length = propertyList.length; i < length; i++) {
    if (exec(digits, propertyList[i])) return KEY_MARK;
  } return '';
};

// `SerializeJSONObject` iterates the property list, so the value is replaced with an object with keys in this order
var createOrderedObject = function (value, propertyList, keyPrefix) {
  // keys are not marked if the property list has no integer-like keys, so `Object.prototype`
  // with a setter, a non-writable property or `__proto__` should not intercept the assignment
  var ordered = create(null);
  for (var i = 0, length = propertyList.length; i < length; i++) {
    var key = propertyList[i];
    ordered[keyPrefix + key] = createElementHolder(value, key);
  }
  ordered[END_MARK] = null;
  return ordered;
};

// `JSON.stringify` method
// https://tc39.es/ecma262/#sec-json.stringify
// https://github.com/tc39/proposal-json-parse-with-source
if ($stringify) $({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE || !NATIVE_RAW_JSON }, {
  stringify: function stringify(text, replacer, space) {
    var replacerFunction = isCallable(replacer) ? replacer : undefined;
    var propertyList = replacerFunction ? undefined : getPropertyList(replacer);
    var keyPrefix = propertyList && getKeyPrefix(propertyList);
    var rawStrings = [];
    var openObjects = [];
    var parentOrdered = [];
    var currentOrdered;
    var marked = false;
    var root = true;

    var json = stringifyWithProperSymbolsConversion(text, function (key, value) {
      // some old implementations (like WebKit) could pass numbers as keys
      key = $String(key);

      if (propertyList) {
        if (key === END_MARK) {
          pop(openObjects);
          currentOrdered = pop(parentOrdered);
          return;
        }
        if (root) root = false;
        // the innermost reordered object already contains only keys of the property list and arrays are not
        // affected by it, the rest of objects (like objects with a fake `Symbol.toStringTag`) are filtered here
        else if (this !== currentOrdered && !isArray(this) && !includes(propertyList, key)) return;
      } else if (replacerFunction) value = call(replacerFunction, this, key, value);

      if (isRawJSONValue(value)) {
        if (NATIVE_RAW_JSON) return value;
        marked = true;
        return RAW_MARK + (push(rawStrings, value.rawJSON) - 1);
      }

      if (propertyList && isSerializedAsObject(value)) {
        // reordered objects are new each time, so cycles should be detected before the engine does it
        if (includes(openObjects, value)) throw new $TypeError('Converting circular structure to JSON');
        var ordered = createOrderedObject(value, propertyList, keyPrefix);
        push(openObjects, value);
        push(parentOrdered, currentOrdered);
        currentOrdered = ordered;
        if (keyPrefix) marked = true;
        return ordered;
      }

      return value;
    }, space);

    if (typeof json != 'string') return json;

    if (ILL_FORMED_UNICODE) json = replace(json, surrogates, fixIllFormedJSON);

    if (!marked) return json;

    var result = '';
    var length = json.length;

    for (var i = 0; i < length; i++) {
      var chr = charAt(json, i);
      if (chr === '"') {
        var end = parseJSONString(json, ++i).end - 1;
        var string = slice(json, i, end);
        if (slice(string, 0, RAW_MARK_LENGTH) === RAW_MARK) result += rawStrings[slice(string, RAW_MARK_LENGTH)];
        else if (slice(string, 0, KEY_MARK_LENGTH) === KEY_MARK) result += '"' + slice(string, KEY_MARK_LENGTH) + '"';
        else result += '"' + string + '"';
        i = end;
      } else result += chr;
    }

    return result;
  }
});

},{"../internals/array-includes":82,"../internals/classof-raw":86,"../internals/export":103,"../internals/fails":104,"../internals/function-call":108,"../internals/function-uncurry-this":112,"../internals/get-built-in":113,"../internals/has-own-property":120,"../internals/is-array":128,"../internals/is-callable":129,"../internals/is-object":133,"../internals/is-raw-json":135,"../internals/is-symbol":136,"../internals/native-raw-json":152,"../internals/object-create":154,"../internals/parse-json-string":167,"../internals/symbol-constructor-detection":187,"../internals/this-number-value":188,"../internals/to-string":199,"../internals/uid":201}],219:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var regExpFlagsDetection = require('../internals/regexp-flags-detection');
var regExpFlagsGetterImplementation = require('../internals/regexp-flags');

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (DESCRIPTORS && !regExpFlagsDetection.correct) {
  defineBuiltInAccessor(RegExp.prototype, 'flags', {
    configurable: true,
    get: regExpFlagsGetterImplementation
  });

  regExpFlagsDetection.correct = true;
}

},{"../internals/define-built-in-accessor":94,"../internals/descriptors":98,"../internals/regexp-flags":170,"../internals/regexp-flags-detection":169}],220:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');
var wellKnownSymbol = require('../internals/well-known-symbol');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var IS_PURE = require('../internals/is-pure');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var $TypeError = TypeError;

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance(this, AsyncIteratorPrototype);
  if (getPrototypeOf(this) === AsyncIteratorPrototype) throw new $TypeError('Abstract class AsyncIterator not directly constructable');
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype;

if (!hasOwn(AsyncIteratorPrototype, TO_STRING_TAG)) {
  createNonEnumerableProperty(AsyncIteratorPrototype, TO_STRING_TAG, 'AsyncIterator');
}

if (IS_PURE || !hasOwn(AsyncIteratorPrototype, 'constructor') || AsyncIteratorPrototype.constructor === Object) {
  createNonEnumerableProperty(AsyncIteratorPrototype, 'constructor', AsyncIteratorConstructor);
}

// `AsyncIterator` constructor
// https://github.com/tc39/proposal-async-iterator-helpers
$({ global: true, constructor: true, forced: IS_PURE }, {
  AsyncIterator: AsyncIteratorConstructor
});

},{"../internals/an-instance":80,"../internals/async-iterator-prototype":84,"../internals/create-non-enumerable-property":91,"../internals/export":103,"../internals/has-own-property":120,"../internals/is-pure":134,"../internals/object-get-prototype-of":160,"../internals/well-known-symbol":207}],221:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getIteratorDirect = require('../internals/get-iterator-direct');
var notANaN = require('../internals/not-a-nan');
var toPositiveInteger = require('../internals/to-positive-integer');
var createAsyncIteratorProxy = require('../internals/async-iterator-create-proxy');
var createIterResultObject = require('../internals/create-iter-result-object');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var loop = function () {
      try {
        Promise.resolve(anObject(call(state.next, state.iterator))).then(function (step) {
          try {
            if (anObject(step).done) {
              state.done = true;
              resolve(createIterResultObject(undefined, true));
            } else if (state.remaining) {
              state.remaining--;
              loop();
            } else resolve(createIterResultObject(step.value, false));
          } catch (err) { doneAndReject(err); }
        }, doneAndReject);
      } catch (error) { doneAndReject(error); }
    };

    loop();
  });
});

// `AsyncIterator.prototype.drop` method
// https://github.com/tc39/proposal-async-iterator-helpers
$({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  drop: function drop(limit) {
    anObject(this);
    var remaining = toPositiveInteger(notANaN(+limit));
    return new AsyncIteratorProxy(getIteratorDirect(this), {
      remaining: remaining
    });
  }
});

},{"../internals/an-object":81,"../internals/async-iterator-create-proxy":83,"../internals/create-iter-result-object":90,"../internals/export":103,"../internals/function-call":108,"../internals/get-iterator-direct":114,"../internals/not-a-nan":153,"../internals/to-positive-integer":194}],222:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.constructor');

},{"../modules/es.iterator.constructor":209}],223:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.drop');

},{"../modules/es.iterator.drop":210}],224:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.every');

},{"../modules/es.iterator.every":211}],225:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.filter');

},{"../modules/es.iterator.filter":212}],226:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.find');

},{"../modules/es.iterator.find":213}],227:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.for-each');

},{"../modules/es.iterator.for-each":214}],228:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.map');

},{"../modules/es.iterator.map":215}],229:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.reduce');

},{"../modules/es.iterator.reduce":216}],230:[function(require,module,exports){
'use strict';
// TODO: Remove from `core-js@4`
require('../modules/es.iterator.some');

},{"../modules/es.iterator.some":217}],231:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aMap = require('../internals/a-map');
var remove = require('../internals/map-helpers').remove;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aMap(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/map-helpers":149}],232:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(map, function (value, key) {
      if (!boundFunction(value, key, map)) return false;
    }, true) !== false;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-iterate":150}],233:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var MapHelpers = require('../internals/map-helpers');
var iterate = require('../internals/map-iterate');

var Map = MapHelpers.Map;
var set = MapHelpers.set;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map();
    iterate(map, function (value, key) {
      if (boundFunction(value, key, map)) set(newMap, key, value);
    });
    return newMap;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-helpers":149,"../internals/map-iterate":150}],234:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return { key: key };
    }, true);
    return result && result.key;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-iterate":150}],235:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return { value: value };
    }, true);
    return result && result.value;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-iterate":150}],236:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var sameValueZero = require('../internals/same-value-zero');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  includes: function includes(searchElement) {
    return iterate(aMap(this), function (value) {
      if (sameValueZero(value, searchElement)) return true;
    }, true) === true;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/map-iterate":150,"../internals/same-value-zero":172}],237:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  keyOf: function keyOf(searchElement) {
    var result = iterate(aMap(this), function (value, key) {
      if (value === searchElement) return { key: key };
    }, true);
    return result && result.key;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/map-iterate":150}],238:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var MapHelpers = require('../internals/map-helpers');
var iterate = require('../internals/map-iterate');

var Map = MapHelpers.Map;
var set = MapHelpers.set;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map();
    iterate(map, function (value, key) {
      set(newMap, boundFunction(value, key, map), value);
    });
    return newMap;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-helpers":149,"../internals/map-iterate":150}],239:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var MapHelpers = require('../internals/map-helpers');
var iterate = require('../internals/map-iterate');

var Map = MapHelpers.Map;
var set = MapHelpers.set;

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map();
    iterate(map, function (value, key) {
      set(newMap, key, boundFunction(value, key, map));
    });
    return newMap;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-helpers":149,"../internals/map-iterate":150}],240:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aMap = require('../internals/a-map');
var iterate = require('../internals/iterate');
var set = require('../internals/map-helpers').set;

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, arity: 1, forced: true }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  merge: function merge(iterable /* ...iterables */) {
    var map = aMap(this);
    var argumentsLength = arguments.length;
    var i = 0;
    while (i < argumentsLength) {
      iterate(arguments[i++], function (key, value) {
        set(map, key, value);
      }, { AS_ENTRIES: true });
    }
    return map;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/iterate":138,"../internals/map-helpers":149}],241:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aCallable = require('../internals/a-callable');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

var $TypeError = TypeError;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = aMap(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable(callbackfn);
    iterate(map, function (value, key) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    });
    if (noInitial) throw new $TypeError('Reduce of empty map with no initial value');
    return accumulator;
  }
});

},{"../internals/a-callable":74,"../internals/a-map":75,"../internals/export":103,"../internals/map-iterate":150}],242:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aMap = require('../internals/a-map');
var iterate = require('../internals/map-iterate');

// `Map.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return true;
    }, true) === true;
  }
});

},{"../internals/a-map":75,"../internals/export":103,"../internals/function-bind-context":106,"../internals/map-iterate":150}],243:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aCallable = require('../internals/a-callable');
var aMap = require('../internals/a-map');
var MapHelpers = require('../internals/map-helpers');

var $TypeError = TypeError;
var get = MapHelpers.get;
var has = MapHelpers.has;
var set = MapHelpers.set;

// `Map.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: true }, {
  update: function update(key, callback /* , thunk */) {
    var map = aMap(this);
    var length = arguments.length;
    aCallable(callback);
    var isPresentInMap = has(map, key);
    if (!isPresentInMap && length < 3) {
      throw new $TypeError('Updating absent value');
    }
    var value = isPresentInMap ? get(map, key) : aCallable(length > 2 ? arguments[2] : undefined)(key, map);
    set(map, key, callback(value, key, map));
    return map;
  }
});

},{"../internals/a-callable":74,"../internals/a-map":75,"../internals/export":103,"../internals/map-helpers":149}],244:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var add = require('../internals/set-helpers').add;

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  addAll: function addAll(/* ...elements */) {
    var set = aSet(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      add(set, arguments[k]);
    } return set;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/set-helpers":175}],245:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aSet = require('../internals/a-set');
var remove = require('../internals/set-helpers').remove;

// `Set.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aSet(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/set-helpers":175}],246:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $difference = require('../internals/set-difference');

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  difference: function difference(other) {
    return call($difference, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-difference":174,"../internals/to-set-like":197}],247:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aSet = require('../internals/a-set');
var iterate = require('../internals/set-iterate');

// `Set.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(set, function (value) {
      if (!boundFunction(value, value, set)) return false;
    }, true) !== false;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/function-bind-context":106,"../internals/set-iterate":180}],248:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var iterate = require('../internals/set-iterate');

var Set = SetHelpers.Set;
var add = SetHelpers.add;

// `Set.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newSet = new Set();
    iterate(set, function (value) {
      if (boundFunction(value, value, set)) add(newSet, value);
    });
    return newSet;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/function-bind-context":106,"../internals/set-helpers":175,"../internals/set-iterate":180}],249:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aSet = require('../internals/a-set');
var iterate = require('../internals/set-iterate');

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate(set, function (value) {
      if (boundFunction(value, value, set)) return { value: value };
    }, true);
    return result && result.value;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/function-bind-context":106,"../internals/set-iterate":180}],250:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $intersection = require('../internals/set-intersection');

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  intersection: function intersection(other) {
    return call($intersection, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-intersection":176,"../internals/to-set-like":197}],251:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $isDisjointFrom = require('../internals/set-is-disjoint-from');

// `Set.prototype.isDisjointFrom` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  isDisjointFrom: function isDisjointFrom(other) {
    return call($isDisjointFrom, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-is-disjoint-from":177,"../internals/to-set-like":197}],252:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $isSubsetOf = require('../internals/set-is-subset-of');

// `Set.prototype.isSubsetOf` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  isSubsetOf: function isSubsetOf(other) {
    return call($isSubsetOf, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-is-subset-of":178,"../internals/to-set-like":197}],253:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $isSupersetOf = require('../internals/set-is-superset-of');

// `Set.prototype.isSupersetOf` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  isSupersetOf: function isSupersetOf(other) {
    return call($isSupersetOf, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-is-superset-of":179,"../internals/to-set-like":197}],254:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aSet = require('../internals/a-set');
var iterate = require('../internals/set-iterate');
var toString = require('../internals/to-string');

var arrayJoin = uncurryThis([].join);
var push = uncurryThis([].push);

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  join: function join(separator) {
    var set = aSet(this);
    var sep = separator === undefined ? ',' : toString(separator);
    var array = [];
    iterate(set, function (value) {
      push(array, value);
    });
    return arrayJoin(array, sep);
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/function-uncurry-this":112,"../internals/set-iterate":180,"../internals/to-string":199}],255:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aSet = require('../internals/a-set');
var SetHelpers = require('../internals/set-helpers');
var iterate = require('../internals/set-iterate');

var Set = SetHelpers.Set;
var add = SetHelpers.add;

// `Set.prototype.map` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newSet = new Set();
    iterate(set, function (value) {
      add(newSet, boundFunction(value, value, set));
    });
    return newSet;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/function-bind-context":106,"../internals/set-helpers":175,"../internals/set-iterate":180}],256:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aCallable = require('../internals/a-callable');
var aSet = require('../internals/a-set');
var iterate = require('../internals/set-iterate');

var $TypeError = TypeError;

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = aSet(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable(callbackfn);
    iterate(set, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, value, set);
      }
    });
    if (noInitial) throw new $TypeError('Reduce of empty set with no initial value');
    return accumulator;
  }
});

},{"../internals/a-callable":74,"../internals/a-set":76,"../internals/export":103,"../internals/set-iterate":180}],257:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var aSet = require('../internals/a-set');
var iterate = require('../internals/set-iterate');

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  some: function some(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(set, function (value) {
      if (boundFunction(value, value, set)) return true;
    }, true) === true;
  }
});

},{"../internals/a-set":76,"../internals/export":103,"../internals/function-bind-context":106,"../internals/set-iterate":180}],258:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $symmetricDifference = require('../internals/set-symmetric-difference');

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  symmetricDifference: function symmetricDifference(other) {
    return call($symmetricDifference, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-symmetric-difference":182,"../internals/to-set-like":197}],259:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var toSetLike = require('../internals/to-set-like');
var $union = require('../internals/set-union');

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$({ target: 'Set', proto: true, real: true, forced: true }, {
  union: function union(other) {
    return call($union, this, toSetLike(other));
  }
});

},{"../internals/export":103,"../internals/function-call":108,"../internals/set-union":183,"../internals/to-set-like":197}],260:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aWeakMap = require('../internals/a-weak-map');
var remove = require('../internals/weak-map-helpers').remove;

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'WeakMap', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aWeakMap(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

},{"../internals/a-weak-map":77,"../internals/export":103,"../internals/weak-map-helpers":205}],261:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aWeakSet = require('../internals/a-weak-set');
var add = require('../internals/weak-set-helpers').add;

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'WeakSet', proto: true, real: true, forced: true }, {
  addAll: function addAll(/* ...elements */) {
    var set = aWeakSet(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      add(set, arguments[k]);
    } return set;
  }
});

},{"../internals/a-weak-set":78,"../internals/export":103,"../internals/weak-set-helpers":206}],262:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var aWeakSet = require('../internals/a-weak-set');
var remove = require('../internals/weak-set-helpers').remove;

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'WeakSet', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aWeakSet(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

},{"../internals/a-weak-set":78,"../internals/export":103,"../internals/weak-set-helpers":206}],263:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],264:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; };
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
  defineProperty(
    GeneratorFunctionPrototype,
    "constructor",
    { value: GeneratorFunction, configurable: true }
  );
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    defineProperty(this, "_invoke", { value: enqueue });
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per GeneratorResume behavior specified since ES2015:
        // ES2015 spec, step 3: https://262.ecma-international.org/6.0/#sec-generatorresume
        // Latest spec, step 2: https://tc39.es/ecma262/#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method;
    var method = delegate.iterator[methodName];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method, or a missing .next method, always terminate the
      // yield* loop.
      context.delegate = null;

      // Note: ["return"] must be used for ES3 parsing compatibility.
      if (methodName === "throw" && delegate.iterator["return"]) {
        // If the delegate iterator has a return method, give it a
        // chance to clean up.
        context.method = "return";
        context.arg = undefined;
        maybeInvokeDelegate(delegate, context);

        if (context.method === "throw") {
          // If maybeInvokeDelegate(context) changed context.method from
          // "return" to "throw", let that override the TypeError below.
          return ContinueSentinel;
        }
      }
      if (methodName !== "return") {
        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a '" + methodName + "' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(val) {
    var object = Object(val);
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable != null) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    throw new TypeError(typeof iterable + " is not iterable");
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

},{}],265:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "BasicQueue", {
  enumerable: true,
  get: function () {
    return _BasicQueue.default;
  }
});
Object.defineProperty(exports, "addUniqueToArray", {
  enumerable: true,
  get: function () {
    return _addUniqueToArray.default;
  }
});
Object.defineProperty(exports, "buildArray", {
  enumerable: true,
  get: function () {
    return _buildArray.default;
  }
});
Object.defineProperty(exports, "buildArrayOfReferences", {
  enumerable: true,
  get: function () {
    return _buildArrayOfReferences.default;
  }
});
Object.defineProperty(exports, "compareArrays", {
  enumerable: true,
  get: function () {
    return _compareArrays.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "mergeArrays", {
  enumerable: true,
  get: function () {
    return _mergeArrays.default;
  }
});
Object.defineProperty(exports, "uniqueArray", {
  enumerable: true,
  get: function () {
    return _uniqueArray.default;
  }
});
var _addUniqueToArray = _interopRequireDefault(require("./arrays/addUniqueToArray"));
var _BasicQueue = _interopRequireDefault(require("./arrays/BasicQueue"));
var _buildArray = _interopRequireDefault(require("./arrays/buildArray"));
var _buildArrayOfReferences = _interopRequireDefault(require("./arrays/buildArrayOfReferences"));
var _compareArrays = _interopRequireDefault(require("./arrays/compareArrays"));
var _mergeArrays = _interopRequireDefault(require("./arrays/mergeArrays"));
var _uniqueArray = _interopRequireDefault(require("./arrays/uniqueArray"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Utilities for building, merging, deduplicating and comparing arrays, plus a basic FIFO queue (BasicQueue) for
 * use with functionHelpers' queueManager/queueTimeout.
 */
var _default = exports.default = {
  addUniqueToArray: _addUniqueToArray.default,
  BasicQueue: _BasicQueue.default,
  buildArray: _buildArray.default,
  buildArrayOfReferences: _buildArrayOfReferences.default,
  compareArrays: _compareArrays.default,
  mergeArrays: _mergeArrays.default,
  uniqueArray: _uniqueArray.default
};
},{"./arrays/BasicQueue":266,"./arrays/addUniqueToArray":267,"./arrays/buildArray":268,"./arrays/buildArrayOfReferences":269,"./arrays/compareArrays":270,"./arrays/mergeArrays":271,"./arrays/uniqueArray":272}],266:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Class BasicQueue is a functional example of a queue to be used with queueManager.
 */
class BasicQueue {
  /**
   * @param innerList - Items to pre-populate the queue with, in order.
   */
  constructor(innerList = []) {
    this.innerList = innerList;
  }
  /**
   * Remove and return the next item in the queue
   */
  dequeue() {
    return this.innerList.shift();
  }
  /**
   * Check if the queue is empty
   */
  empty() {
    return !this.size();
  }
  /**
   * Add an item to the end of the queue
   * @param data
   */
  enqueue(data) {
    this.innerList.push(data);
    return this;
  }
  /**
   * Retrieve the next item from the queue
   */
  peek() {
    return this.empty() ? null : this.innerList[0];
  }
  /**
   * Get the quantity of items in the queue
   */
  size() {
    return this.innerList.length;
  }
}
var _default = exports.default = BasicQueue;
},{}],267:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.array.includes.js");
/**
 * Having an array and a potential new array element, check if the element is in the array, if not append to array.
 * @param item - An potential array element, possibly a DomItem
 * @param array - An array where an element may be appended.
 */
const addUniqueToArray = (item, array) => !array.includes(item) ? array.concat([item]) : array;
var _default = exports.default = addUniqueToArray;
},{"core-js/modules/es.array.includes.js":208}],268:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cloneObject = _interopRequireDefault(require("../objects/cloneObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Leverage buildArrayBase to generate an array filled with a copy of the provided item.
 * The length defines how long the array should be.
 * @param item - The item to be used for each array element
 * @param length - The desired length of the array
 */
const buildArray = (item, length) => {
  const arr = [];
  while (arr.length < length) {
    const cloned = (0, _cloneObject.default)(item);
    arr.push(cloned);
  }
  return arr;
};
var _default = exports.default = buildArray;
},{"../objects/cloneObject":309}],269:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Leverage buildArrayBase to generate an array filled with references to the provided item.
 * The length defines how long the array should be.
 * @param item - The item to be used for each array element
 * @param length - The desired length of the array
 */
const buildArrayOfReferences = (item, length) => {
  const arr = [];
  while (arr.length < length) {
    arr.push(item);
  }
  return arr;
};
var _default = exports.default = buildArrayOfReferences;
},{}],270:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.every.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _isObject = _interopRequireDefault(require("../objects/isObject"));
var _mergeArrays = _interopRequireDefault(require("./mergeArrays"));
var _objectKeys = _interopRequireDefault(require("../objects/objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Compare two Arrays and return the Object where the value for each property is as follows:
 * -1 to indicate val1 is less than val2
 * 0 to indicate both values are the equal
 * 1 to indicate val1 is greater than val2
 * The returned Object uses the element values as the property names
 * This functions works by first creating a concatenated array of all unique values. Then for each unique values,
 * convert to a string and use it as a new property name. Array filter each array checking if it has the unique value.
 * Use the lengths of these filtered arrays to compare. So if the first array has the value and the second one doesn't
 * the first length will be one or more and the second will be zero, if the both have the value then both will be one
 * or more.
 * @example
 * // example of input and resulting output
 * compareArrays(
 *   ['match1', 'firstMismatch1', 'match2', 'firstMismatch2', 'badMatch1'],
 *   ['match1', 'match2', 'secondMismatch1', 'badMatch1', 'badMatch1']
 * )
 * // unique array
 * ['match1', 'firstMismatch1', 'match2', 'firstMismatch2', 'badMatch1', 'secondMismatch1']
 * // result object
 * [
 *   {
 *     value: 'match1',
 *     keys: [[0], [0]],
 *     result: [0, 0]
 *   },
 *   {
 *     value: 'firstMismatch1',
 *     keys: [[1], []],
 *     result: [1, -1]
 *   },
 *   {
 *     value: 'match2',
 *     keys: [[2], [1]],
 *     result: [0, 0]
 *   },
 *   {
 *     value: 'firstMismatch2',
 *     keys: [[3], []],
 *     result: [1, -1]
 *   },
 *   {
 *     value: 'badMatch1',
 *     keys: [[4], [3, 4]],
 *     result: [0, 0]
 *   },
 *   {
 *     value: 'secondMismatch1',
 *     keys: [[], [2]],
 *     result: [-1, 1]
 *   }
 * ]
 *
 * @param arrays - The arrays to compare
 */
const compareArrays = (...arrays) => (0, _mergeArrays.default)(...arrays).reduce((results, attr) => {
  const attrType = typeof attr;
  const useArray = Array.isArray(attr);
  const keys = arrays.map(array => array.reduce((results, current, key) => {
    const currentType = typeof current;
    if (attrType !== currentType) {
      return results;
    }
    if (!(0, _isObject.default)(attr)) {
      return current === attr ? [...results, key] : results;
    }
    if (useArray !== Array.isArray(current)) {
      return results;
    }
    const compareKeys = useArray ? compareArrays(attr, current) : compareArrays((0, _objectKeys.default)(attr), (0, _objectKeys.default)(current));
    return compareKeys.every(compare => compare.result.every(result => result === 0)) ? [...results, key] : results;
  }, []));
  const arrayResults = keys.map(array => array.length ? 1 : -1);
  return [...results, {
    value: attr,
    keys,
    result: arrayResults.every(result => result === 1) ? arrayResults.map(result => 0) : arrayResults
  }];
}, []);
var _default = exports.default = compareArrays;
},{"../objects/isObject":319,"../objects/objectKeys":324,"./mergeArrays":271,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.every.js":224,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229}],271:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.array.includes.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _uniqueArray = _interopRequireDefault(require("./uniqueArray"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Take multiple arrays and then filter all these into one unique array.
 * @param arrays - Provide multiple arrays to create one unique array
 */
const mergeArrays = (...arrays) => arrays.map(_uniqueArray.default).reduce((merged, arr) => [...merged, ...arr.filter(attr => !merged.includes(attr))], []);
var _default = exports.default = mergeArrays;
},{"./uniqueArray":272,"core-js/modules/es.array.includes.js":208,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229}],272:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
/**
 * Remove duplicate values from an array. uniqueArray
 * @param array - The array to make unique
 */
const uniqueArray = array => array.filter((item, index) => array.indexOf(item) === index);
var _default = exports.default = uniqueArray;
},{"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225}],273:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "assignDescriptor", {
  enumerable: true,
  get: function () {
    return _assignDescriptor.default;
  }
});
Object.defineProperty(exports, "assignDescriptorDetail", {
  enumerable: true,
  get: function () {
    return _assignDescriptorDetail.default;
  }
});
Object.defineProperty(exports, "checkClearValues", {
  enumerable: true,
  get: function () {
    return _checkClearValues.default;
  }
});
Object.defineProperty(exports, "checkDescriptorComplete", {
  enumerable: true,
  get: function () {
    return _checkDescriptorComplete.default;
  }
});
Object.defineProperty(exports, "cloneDescriptor", {
  enumerable: true,
  get: function () {
    return _cloneDescriptor.default;
  }
});
Object.defineProperty(exports, "cloneDescriptorDetail", {
  enumerable: true,
  get: function () {
    return _cloneDescriptorDetail.default;
  }
});
Object.defineProperty(exports, "compareDescriptor", {
  enumerable: true,
  get: function () {
    return _compareDescriptor.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "describeObject", {
  enumerable: true,
  get: function () {
    return _describeObject.default;
  }
});
Object.defineProperty(exports, "describeObjectDetail", {
  enumerable: true,
  get: function () {
    return _describeObjectDetail.default;
  }
});
Object.defineProperty(exports, "describeObjectMap", {
  enumerable: true,
  get: function () {
    return _describeObjectMap.default;
  }
});
Object.defineProperty(exports, "nextReference", {
  enumerable: true,
  get: function () {
    return _nextReference.default;
  }
});
Object.defineProperty(exports, "sameDescriptor", {
  enumerable: true,
  get: function () {
    return _sameDescriptor.default;
  }
});
var _assignDescriptor = _interopRequireDefault(require("./descriptors/assignDescriptor"));
var _assignDescriptorDetail = _interopRequireDefault(require("./descriptors/assignDescriptorDetail"));
var _checkClearValues = _interopRequireDefault(require("./descriptors/checkClearValues"));
var _checkDescriptorComplete = _interopRequireDefault(require("./descriptors/checkDescriptorComplete"));
var _cloneDescriptor = _interopRequireDefault(require("./descriptors/cloneDescriptor"));
var _cloneDescriptorDetail = _interopRequireDefault(require("./descriptors/cloneDescriptorDetail"));
var _compareDescriptor = _interopRequireDefault(require("./descriptors/compareDescriptor"));
var _describeObject = _interopRequireDefault(require("./descriptors/describeObject"));
var _describeObjectMap = _interopRequireDefault(require("./descriptors/describeObjectMap"));
var _describeObjectDetail = _interopRequireDefault(require("./descriptors/describeObjectDetail"));
var _nextReference = _interopRequireDefault(require("./descriptors/nextReference"));
var _sameDescriptor = _interopRequireDefault(require("./descriptors/sameDescriptor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A "descriptor" is a flat, serializable snapshot of an object or array's shape: for each property, its type(s),
 * whether it's nullable, and - if the property's own value is itself an object/array - a reference to that nested
 * value's own descriptor elsewhere in the same list, rather than nesting descriptors inside descriptors. This flat,
 * reference-based structure is what lets these utilities walk deeply nested and even circular object graphs (an
 * object that contains itself, directly or indirectly) without infinite recursion, since a value that's already
 * been described is simply pointed to again instead of re-described.
 *
 * Start with {@link module:objectDescriptors.describeObjectMap}, which takes any real object or array and produces
 * this flat list of descriptors for you - the other functions here (comparing, merging, cloning descriptors) are
 * building blocks used internally, or useful once you already have descriptors to work with directly.
 *
 * The concrete use this module has earned its keep on: describing two objects and comparing the results tells
 * you whether they're the same shape and values even when they're different references entirely (see
 * {@link module:objectDescriptors.sameDescriptor}/{@link module:objectDescriptors.compareDescriptor}) - useful
 * anywhere you need to check that two objects genuinely match without caring whether they're literally the same
 * instance. A descriptor also doubles as a flat, structured summary of an object's shape, which can be handy for
 * discussion or assessment purposes (e.g. describing what an object looks like without dumping the whole thing).
 */
var _default = exports.default = {
  assignDescriptor: _assignDescriptor.default,
  assignDescriptorDetail: _assignDescriptorDetail.default,
  checkClearValues: _checkClearValues.default,
  checkDescriptorComplete: _checkDescriptorComplete.default,
  cloneDescriptor: _cloneDescriptor.default,
  cloneDescriptorDetail: _cloneDescriptorDetail.default,
  compareDescriptor: _compareDescriptor.default,
  describeObject: _describeObject.default,
  describeObjectMap: _describeObjectMap.default,
  describeObjectDetail: _describeObjectDetail.default,
  nextReference: _nextReference.default,
  sameDescriptor: _sameDescriptor.default
};
},{"./descriptors/assignDescriptor":274,"./descriptors/assignDescriptorDetail":275,"./descriptors/checkClearValues":276,"./descriptors/checkDescriptorComplete":277,"./descriptors/cloneDescriptor":278,"./descriptors/cloneDescriptorDetail":279,"./descriptors/compareDescriptor":280,"./descriptors/describeObject":281,"./descriptors/describeObjectDetail":282,"./descriptors/describeObjectMap":283,"./descriptors/nextReference":284,"./descriptors/sameDescriptor":285}],274:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.every.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.find.js");
require("core-js/modules/esnext.iterator.for-each.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _assignDescriptorDetail = _interopRequireDefault(require("./assignDescriptorDetail"));
var _cloneDescriptor = _interopRequireDefault(require("./cloneDescriptor"));
var _compareArrays = _interopRequireDefault(require("../arrays/compareArrays"));
var _uniqueArray = _interopRequireDefault(require("../arrays/uniqueArray"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Apply one or more descriptors to an existing descriptor so that they represent a merged version of the descriptors.
 * Used to widen a descriptor as more differently-shaped objects are described into it (e.g. array elements of
 * different types), rather than replacing it outright.
 * @param originalMap - The base descriptor to merge onto (not mutated - a
 * clone is merged and returned).
 * @param  descriptors - One or more further descriptors to merge in.
 * @returns A new descriptor representing the merge of all of the above.
 */
const assignDescriptor = (originalMap, ...descriptors) => descriptors.reduce((assignedDescriptor, descriptor) => {
  const detailsDiff = (0, _compareArrays.default)(assignedDescriptor.keys, descriptor.keys);
  detailsDiff.forEach(diff => {
    const existingDetail = assignedDescriptor.details.find(detail => detail.key === diff.value);
    const newDetail = descriptor.details.find(detail => detail.key === diff.value);
    if (diff.result.every(result => result === 0)) {
      assignedDescriptor.details[existingDetail.index] = (0, _assignDescriptorDetail.default)(existingDetail, newDetail);
      return assignedDescriptor;
    }
    const useDetail = diff.result[0] > 0 ? existingDetail : newDetail;
    if (!useDetail) {
      assignedDescriptor.details[existingDetail.index].optional = true;
      return assignedDescriptor;
    }
    const useIndex = diff.result[0] > 0 ? useDetail.index : assignedDescriptor.length;
    assignedDescriptor.details[useIndex] = Object.assign({}, useDetail, {
      index: useIndex,
      optional: true
    });
    assignedDescriptor.length = assignedDescriptor.length < assignedDescriptor.details.length ? assignedDescriptor.details.length : assignedDescriptor.length;
    return assignedDescriptor;
  });
  assignedDescriptor.keys = (0, _uniqueArray.default)(assignedDescriptor.details.map(detail => detail.key));
  assignedDescriptor.references = (0, _uniqueArray.default)(assignedDescriptor.details.filter(detail => detail.isReference).map(detail => detail.index));
  assignedDescriptor.isArray = assignedDescriptor.length ? assignedDescriptor.details.every(detail => typeof detail.key === 'number') : assignedDescriptor.isArray;
  assignedDescriptor.complete = !assignedDescriptor.references.length || assignedDescriptor.complete || descriptor.complete;
  return assignedDescriptor;
}, (0, _cloneDescriptor.default)(originalMap));
var _default = exports.default = assignDescriptor;
},{"../arrays/compareArrays":270,"../arrays/uniqueArray":272,"./assignDescriptorDetail":275,"./cloneDescriptor":278,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.every.js":224,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.find.js":226,"core-js/modules/esnext.iterator.for-each.js":227,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229}],275:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _cloneDescriptorDetail = _interopRequireDefault(require("./cloneDescriptorDetail"));
var _uniqueArray = _interopRequireDefault(require("../arrays/uniqueArray"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Assign properties from other details onto an existing detail, widening it (e.g. combining `type`/`value` arrays,
 * OR-ing boolean flags like `nullable`/`optional`) rather than overwriting it - the per-property counterpart to
 * {@link module:objectDescriptors.assignDescriptor}.
 * @param originalDetail - The base detail to merge onto (not mutated -
 * a clone is merged and returned).
 * @param  details - One or more further details to merge in.
 * @returns A new detail representing the merge of all of the above.
 */
const assignDescriptorDetail = (originalDetail, ...details) => details.reduce((existingDetail, newDetail) => {
  existingDetail.type = (0, _uniqueArray.default)([...existingDetail.type, ...newDetail.type]);
  existingDetail.value = (0, _uniqueArray.default)([...existingDetail.value, ...newDetail.value]);
  existingDetail.nullable = existingDetail.nullable || newDetail.nullable;
  existingDetail.optional = existingDetail.optional || newDetail.optional;
  existingDetail.circular = existingDetail.circular || newDetail.circular;
  existingDetail.isReference = existingDetail.isReference || newDetail.isReference;
  existingDetail.isInstance = existingDetail.isInstance || newDetail.isInstance;
  existingDetail.arrayReference = [existingDetail.arrayReference, newDetail.arrayReference].find(ref => typeof ref === 'number');
  existingDetail.objectReference = [existingDetail.objectReference, newDetail.objectReference].find(ref => typeof ref === 'number');
  existingDetail.arrayReference = typeof existingDetail.arrayReference === 'undefined' ? null : existingDetail.arrayReference;
  existingDetail.objectReference = typeof existingDetail.objectReference === 'undefined' ? null : existingDetail.objectReference;
  return existingDetail;
}, (0, _cloneDescriptorDetail.default)(originalDetail));
var _default = exports.default = assignDescriptorDetail;
},{"../arrays/uniqueArray":272,"./cloneDescriptorDetail":279,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],276:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _setValue = _interopRequireDefault(require("../objects/setValue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Once a descriptor is complete (all its references have been resolved), its details' actual `value` arrays are no
 * longer needed to build the descriptor further - clear them to save memory, unless `keepValues` says otherwise.
 * @param descriptor - The descriptor to check.
 * @param keepValues - Set true to keep the values even once the descriptor is complete.
 * @returns The same descriptor, with `details[].value` cleared if applicable.
 */
const checkClearValues = (descriptor, keepValues = false) => (0, _setValue.default)('details', descriptor.complete && !keepValues ? descriptor.details.map(detail => (0, _setValue.default)('value', [], detail)) : descriptor.details, descriptor);
var _default = exports.default = checkClearValues;
},{"../objects/setValue":328,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],277:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.every.js");
var _setValue = _interopRequireDefault(require("../objects/setValue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Check if every property this descriptor references (i.e. every nested object/array it points to) has actually
 * had its own descriptor built yet, and set the descriptor's `complete` flag to true if so.
 * @param descriptor - The descriptor to check.
 * @returns The same descriptor, with `complete` updated.
 */
const checkDescriptorComplete = descriptor => (0, _setValue.default)('complete', descriptor.references.every(refId => [descriptor.details[refId].arrayReference, descriptor.details[refId].objectReference].some(ref => typeof ref === 'number')), descriptor);
var _default = exports.default = checkDescriptorComplete;
},{"../objects/setValue":328,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.every.js":224}],278:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _cloneDescriptorDetail = _interopRequireDefault(require("./cloneDescriptorDetail"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Make a copy of an object descriptor so that the original will not be mutated.
 * @param originalMap - The descriptor to copy.
 * @returns A new, independent copy.
 */
const cloneDescriptor = originalMap => {
  const copyMap = {};
  // @ts-ignore
  copyMap['index'] = originalMap.index || 0;
  // @ts-ignore
  copyMap['details'] = originalMap.details.map(_cloneDescriptorDetail.default);
  // @ts-ignore
  copyMap['length'] = originalMap.length;
  // @ts-ignore
  copyMap['keys'] = originalMap.keys.map(key => key);
  // @ts-ignore
  copyMap['references'] = originalMap.references.map(reference => reference);
  // @ts-ignore
  copyMap['isArray'] = originalMap.isArray;
  // @ts-ignore
  copyMap['complete'] = originalMap.complete;
  return copyMap;
};
var _default = exports.default = cloneDescriptor;
},{"./cloneDescriptorDetail":279,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],279:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.for-each.js");
require("core-js/modules/esnext.iterator.map.js");
var _objectKeys = _interopRequireDefault(require("../objects/objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Get a new copy of an existing descriptor detail so that the original will not be mutated.
 * @param originalDetail - The detail to copy.
 * @returns A new, independent copy.
 */
const cloneDescriptorDetail = originalDetail => {
  const copyDetail = {};
  (0, _objectKeys.default)(originalDetail).forEach(key => {
    // @ts-ignore
    copyDetail[key] = Array.isArray(originalDetail[key]) ? originalDetail[key].map(value => value) : originalDetail[key];
  });
  return copyDetail;
};
var _default = exports.default = cloneDescriptorDetail;
},{"../objects/objectKeys":324,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.for-each.js":227,"core-js/modules/esnext.iterator.map.js":228}],280:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.array.includes.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.every.js");
require("core-js/modules/esnext.iterator.find.js");
require("core-js/modules/esnext.iterator.some.js");
/**
 * Check if two descriptors are the same or similar, in that the smaller one's keys are all present in the larger
 * one and their types line up - used to detect when a newly-described value actually matches a descriptor already
 * in the map, so it can be pointed at instead of creating a duplicate.
 * @param descriptor1 - The first descriptor to compare.
 * @param descriptor2 - The second descriptor to compare.
 * @returns True if the descriptors describe a compatible shape.
 */
const compareDescriptor = (descriptor1, descriptor2) => {
  if (descriptor1.isArray !== descriptor2.isArray) {
    return false;
  }
  if (descriptor1.length === 0 || descriptor2.length === 0) {
    return descriptor1.length === descriptor2.length;
  }
  const smallerDescriptor = descriptor1.length <= descriptor2.length ? descriptor1 : descriptor2;
  const largerDescriptor = descriptor2.length >= descriptor1.length ? descriptor2 : descriptor1;
  return smallerDescriptor.keys.every(key => largerDescriptor.keys.includes(key)) ? smallerDescriptor.details.every(detail => detail.type.some(type => largerDescriptor.details.find(foundDetail => foundDetail.key === detail.key).type.includes(type))) : false;
};
var _default = exports.default = compareDescriptor;
},{"core-js/modules/es.array.includes.js":208,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.every.js":224,"core-js/modules/esnext.iterator.find.js":226,"core-js/modules/esnext.iterator.some.js":230}],281:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _assignDescriptorDetail = _interopRequireDefault(require("./assignDescriptorDetail"));
var _describeObjectDetail = _interopRequireDefault(require("./describeObjectDetail"));
var _objectKeys = _interopRequireDefault(require("../objects/objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Trace a single object or array (not its nested objects/arrays - see
 * {@link module:objectDescriptors.describeObjectMap} for that) and return the descriptor which defines its own
 * structure and attributes.
 * @param object - The object or array to describe.
 */
const describeObject = object => {
  const descriptor = {
    index: 0,
    details: [],
    length: 0,
    keys: [],
    references: [],
    isArray: false,
    complete: false
  };
  const keys = (0, _objectKeys.default)(object);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    // @ts-ignore
    const newDetail = (0, _describeObjectDetail.default)(object[key], key, descriptor.length++);
    if (typeof key === 'number' && descriptor.details.length) {
      descriptor.details[0] = (0, _assignDescriptorDetail.default)(descriptor.details[0], newDetail);
      descriptor.keys = [0];
      if (newDetail.isReference) {
        descriptor.references = [0];
      }
      continue;
    }
    descriptor.details.push(newDetail);
    descriptor.keys.push(newDetail.key);
    if (newDetail.isReference) {
      descriptor.references.push(newDetail.index);
    }
  }
  descriptor.isArray = Array.isArray(object);
  descriptor.complete = !descriptor.references.length;
  return descriptor;
};
var _default = exports.default = describeObject;
},{"../objects/objectKeys":324,"./assignDescriptorDetail":275,"./describeObjectDetail":282}],282:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _emptyObject = _interopRequireDefault(require("../objects/emptyObject"));
var _isCloneable = _interopRequireDefault(require("../objects/isCloneable"));
var _isInstanceObject = _interopRequireDefault(require("../objects/isInstanceObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Trace a single property's value and produce the descriptorDetail describing it (type, nullability, whether it
 * references a nested object/array, etc.) - the per-property building block used by
 * {@link module:objectDescriptors.describeObject}.
 * @param value - The property's value to describe.
 * @param key - The property name (or array index) this value belongs to.
 * @param index - This detail's intended position within its parent descriptor's `details` array.
 */
const describeObjectDetail = (value, key = 0, index = 0) => {
  const type = typeof value;
  return {
    index,
    key,
    type: [type],
    value: [value],
    nullable: value === null,
    optional: false,
    circular: false,
    isReference: (0, _isCloneable.default)(value) && !(0, _emptyObject.default)(value),
    isInstance: (0, _isInstanceObject.default)(value),
    arrayReference: null,
    objectReference: null
  };
};
var _default = exports.default = describeObjectDetail;
},{"../objects/emptyObject":314,"../objects/isCloneable":316,"../objects/isInstanceObject":318}],283:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
require("core-js/modules/esnext.iterator.for-each.js");
var _assignDescriptor = _interopRequireDefault(require("./assignDescriptor"));
var _checkClearValues = _interopRequireDefault(require("./checkClearValues"));
var _checkDescriptorComplete = _interopRequireDefault(require("./checkDescriptorComplete"));
var _compareDescriptor = _interopRequireDefault(require("./compareDescriptor"));
var _describeObject = _interopRequireDefault(require("./describeObject"));
var _nextReference = _interopRequireDefault(require("./nextReference"));
var _sameDescriptor = _interopRequireDefault(require("./sameDescriptor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Trace out the entire object including nested objects, producing a flat descriptorMap - see the
 * {@link module:objectDescriptors} module description for what a descriptor represents and why it's flat. This is
 * the main entry point into this module: start here to describe a real object/array before comparing, merging, or
 * inspecting its structure with the other functions in this module.
 * @example
 * describeObjectMap({ name: 'example', tags: ['a', 'b'] })
 * // [
 * //   { index: 0, details: [...], length: 2, keys: ['name', 'tags'], references: [1], isArray: false, complete: true },
 * //   { index: 1, details: [...], length: 2, keys: [0], references: [], isArray: true, complete: true }
 * // ]
 * // descriptorMap[0] describes the top-level object; its 'tags' property is a reference (references: [1]) to
 * // descriptorMap[1], which separately describes that nested array. descriptorMap[1]'s own `length` (2) reflects
 * // the array's actual length, but `keys` has only one entry (0) since both elements share the same type
 * // ('string') and are described together by a single, representative descriptorDetail.
 * @param object - The real object or array to describe.
 * @param options
 * @param options.mapLimit - Stop describing further nested references once the map reaches
 * this many descriptors - a safety limit for extremely large or deeply-referenced structures.
 * @param options.depthLimit - How many levels of nested objects/arrays to describe; `-1` means no
 * limit, `0` describes only the top level, etc.
 * @param options.keepValues - By default, each detail's actual values are cleared once its
 * descriptor is complete (to save memory) - set true to keep them.
 */
const describeObjectMap = (object, {
  mapLimit = 1000000000,
  depthLimit = -1,
  keepValues = false
} = {}) => {
  const descriptorMap = [(0, _describeObject.default)(object)];
  descriptorMap[0].index = 0;
  const describeReferences = (descriptor, currentDetail, limit = -1, returnCallback = returnMap => returnMap) => {
    let index = descriptorMap.length;
    const nextRef = currentDetail ? (0, _nextReference.default)(descriptor, currentDetail.index) : undefined;
    const nextDetail = typeof nextRef !== 'undefined' ? descriptor.details[nextRef] : null;
    if (currentDetail) {
      const vals = descriptor.isArray ? currentDetail.value : [currentDetail.value[currentDetail.value.length - 1]];
      vals.forEach(val => {
        const tempDescriptor = (0, _describeObject.default)(val);
        const existingDescriptorIndex = descriptorMap.findIndex(existingDescriptor => (0, _compareDescriptor.default)(tempDescriptor, existingDescriptor));
        if (existingDescriptorIndex >= 0) {
          index = existingDescriptorIndex;
          if (tempDescriptor.length && (0, _sameDescriptor.default)(tempDescriptor, descriptorMap[existingDescriptorIndex])) {
            currentDetail.circular = true;
            descriptor.details[currentDetail.index] = currentDetail;
          }
        }
        if (index >= mapLimit) {
          return descriptorMap;
        }
        if (limit === 0) {
          return descriptorMap;
        }
        if (tempDescriptor.isArray) {
          index = currentDetail.arrayReference ?? index;
          descriptor.details[currentDetail.index].arrayReference = index;
        } else {
          index = currentDetail.objectReference ?? index;
          descriptor.details[currentDetail.index].objectReference = index;
        }
        tempDescriptor.index = index;
        if (existingDescriptorIndex < 0) {
          descriptorMap[index] = descriptorMap[index] ? (0, _assignDescriptor.default)(descriptorMap[index], tempDescriptor) : tempDescriptor;
        }
        descriptorMap[descriptor.index] = (0, _assignDescriptor.default)(descriptorMap[descriptor.index], descriptor);
        currentDetail = descriptorMap[descriptor.index].details.find(detail => detail.key === currentDetail.key);
        if (!currentDetail.circular) {
          const newReference = (0, _nextReference.default)(tempDescriptor, -1);
          const newDetail = typeof newReference !== 'undefined' ? tempDescriptor.details[newReference] : null;
          return describeReferences(tempDescriptor, newDetail, --limit, returnMap => describeReferences(descriptor, nextDetail, --limit));
        }
      });
    }
    descriptorMap[descriptor.index] = (0, _assignDescriptor.default)(descriptorMap[descriptor.index], (0, _checkDescriptorComplete.default)(descriptor));
    descriptorMap[descriptor.index] = (0, _checkClearValues.default)(descriptorMap[descriptor.index], keepValues);
    return nextDetail ? describeReferences(descriptor, nextDetail, --limit) : returnCallback(descriptorMap);
  };
  const descriptor = descriptorMap[0];
  const currentReference = (0, _nextReference.default)(descriptor, -1);
  if (typeof currentReference === 'undefined') {
    descriptorMap[0] = (0, _assignDescriptor.default)(descriptorMap[0], (0, _checkDescriptorComplete.default)(descriptor));
    descriptorMap[0] = (0, _checkClearValues.default)(descriptorMap[0], keepValues);
    return descriptorMap;
  }
  return describeReferences(descriptor, descriptor.details[currentReference], depthLimit);
};
var _default = exports.default = describeObjectMap;
},{"./assignDescriptor":274,"./checkClearValues":276,"./checkDescriptorComplete":277,"./compareDescriptor":280,"./describeObject":281,"./nextReference":284,"./sameDescriptor":285,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226,"core-js/modules/esnext.iterator.for-each.js":227}],284:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.find.js");
var _objectKeys = _interopRequireDefault(require("../objects/objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Find the index (within `descriptor.details`) of the next referenced property - after `currentReference` - whose
 * own nested object/array still needs its descriptor built. Used to walk through a descriptor's references one at
 * a time while building out a descriptorMap.
 * @param descriptor - The descriptor whose references to search.
 * @param currentReference - The `details` index already processed - search continues after this one.
 * @returns The next detail index to process, or `undefined` if none remain.
 */
const nextReference = (descriptor, currentReference) => descriptor.references.find(nextRef => {
  if (nextRef <= currentReference) {
    return false;
  }
  const val = descriptor.details[nextRef].value[descriptor.details[nextRef].value.length - 1];
  if (typeof val !== 'object' || val === null || typeof val === 'undefined' || descriptor.details[nextRef].circular || descriptor.details[nextRef].isInstance) {
    return false;
  }
  return !!(0, _objectKeys.default)(val).length;
});
var _default = exports.default = nextReference;
},{"../objects/objectKeys":324,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.find.js":226}],285:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.array.includes.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.every.js");
require("core-js/modules/esnext.iterator.some.js");
/**
 * Check if two descriptors describe the exact same underlying values (not just compatible types, like
 * {@link module:objectDescriptors.compareDescriptor} does) - used to detect genuine circular references, where a
 * nested value's descriptor turns out to be identical to one of its own ancestors.
 * @param descriptor1 - The first descriptor to compare.
 * @param descriptor2 - The second descriptor to compare.
 * @returns True if every detail's values match at the same position.
 */
const sameDescriptor = (descriptor1, descriptor2) => descriptor1.details.every((detail, index) => detail.value.some(dVal => descriptor2.details[index].value.includes(dVal)));
var _default = exports.default = sameDescriptor;
},{"core-js/modules/es.array.includes.js":208,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.every.js":224,"core-js/modules/esnext.iterator.some.js":230}],286:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "callWithParams", {
  enumerable: true,
  get: function () {
    return _callWithParams.default;
  }
});
Object.defineProperty(exports, "curry", {
  enumerable: true,
  get: function () {
    return _curry.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "delay", {
  enumerable: true,
  get: function () {
    return _delay.default;
  }
});
Object.defineProperty(exports, "makeBasicQueue", {
  enumerable: true,
  get: function () {
    return _makeBasicQueue.default;
  }
});
Object.defineProperty(exports, "onBodyLoad", {
  enumerable: true,
  get: function () {
    return _onBodyLoad.default;
  }
});
Object.defineProperty(exports, "pipe", {
  enumerable: true,
  get: function () {
    return _pipe.default;
  }
});
Object.defineProperty(exports, "preloadParams", {
  enumerable: true,
  get: function () {
    return _preloadParams.default;
  }
});
Object.defineProperty(exports, "queueManager", {
  enumerable: true,
  get: function () {
    return _queueManager.default;
  }
});
Object.defineProperty(exports, "queueTimeout", {
  enumerable: true,
  get: function () {
    return _queueTimeout.default;
  }
});
Object.defineProperty(exports, "relevancyFilter", {
  enumerable: true,
  get: function () {
    return _relevancyFilter.default;
  }
});
Object.defineProperty(exports, "trace", {
  enumerable: true,
  get: function () {
    return _trace.default;
  }
});
var _callWithParams = _interopRequireDefault(require("./functions/callWithParams"));
var _curry = _interopRequireDefault(require("./functions/curry"));
var _delay = _interopRequireDefault(require("./functions/delay"));
var _makeBasicQueue = _interopRequireDefault(require("./functions/makeBasicQueue"));
var _onBodyLoad = _interopRequireDefault(require("./functions/onBodyLoad"));
var _pipe = _interopRequireDefault(require("./functions/pipe"));
var _preloadParams = _interopRequireDefault(require("./functions/preloadParams"));
var _queueManager = _interopRequireDefault(require("./functions/queueManager"));
var _queueTimeout = _interopRequireDefault(require("./functions/queueTimeout"));
var _relevancyFilter = _interopRequireDefault(require("./functions/relevancyFilter"));
var _trace = _interopRequireDefault(require("./functions/trace"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Manage how functions are called with these utilities.
 */
var _default = exports.default = {
  callWithParams: _callWithParams.default,
  curry: _curry.default,
  delay: _delay.default,
  makeBasicQueue: _makeBasicQueue.default,
  onBodyLoad: _onBodyLoad.default,
  pipe: _pipe.default,
  preloadParams: _preloadParams.default,
  queueManager: _queueManager.default,
  queueTimeout: _queueTimeout.default,
  relevancyFilter: _relevancyFilter.default,
  trace: _trace.default
};
},{"./functions/callWithParams":287,"./functions/curry":288,"./functions/delay":289,"./functions/makeBasicQueue":290,"./functions/onBodyLoad":291,"./functions/pipe":292,"./functions/preloadParams":293,"./functions/queueManager":294,"./functions/queueTimeout":295,"./functions/relevancyFilter":296,"./functions/trace":297}],287:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Given a function, call with the correct number of parameters from an array of possible parameters.
 * @param fn - The function to be called
 * @param params - Array of possible function parameters
 * @param minimum - Minimum number of parameters to use in the function
 */
const callWithParams = (fn, params = [], minimum = 2) => fn(...params.slice(0, fn.length || minimum));
var _default = exports.default = callWithParams;
},{}],288:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Return a curried version of the passed function.
 * The returned function expects the same number of arguments minus the ones provided.
 * fn is the name of the function being curried.
 * @param fn - Receives a function to be curried
 */
const curry = fn => (...args) => args.length >= fn.length ? fn(...args) : (...a) => curry(fn)(...[...args, ...a]);
var _default = exports.default = curry;
},{}],289:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("regenerator-runtime/runtime");
/**
 * Provide a timeout which returns a promise.
 * @param time - Delay in milliseconds
 */
const delay = (time = 0) => {
  let cancel = () => undefined;
  return {
    resolver: new Promise((resolve, reject) => {
      if (isNaN(time)) {
        reject(new Error(`Invalid delay: ${time}`));
      } else {
        const timeoutId = setTimeout(resolve, time, `Delayed for: ${time}`);
        cancel = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Cancelled delay: ${time}`));
        };
      }
    }),
    cancel
  };
};
var _default = exports.default = delay;
},{"regenerator-runtime/runtime":264}],290:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _BasicQueue = _interopRequireDefault(require("../arrays/BasicQueue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Create an instance of a basic queue.
 * @param initialQueue - Items to pre-populate the queue with, in order.
 */
const makeBasicQueue = (initialQueue = []) => {
  return new _BasicQueue.default(initialQueue);
};
var _default = exports.default = makeBasicQueue;
},{"../arrays/BasicQueue":266}],291:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _queueManager = _interopRequireDefault(require("./queueManager"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const queue = [];
const manager = (0, _queueManager.default)();
manager.start();
let observer = null;
const doReset = () => observer = null;
const initializeObserver = async () => {
  observer = new MutationObserver(() => {
    if (document.body) {
      while (queue.length) {
        manager.push(queue.shift());
      }
      observer.disconnect();
      doReset();
    }
  });
  observer.observe(document.documentElement, {
    childList: true
  });
  return observer;
};
/**
 * Prepare functions to be called once the body is available.
 * @param callback
 * @param reset
 */
const onBodyLoad = (callback, reset = false) => {
  if (reset) {
    doReset();
  }
  queue.push(callback);
  if (observer === null) {
    initializeObserver();
  }
  return queue;
};
var _default = exports.default = onBodyLoad;
},{"./queueManager":294}],292:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
/**
 * Take one or more function with a single parameter and return value.
 * Pass a parameter and the value will be transformed by each function then returned.
 * @param fns - Takes a series of functions having the same parameter
 */
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
var _default = exports.default = pipe;
},{"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],293:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Provide an array of parameters to be used with a function, allow the function to be called later
 * with the missing parameter.
 * @param fn - The function to be called
 * @param params - The parameters to preload
 * @param unassignedParam - Position of missing parameter (zero indexed)
 */
const preloadParams = (fn, params = [], unassignedParam = 0) => missing => {
  params.splice(unassignedParam, 0, missing);
  return fn(...params);
};
var _default = exports.default = preloadParams;
},{}],294:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.for-each.js");
require("regenerator-runtime/runtime");
var _makeBasicQueue = _interopRequireDefault(require("./makeBasicQueue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Manage functions to run sequentially.
 * @param queue - The queue to manage. Pass a plain array to have it converted into a
 * {@link module:arrayHelpers.BasicQueue} automatically, or a custom queue implementing `IsQueue`; omit it (or pass
 * `null`) to have one created for you.
 */
const queueManager = (queue = null) => {
  let isRunning = false;
  let isPaused = true;
  /**
   * Convert a function to a queueable object.
   * @param resolve
   * @param reject
   * @param fn
   * @param args
   */
  const makeQueuedRunnable = (resolve, reject, fn, ...args) => {
    const generator = function* () {
      const item = yield;
      if (typeof item.fn !== 'function') {
        return reject(item);
      }
      try {
        return resolve(item.fn(...item.args));
      } catch (error) {
        // A function which throws rejects its own promise (as one which returns a rejected promise does), instead of
        // throwing out of whichever function happened to finish just before it and starting the next item.
        return reject(error);
      }
    }();
    // Prepare the generator to be used on the subsequent call
    generator.next();
    return {
      item: {
        fn,
        args
      },
      generator
    };
  };
  /**
   * After an item is run, THEN run this function to reset isRunning
   * @param result
   */
  const postRun = result => {
    isRunning = false;
    runNextItem();
    return result;
  };
  /**
   * When a queued function throws (or returns a promise which rejects), carry on with the rest of the queue and pass the
   * error on to whoever queued it - otherwise the queue would stay marked as running and never start another function.
   * @param error
   * @throws {*} The same error
   */
  const postFailedRun = error => {
    isRunning = false;
    runNextItem();
    throw error;
  };
  /**
   * When ready, runs the next queued runnable generator.
   */
  const runNextItem = () => {
    if (!isPaused && !queue.empty() && !isRunning) {
      isRunning = true;
      let toRun = queue.dequeue();
      if (typeof toRun === 'undefined' || toRun === null) {
        return null;
      }
      if (typeof toRun === 'function') {
        new Promise((resolve, reject) => {
          toRun = makeQueuedRunnable(resolve, reject, toRun);
          runNextItem();
        }).then(postRun, postFailedRun);
      }
      if ('success' in toRun) {
        // Some run responses return an object with 'success' property.
        console.info(toRun.success);
        return null;
      }
      if (!toRun.generator || 'error' in toRun) {
        // Some run responses return an object with an 'error' property
        let errorMessage = 'Verify queued function implements "done()" state.';
        if ('error' in toRun && toRun.error) {
          errorMessage = `[${toRun.error}]: ${errorMessage}`;
        }
        throw new Error(errorMessage);
      }
      if (toRun.generator && toRun.item) {
        // Ensure the returned result has both the generator and the item to be valid
        return toRun.generator.next(toRun.item);
      }
    }
    return null;
  };
  /**
   * Add a function into the queue to be run when ready.
   * @param fn - The function to run when ready
   * @param args - Optional arguments to apply when the function is ready to be run
   * @returns Promise
   */
  const pushAnother = (fn, ...args) => new Promise((resolve, reject) => {
    queue.enqueue(makeQueuedRunnable(resolve, reject, fn, ...args));
    runNextItem();
  }).then(postRun, postFailedRun);
  if (Array.isArray(queue)) {
    const queueArray = queue;
    queue = (0, _makeBasicQueue.default)();
    queueArray.forEach(queued => pushAnother(queued));
  }
  if (queue === null) {
    queue = (0, _makeBasicQueue.default)();
  }
  runNextItem();
  return {
    start: () => {
      isPaused = false;
      runNextItem();
    },
    pause: () => {
      isPaused = true;
    },
    push: pushAnother
  };
};
var _default = exports.default = queueManager;
},{"./makeBasicQueue":290,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.for-each.js":227,"regenerator-runtime/runtime":264}],295:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("regenerator-runtime/runtime");
var _delay = _interopRequireDefault(require("./delay"));
var _queueManager = _interopRequireDefault(require("./queueManager"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Manage functions to run sequentially with delays.
 * @param queueManagerHandle
 */
const queueTimeout = (queueManagerHandle = null) => {
  const manager = queueManagerHandle || (0, _queueManager.default)();
  manager.start();
  return (fn, time = 0, ...args) => manager.push(() => (0, _delay.default)(time).resolver.then(() => fn(...args)));
};
var _default = exports.default = queueTimeout;
},{"./delay":289,"./queueManager":294,"regenerator-runtime/runtime":264}],296:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.map.js");
/**
 * Remove elements out of relevance range and update the max relevance.
 * @param map
 * @param options
 * @param options.mapLimit - Only filter once the map exceeds this many entries.
 * @param options.relevancyRange - How many of the most-recent relevance values to keep.
 */
const relevancyFilter = (map, {
  mapLimit = 1000,
  relevancyRange = 100
} = {}) => {
  if (map.length <= mapLimit) {
    return map;
  }
  const minRelevance = map.length - relevancyRange;
  const filtered = map.filter(reference => reference.relevance >= minRelevance);
  return filtered.map(reference => {
    reference.relevance = reference.relevance > filtered.length ? filtered.length : reference.relevance;
    return reference;
  });
};
var _default = exports.default = relevancyFilter;
},{"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.map.js":228}],297:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("regenerator-runtime/runtime");
var _cloneObject = _interopRequireDefault(require("../objects/cloneObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Output the value with label to the console and return the value to not interrupt the code - useful for
 * inspecting a value mid-pipe/mid-chain without altering the result.
 * @param label - Pass an identifying label of the value being output.
 * @param useClone - Determines if the logged data should be a clone of the original to preserve
 * its state at the time of logging (rather than a live reference that may show later mutations).
 */
const trace = (label, useClone = true) => value => {
  // noinspection JSForgottenDebugStatementInspection
  console.info(`${label}: `, useClone ? (0, _cloneObject.default)(value) : value);
  return value;
};
var _default = exports.default = trace;
},{"../objects/cloneObject":309,"regenerator-runtime/runtime":264}],298:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "absoluteMax", {
  enumerable: true,
  get: function () {
    return _absoluteMax.default;
  }
});
Object.defineProperty(exports, "absoluteMin", {
  enumerable: true,
  get: function () {
    return _absoluteMin.default;
  }
});
Object.defineProperty(exports, "compare", {
  enumerable: true,
  get: function () {
    return _compare.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "greatestCommonDivisor", {
  enumerable: true,
  get: function () {
    return _greatestCommonDivisor.default;
  }
});
Object.defineProperty(exports, "leastCommonMultiple", {
  enumerable: true,
  get: function () {
    return _leastCommonMultiple.default;
  }
});
Object.defineProperty(exports, "lowestCommonDenominator", {
  enumerable: true,
  get: function () {
    return _lowestCommonDenominator.default;
  }
});
Object.defineProperty(exports, "randomInteger", {
  enumerable: true,
  get: function () {
    return _randomInteger.default;
  }
});
Object.defineProperty(exports, "randomNumber", {
  enumerable: true,
  get: function () {
    return _randomNumber.default;
  }
});
Object.defineProperty(exports, "simplestRatio", {
  enumerable: true,
  get: function () {
    return _simplestRatio.default;
  }
});
var _absoluteMax = _interopRequireDefault(require("./numbers/absoluteMax"));
var _absoluteMin = _interopRequireDefault(require("./numbers/absoluteMin"));
var _compare = _interopRequireDefault(require("./numbers/compare"));
var _greatestCommonDivisor = _interopRequireDefault(require("./numbers/greatestCommonDivisor"));
var _leastCommonMultiple = _interopRequireDefault(require("./numbers/leastCommonMultiple"));
var _lowestCommonDenominator = _interopRequireDefault(require("./numbers/lowestCommonDenominator"));
var _randomInteger = _interopRequireDefault(require("./numbers/randomInteger"));
var _randomNumber = _interopRequireDefault(require("./numbers/randomNumber"));
var _simplestRatio = _interopRequireDefault(require("./numbers/simplestRatio"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Some number comparators and random number generators.
 */
var _default = exports.default = {
  absoluteMax: _absoluteMax.default,
  absoluteMin: _absoluteMin.default,
  compare: _compare.default,
  greatestCommonDivisor: _greatestCommonDivisor.default,
  leastCommonMultiple: _leastCommonMultiple.default,
  lowestCommonDenominator: _lowestCommonDenominator.default,
  randomInteger: _randomInteger.default,
  randomNumber: _randomNumber.default,
  simplestRatio: _simplestRatio.default
};
},{"./numbers/absoluteMax":299,"./numbers/absoluteMin":300,"./numbers/compare":301,"./numbers/greatestCommonDivisor":302,"./numbers/leastCommonMultiple":303,"./numbers/lowestCommonDenominator":304,"./numbers/randomInteger":305,"./numbers/randomNumber":306,"./numbers/simplestRatio":307}],299:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Helper for returning the absolute max value
 * @param num1 - A number to compare
 * @param num2 - Another number to be compared against
 */
const absoluteMax = (num1, num2) => Math.abs(num1) > Math.abs(num2) ? num1 : num2;
var _default = exports.default = absoluteMax;
},{}],300:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Helper for returning the absolute min value
 * @param num1 - A number to compare
 * @param num2 - Another number to be compared against
 */
const absoluteMin = (num1, num2) => Math.abs(num1) < Math.abs(num2) ? num1 : num2;
var _default = exports.default = absoluteMin;
},{}],301:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Compare two numbers and return:
 * -1 to indicate val1 is less than val2
 * 0 to indicate both values are the equal
 * 1 to indicate val1 is greater than val2
 * @param val1 - The first number to compare
 * @param val2 - The second number to compare
 */
const compare = (val1, val2) => val1 === val2 ? 0 : val1 > val2 ? 1 : -1;
var _default = exports.default = compare;
},{}],302:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Return the highest number that can be divided into both numbers.
 * @param num1 - First number to assess
 * @param num2 - Second number to compare for common divisor
 */
const greatestCommonDivisor = (num1, num2) => num2 === 0 ? num1 : greatestCommonDivisor(num2, num1 % num2);
var _default = exports.default = greatestCommonDivisor;
},{}],303:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _greatestCommonDivisor = _interopRequireDefault(require("./greatestCommonDivisor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Helper for calculating the multiplier that would make each number relative to each other.
 * @param num1 - A number to compare
 * @param num2 - Another number to be compared against
 */
const leastCommonMultiple = (num1, num2) => num1 === 0 || num2 === 0 ? 0 : num1 * num2 / (0, _greatestCommonDivisor.default)(num1, num2);
var _default = exports.default = leastCommonMultiple;
},{"./greatestCommonDivisor":302}],304:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _leastCommonMultiple = _interopRequireDefault(require("./leastCommonMultiple"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Find the smallest number that all the given numbers divide into evenly, by reducing them pairwise with
 * leastCommonMultiple.
 * @param numbers - Two or more numbers to find the lowest common denominator of.
 */
const lowestCommonDenominator = (...numbers) => numbers.reduce((num1, num2) => (0, _leastCommonMultiple.default)(num1, num2), 1);
var _default = exports.default = lowestCommonDenominator;
},{"./leastCommonMultiple":303,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],305:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Create a single random integer from a set of `range` possible values, starting at the optional offset.
 * With no offset the result is 0 to range - 1 (so range is the number of possible values, the same as an array length
 * when choosing an index). The distance between the result numbers can be adjusted with interval.
 * @example
 * randomInteger(1) // always 0 (one possible value)
 * randomInteger(2) // 0 or 1
 * randomInteger(3, 1, 5) // 5, 10 or 15
 * items[randomInteger(items.length)] // a random valid index
 * @param range - The number of possible values (0-99 would be 100 for range)
 * @param offset - Choose the starting number (1-10 would be 1 for offset, 10 for range)
 * @param interval - Choose the distance between numbers (5, 10, 15 would be 5 for interval, 1 for
 * offset, 3 for range)
 */
const randomInteger = (range, offset = 0, interval = 1) => (Math.floor(Math.random() * range) + offset) * interval;
var _default = exports.default = randomInteger;
},{}],306:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Create a single random number from offset up to (but never including) offset + range. With optional offset,
 * the distance between the result numbers can be adjusted with interval. Matches randomInteger, which gives the
 * whole numbers of the same span.
 * @param range - Choose the breadth of the random number (0 up to, but not including, 100 would be 100 for range)
 * @param offset - Choose the starting number (1 up to, but not including, 10 would be 1 for offset, 9 for range)
 * @param interval - Choose the multiplier applied to the result (~5, ~10, ~15 would be 5 for interval,
 * 1 for offset, 2 for range)
 */
const randomNumber = (range, offset = 0, interval = 1) => (Math.random() * range + offset) * interval;
var _default = exports.default = randomNumber;
},{}],307:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _greatestCommonDivisor = _interopRequireDefault(require("./greatestCommonDivisor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Reduce several numbers to their simplest form / ratio
 * @param numbers - Array of numbers to simplify
 */
const simplestRatio = (...numbers) => {
  if (numbers.length === 0) {
    return [];
  }
  let commonDivisor = numbers.reduce((num1, num2) => (0, _greatestCommonDivisor.default)(num1, num2), 0);
  // Set to positive so that when we divide the numbers they retain their +/-
  commonDivisor = Math.abs(commonDivisor);
  // Simplify the numbers, handle zero
  return numbers.map(num => commonDivisor === 0 ? 0 : num / commonDivisor);
};
var _default = exports.default = simplestRatio;
},{"./greatestCommonDivisor":302,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229}],308:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "cloneObject", {
  enumerable: true,
  get: function () {
    return _cloneObject.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "dotGet", {
  enumerable: true,
  get: function () {
    return _dotGet.default;
  }
});
Object.defineProperty(exports, "dotNotate", {
  enumerable: true,
  get: function () {
    return _dotNotate.default;
  }
});
Object.defineProperty(exports, "dotSet", {
  enumerable: true,
  get: function () {
    return _dotSet.default;
  }
});
Object.defineProperty(exports, "dotUnset", {
  enumerable: true,
  get: function () {
    return _dotUnset.default;
  }
});
Object.defineProperty(exports, "emptyObject", {
  enumerable: true,
  get: function () {
    return _emptyObject.default;
  }
});
Object.defineProperty(exports, "filterObject", {
  enumerable: true,
  get: function () {
    return _filterObject.default;
  }
});
Object.defineProperty(exports, "isCloneable", {
  enumerable: true,
  get: function () {
    return _isCloneable.default;
  }
});
Object.defineProperty(exports, "isEqual", {
  enumerable: true,
  get: function () {
    return _isEqual.default;
  }
});
Object.defineProperty(exports, "isInstanceObject", {
  enumerable: true,
  get: function () {
    return _isInstanceObject.default;
  }
});
Object.defineProperty(exports, "isObject", {
  enumerable: true,
  get: function () {
    return _isObject.default;
  }
});
Object.defineProperty(exports, "mapObject", {
  enumerable: true,
  get: function () {
    return _mapObject.default;
  }
});
Object.defineProperty(exports, "mergeObjects", {
  enumerable: true,
  get: function () {
    return _mergeObjects.default;
  }
});
Object.defineProperty(exports, "mergeObjectsBase", {
  enumerable: true,
  get: function () {
    return _mergeObjectsBase.default;
  }
});
Object.defineProperty(exports, "mergeObjectsMutable", {
  enumerable: true,
  get: function () {
    return _mergeObjectsMutable.default;
  }
});
Object.defineProperty(exports, "objectKeys", {
  enumerable: true,
  get: function () {
    return _objectKeys.default;
  }
});
Object.defineProperty(exports, "objectValues", {
  enumerable: true,
  get: function () {
    return _objectValues.default;
  }
});
Object.defineProperty(exports, "reduceObject", {
  enumerable: true,
  get: function () {
    return _reduceObject.default;
  }
});
Object.defineProperty(exports, "setAndReturnValue", {
  enumerable: true,
  get: function () {
    return _setAndReturnValue.default;
  }
});
Object.defineProperty(exports, "setValue", {
  enumerable: true,
  get: function () {
    return _setValue.default;
  }
});
var _cloneObject = _interopRequireDefault(require("./objects/cloneObject"));
var _dotGet = _interopRequireDefault(require("./objects/dotGet"));
var _dotNotate = _interopRequireDefault(require("./objects/dotNotate"));
var _dotSet = _interopRequireDefault(require("./objects/dotSet"));
var _dotUnset = _interopRequireDefault(require("./objects/dotUnset"));
var _emptyObject = _interopRequireDefault(require("./objects/emptyObject"));
var _filterObject = _interopRequireDefault(require("./objects/filterObject"));
var _isCloneable = _interopRequireDefault(require("./objects/isCloneable"));
var _isEqual = _interopRequireDefault(require("./objects/isEqual"));
var _isInstanceObject = _interopRequireDefault(require("./objects/isInstanceObject"));
var _isObject = _interopRequireDefault(require("./objects/isObject"));
var _mapObject = _interopRequireDefault(require("./objects/mapObject"));
var _mergeObjects = _interopRequireDefault(require("./objects/mergeObjects"));
var _mergeObjectsBase = _interopRequireDefault(require("./objects/mergeObjectsBase"));
var _mergeObjectsMutable = _interopRequireDefault(require("./objects/mergeObjectsMutable"));
var _objectKeys = _interopRequireDefault(require("./objects/objectKeys"));
var _objectValues = _interopRequireDefault(require("./objects/objectValues"));
var _reduceObject = _interopRequireDefault(require("./objects/reduceObject"));
var _setAndReturnValue = _interopRequireDefault(require("./objects/setAndReturnValue"));
var _setValue = _interopRequireDefault(require("./objects/setValue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Simplify working with object by providing array-like parsing. Also, provides cloning and merging along with accessors that always have a return value for optimal nesting.
 */
var _default = exports.default = {
  cloneObject: _cloneObject.default,
  dotGet: _dotGet.default,
  dotNotate: _dotNotate.default,
  dotSet: _dotSet.default,
  dotUnset: _dotUnset.default,
  emptyObject: _emptyObject.default,
  filterObject: _filterObject.default,
  isCloneable: _isCloneable.default,
  isEqual: _isEqual.default,
  isInstanceObject: _isInstanceObject.default,
  isObject: _isObject.default,
  mapObject: _mapObject.default,
  mergeObjects: _mergeObjects.default,
  mergeObjectsBase: _mergeObjectsBase.default,
  mergeObjectsMutable: _mergeObjectsMutable.default,
  objectKeys: _objectKeys.default,
  objectValues: _objectValues.default,
  reduceObject: _reduceObject.default,
  setAndReturnValue: _setAndReturnValue.default,
  setValue: _setValue.default
};
},{"./objects/cloneObject":309,"./objects/dotGet":310,"./objects/dotNotate":311,"./objects/dotSet":312,"./objects/dotUnset":313,"./objects/emptyObject":314,"./objects/filterObject":315,"./objects/isCloneable":316,"./objects/isEqual":317,"./objects/isInstanceObject":318,"./objects/isObject":319,"./objects/mapObject":320,"./objects/mergeObjects":321,"./objects/mergeObjectsBase":322,"./objects/mergeObjectsMutable":323,"./objects/objectKeys":324,"./objects/objectValues":325,"./objects/reduceObject":326,"./objects/setAndReturnValue":327,"./objects/setValue":328}],309:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mergeObjectsBase = _interopRequireDefault(require("./mergeObjectsBase"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Clone objects for manipulation without data corruption, returns a copy of the provided object.
 * @param object - The original object that is being cloned
 * @param options
 * @param options.mapLimit - Deprecated and ignored (circular references are handled without trimming).
 * @param options.depthLimit - Control how many nested levels deep will be used, -1 = no limit, >-1 = nth level limited.
 * @param options.relevancyRange - Deprecated and ignored: see mapLimit.
 */
const cloneObject = (object, {
  mapLimit = 100,
  depthLimit = -1,
  relevancyRange = 1000
} = {}) => (0, _mergeObjectsBase.default)({
  mapLimit,
  depthLimit,
  relevancyRange,
  useClone: true
})(object);
var _default = exports.default = cloneObject;
},{"./mergeObjectsBase":322}],310:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isObject = _interopRequireDefault(require("./isObject"));
var _strAfter = _interopRequireDefault(require("../strings/strAfter"));
var _strBefore = _interopRequireDefault(require("../strings/strBefore"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Get a nested property value from an object.
 * @param arrayObject - The array or object to get the property from
 * @param dotNotation - The path to the property
 * @param defaultValue - The default value to return if the property is not found
 * @returns The value of the property
 */
const dotGet = (arrayObject, dotNotation, defaultValue = null) => {
  let key = (0, _strBefore.default)(dotNotation, '.');
  const lastKey = !key;
  if (lastKey) {
    key = dotNotation;
  }
  if (key === '*') {
    const result = [];
    for (const wildKey in arrayObject) {
      // @ts-ignore
      const wildValue = arrayObject[wildKey];
      if (lastKey) {
        // @ts-ignore
        result[wildKey] = wildValue;
        continue;
      }
      if (!(0, _isObject.default)(wildValue)) {
        continue;
      }
      // @ts-ignore
      result[wildKey] = dotGet(wildValue, (0, _strAfter.default)(dotNotation, '.'), defaultValue);
    }
    return result;
  }
  if (lastKey) {
    // @ts-ignore
    return arrayObject[dotNotation] ?? defaultValue;
  }
  // @ts-ignore
  if (typeof arrayObject[key] === 'undefined') {
    return defaultValue;
  }
  // @ts-ignore
  const next = arrayObject[key];
  if (!(0, _isObject.default)(next)) {
    return defaultValue;
  }
  return dotGet(next, (0, _strAfter.default)(dotNotation, '.'), defaultValue);
};
var _default = exports.default = dotGet;
},{"../strings/strAfter":336,"../strings/strBefore":338,"./isObject":319}],311:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _emptyObject = _interopRequireDefault(require("./emptyObject"));
var _isObject = _interopRequireDefault(require("./isObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Convert an array of keys into a regex, return a function to test if incoming keys match.
 * @inner
 * @param retainObjects - An array of keys to retain as objects
 * @returns The dot-notated array
 */
const handleRetainObjects = (retainObjects = []) => {
  if (!retainObjects.length) {
    /**
     * Bypass the test function if there are no retainObjects.
     */
    return (currentKey, value, results) => false;
  }
  retainObjects = retainObjects.map(key => key.replace('\.', '\\.'));
  const retainRegex = new RegExp(`(${retainObjects.join('|')})$`);
  /**
   * Test if a key should be retained as an object.
   * @param currentKey - The key to test
   * @param value - The value of the key
   * @param results - The results object to add to
   */
  return (currentKey, value, results) => {
    if (!currentKey.match(retainRegex)) {
      return false;
    }
    // @ts-ignore
    results[currentKey] = value;
    return true;
  };
};
/**
 * The underlying logic function for converting arrays to dot-notation.
 * @inner
 * @param arrayObject - The array or object to dot-notate
 * @param didRetain - The test function to see if a key should be retained
 * @param prepend - The path for the property being processed
 * @param results - The final array to return
 * @returns The dot-notated object
 */
const performDotNotate = (arrayObject, didRetain, prepend = '', results = {}) => {
  // @ts-ignore
  for (const key in arrayObject) {
    // @ts-ignore
    const value = arrayObject[key];
    const currentKey = `${prepend}${key}`;
    if (didRetain(currentKey, value, results)) {
      continue;
    }
    // An empty object/array has no keys to flatten into - recursing into one would silently drop currentKey
    // from the result entirely, rather than keeping it as the empty value it actually is. Treat it as a leaf.
    if ((0, _isObject.default)(value) && !(0, _emptyObject.default)(value)) {
      performDotNotate(value, didRetain, `${currentKey}.`, results);
      continue;
    }
    results[currentKey] = value;
  }
  return results;
};
/**
 * Convert an array or object to a single dimensional associative array with dot notation.
 * @param arrayObject - The array or object to dot-notate
 * @param retainObjects - An array of keys to retain as objects
 * @returns The dot-notated object
 */
const dotNotate = (arrayObject, retainObjects = []) => performDotNotate(arrayObject, handleRetainObjects(retainObjects));
var _default = exports.default = dotNotate;
},{"./emptyObject":314,"./isObject":319,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],312:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isObject = _interopRequireDefault(require("./isObject"));
var _strAfter = _interopRequireDefault(require("../strings/strAfter"));
var _strBefore = _interopRequireDefault(require("../strings/strBefore"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Set a nested property value an object.
 * @param arrayObject - The array or object to set the property on
 * @param dotNotation - The path for the property
 * @param value - The default value to return if the property is not found
 * @returns The modified object
 */
const dotSet = (arrayObject, dotNotation, value = null) => {
  let key = (0, _strBefore.default)(dotNotation, '.');
  const lastKey = !key;
  if (lastKey) {
    key = dotNotation;
  }
  if (key === '*') {
    for (const wildKey in arrayObject) {
      if (lastKey) {
        // @ts-ignore
        arrayObject[wildKey] = value;
        continue;
      }
      // @ts-ignore
      if (!(0, _isObject.default)(arrayObject[wildKey])) {
        continue;
      }
      // @ts-ignore
      dotSet(arrayObject[wildKey], (0, _strAfter.default)(dotNotation, '.'), value);
    }
    return arrayObject;
  }
  if (lastKey) {
    // @ts-ignore
    arrayObject[dotNotation] = value;
    return arrayObject;
  }
  // @ts-ignore
  const next = arrayObject[key] ?? [];
  // @ts-ignore
  arrayObject[key] = dotSet(next, (0, _strAfter.default)(dotNotation, '.'), value);
  return arrayObject;
};
var _default = exports.default = dotSet;
},{"../strings/strAfter":336,"../strings/strBefore":338,"./isObject":319}],313:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isObject = _interopRequireDefault(require("./isObject"));
var _strAfter = _interopRequireDefault(require("../strings/strAfter"));
var _strBefore = _interopRequireDefault(require("../strings/strBefore"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Unset a nested property value an object.
 * @param arrayObject - The array or object to set the property on
 * @param dotNotation - The path for the property
 * @returns The modified object
 */
const dotUnset = (arrayObject, dotNotation) => {
  let key = (0, _strBefore.default)(dotNotation, '.');
  const lastKey = !key;
  if (lastKey) {
    key = dotNotation;
  }
  if (key === '*') {
    for (const wildKey in arrayObject) {
      if (lastKey) {
        // @ts-ignore
        delete arrayObject[wildKey];
        continue;
      }
      // @ts-ignore
      if (!(0, _isObject.default)(arrayObject[wildKey])) {
        continue;
      }
      // @ts-ignore
      dotUnset(arrayObject[wildKey], (0, _strAfter.default)(dotNotation, '.'));
    }
    return arrayObject;
  }
  if (lastKey) {
    // @ts-ignore
    delete arrayObject[dotNotation];
    return arrayObject;
  }
  // @ts-ignore
  const next = arrayObject[key] ?? [];
  // @ts-ignore
  arrayObject[key] = dotUnset(next, (0, _strAfter.default)(dotNotation, '.'));
  return arrayObject;
};
var _default = exports.default = dotUnset;
},{"../strings/strAfter":336,"../strings/strBefore":338,"./isObject":319}],314:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isObject = _interopRequireDefault(require("./isObject"));
var _objectKeys = _interopRequireDefault(require("./objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Helper function for testing if the item is an Object or Array that does not have any properties
 * @param item - Object or Array to test
 */
const emptyObject = item => (typeof item === 'function' || (0, _isObject.default)(item)) && !(0, _objectKeys.default)(item).length;
var _default = exports.default = emptyObject;
},{"./isObject":319,"./objectKeys":324}],315:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.filter.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _callWithParams = _interopRequireDefault(require("../functions/callWithParams"));
var _objectKeys = _interopRequireDefault(require("./objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This function is intended to replicate behaviour of the Array.filter() function but for Objects.
 * If an array is passed in instead then it will perform standard filter(). It is recommended to
 * always use the standard filter() function when it is known that the object is actually an array.
 * @param obj - The Object (or Array) to be filtered
 * @param fn - The function to be processed for each filtered property
 * @param thisArg - Optional. Value to use as this when executing callback.
 */
const filterObject = (obj, fn, thisArg = undefined) => Array.isArray(obj) ? obj.filter(fn, thisArg) : (0, _objectKeys.default)(obj, true).reduce((newObj, curr) => {
  if ((0, _callWithParams.default)(fn.bind(thisArg), [obj[curr], curr, obj], 2)) {
    newObj[curr] = obj[curr];
  } else {
    delete newObj[curr];
  }
  return newObj;
}, {});
var _default = exports.default = filterObject;
},{"../functions/callWithParams":287,"./objectKeys":324,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.filter.js":225,"core-js/modules/esnext.iterator.reduce.js":229}],316:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isInstanceObject = _interopRequireDefault(require("./isInstanceObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Determine if the value is a reference instance
 * @param value
 */
const isCloneable = value => typeof value === 'object' && value !== null && !(0, _isInstanceObject.default)(value);
var _default = exports.default = isCloneable;
},{"./isInstanceObject":318}],317:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.regexp.flags.js");
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.every.js");
require("core-js/modules/esnext.iterator.some.js");
require("core-js/modules/esnext.map.delete-all.js");
require("core-js/modules/esnext.map.every.js");
require("core-js/modules/esnext.map.filter.js");
require("core-js/modules/esnext.map.find.js");
require("core-js/modules/esnext.map.find-key.js");
require("core-js/modules/esnext.map.includes.js");
require("core-js/modules/esnext.map.key-of.js");
require("core-js/modules/esnext.map.map-keys.js");
require("core-js/modules/esnext.map.map-values.js");
require("core-js/modules/esnext.map.merge.js");
require("core-js/modules/esnext.map.reduce.js");
require("core-js/modules/esnext.map.some.js");
require("core-js/modules/esnext.map.update.js");
require("core-js/modules/esnext.set.add-all.js");
require("core-js/modules/esnext.set.delete-all.js");
require("core-js/modules/esnext.set.difference.js");
require("core-js/modules/esnext.set.every.js");
require("core-js/modules/esnext.set.filter.js");
require("core-js/modules/esnext.set.find.js");
require("core-js/modules/esnext.set.intersection.js");
require("core-js/modules/esnext.set.is-disjoint-from.js");
require("core-js/modules/esnext.set.is-subset-of.js");
require("core-js/modules/esnext.set.is-superset-of.js");
require("core-js/modules/esnext.set.join.js");
require("core-js/modules/esnext.set.map.js");
require("core-js/modules/esnext.set.reduce.js");
require("core-js/modules/esnext.set.some.js");
require("core-js/modules/esnext.set.symmetric-difference.js");
require("core-js/modules/esnext.set.union.js");
require("core-js/modules/esnext.weak-map.delete-all.js");
require("core-js/modules/esnext.weak-set.add-all.js");
require("core-js/modules/esnext.weak-set.delete-all.js");
const sameValueZero = (first, second) => first === second || first !== first && second !== second;
const compare = (first, second, seen) => {
  if (sameValueZero(first, second)) {
    return true;
  }
  if (typeof first !== 'object' || typeof second !== 'object' || first === null || second === null) {
    // Different primitives, or a function (which is only equal to itself), or an object against a primitive
    return false;
  }
  if (Object.getPrototypeOf(first) !== Object.getPrototypeOf(second)) {
    return false;
  }
  // A pair which is already being compared further up is not a difference (this is what makes circular references work)
  const comparing = seen.get(first);
  if (comparing && comparing.has(second)) {
    return true;
  }
  if (comparing) {
    comparing.add(second);
  } else {
    seen.set(first, new WeakSet([second]));
  }
  if (first instanceof Date) {
    return first.getTime() === second.getTime();
  }
  if (first instanceof RegExp) {
    return first.source === second.source && first.flags === second.flags;
  }
  if (first instanceof Map) {
    return first.size === second.size && Array.from(first.entries()).every(([key, value]) => second.has(key) && compare(value, second.get(key), seen));
  }
  if (first instanceof Set) {
    const others = Array.from(second.values());
    return first.size === second.size && Array.from(first.values()).every(value => others.some(other => compare(value, other, seen)));
  }
  if (Array.isArray(first) && first.length !== second.length) {
    return false;
  }
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  return firstKeys.length === secondKeys.length && firstKeys.every(key => Object.prototype.hasOwnProperty.call(second, key) && compare(first[key], second[key], seen));
};
/**
 * Check whether two values are equal by value, however they are stored: two separately made arrays or objects with the
 * same contents are equal, while two references only need to be the same when the value is a function.
 * - Primitives are equal when they are the same value (and NaN equals NaN)
 * - Arrays are equal when they have the same elements in the same order
 * - Objects are equal when they have the same prototype (the same kind of object) and the same own properties with
 * equal values, the order of the properties does not matter
 * - Dates, regular expressions, Maps and Sets are compared by what they hold
 * - Circular references are handled: a pair of objects which is already being compared is taken to be equal
 * @param first - The first value.
 * @param second - The second value.
 * @returns True when the values are equal.
 */
const isEqual = (first, second) => compare(first, second, new WeakMap());
var _default = exports.default = isEqual;
},{"core-js/modules/es.regexp.flags.js":219,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.every.js":224,"core-js/modules/esnext.iterator.some.js":230,"core-js/modules/esnext.map.delete-all.js":231,"core-js/modules/esnext.map.every.js":232,"core-js/modules/esnext.map.filter.js":233,"core-js/modules/esnext.map.find-key.js":234,"core-js/modules/esnext.map.find.js":235,"core-js/modules/esnext.map.includes.js":236,"core-js/modules/esnext.map.key-of.js":237,"core-js/modules/esnext.map.map-keys.js":238,"core-js/modules/esnext.map.map-values.js":239,"core-js/modules/esnext.map.merge.js":240,"core-js/modules/esnext.map.reduce.js":241,"core-js/modules/esnext.map.some.js":242,"core-js/modules/esnext.map.update.js":243,"core-js/modules/esnext.set.add-all.js":244,"core-js/modules/esnext.set.delete-all.js":245,"core-js/modules/esnext.set.difference.js":246,"core-js/modules/esnext.set.every.js":247,"core-js/modules/esnext.set.filter.js":248,"core-js/modules/esnext.set.find.js":249,"core-js/modules/esnext.set.intersection.js":250,"core-js/modules/esnext.set.is-disjoint-from.js":251,"core-js/modules/esnext.set.is-subset-of.js":252,"core-js/modules/esnext.set.is-superset-of.js":253,"core-js/modules/esnext.set.join.js":254,"core-js/modules/esnext.set.map.js":255,"core-js/modules/esnext.set.reduce.js":256,"core-js/modules/esnext.set.some.js":257,"core-js/modules/esnext.set.symmetric-difference.js":258,"core-js/modules/esnext.set.union.js":259,"core-js/modules/esnext.weak-map.delete-all.js":260,"core-js/modules/esnext.weak-set.add-all.js":261,"core-js/modules/esnext.weak-set.delete-all.js":262}],318:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.array.includes.js");
var _isObject = _interopRequireDefault(require("./isObject"));
var _objectKeys = _interopRequireDefault(require("./objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Check if the current object has inherited properties.
 * @param object
 */
const isInstanceObject = object => {
  if (typeof object !== 'function' && !(0, _isObject.default)(object)) {
    return false;
  }
  if (!['Array', 'Function', 'Object'].includes(object.constructor.name)) {
    return true;
  }
  return object.constructor.name !== 'Array' && (0, _objectKeys.default)(object, true).length > (0, _objectKeys.default)(object).length;
};
var _default = exports.default = isInstanceObject;
},{"./isObject":319,"./objectKeys":324,"core-js/modules/es.array.includes.js":208}],319:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Check if the provided thing is an object / array.
 * @param object
 */
const isObject = object => typeof object === 'object' && object !== null;
var _default = exports.default = isObject;
},{}],320:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _callWithParams = _interopRequireDefault(require("../functions/callWithParams"));
var _objectKeys = _interopRequireDefault(require("./objectKeys"));
var _setValue = _interopRequireDefault(require("./setValue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This function is intended to replicate behaviour of the Array.map() function but for Objects.
 * If an array is passed in instead then it will perform standard map(). It is recommended to
 * always use the standard map() function when it is known that the object is actually an array.
 * @param obj - The Object (or Array) to be mapped
 * @param fn - The function to be processed for each mapped property
 * @param thisArg - Optional. Value to use as this when executing callback.
 */
const mapObject = (obj, fn, thisArg = undefined) => Array.isArray(obj) ? obj.map(fn, thisArg) : (0, _objectKeys.default)(obj, true).reduce((newObj, curr) => (0, _setValue.default)(curr, (0, _callWithParams.default)(fn.bind(thisArg), [obj[curr], curr, obj], 2), newObj), {});
var _default = exports.default = mapObject;
},{"../functions/callWithParams":287,"./objectKeys":324,"./setValue":328,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229}],321:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mergeObjectsBase = _interopRequireDefault(require("./mergeObjectsBase"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Uses mergeObjectsBase deep merge objects and arrays, merge by value.
 * @see {@link module:objectHelpers~mergeObjectsCallback}
 * @param objects - Provide a list of objects which will be merged starting from the end up into the first
 */
const mergeObjects = (0, _mergeObjectsBase.default)({
  useClone: true
});
var _default = exports.default = mergeObjects;
},{"./mergeObjectsBase":322}],322:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
require("core-js/modules/esnext.iterator.reduce.js");
require("core-js/modules/esnext.map.delete-all.js");
require("core-js/modules/esnext.map.every.js");
require("core-js/modules/esnext.map.filter.js");
require("core-js/modules/esnext.map.find.js");
require("core-js/modules/esnext.map.find-key.js");
require("core-js/modules/esnext.map.includes.js");
require("core-js/modules/esnext.map.key-of.js");
require("core-js/modules/esnext.map.map-keys.js");
require("core-js/modules/esnext.map.map-values.js");
require("core-js/modules/esnext.map.merge.js");
require("core-js/modules/esnext.map.reduce.js");
require("core-js/modules/esnext.map.some.js");
require("core-js/modules/esnext.map.update.js");
var _isCloneable = _interopRequireDefault(require("./isCloneable"));
var _reduceObject = _interopRequireDefault(require("./reduceObject"));
var _setValue = _interopRequireDefault(require("./setValue"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Perform a deep merge of objects. This will return a function that will combine all objects and sub-objects.
 * Objects having the same attributes will overwrite from last object to first.
 * Every call of the returned function keeps its own record of the objects it has already visited (so circular
 * references are followed only once, and an object which is referenced in several places is merged once), and nothing
 * is remembered between calls: the results of separate calls never share state or go stale.
 * @param options
 * @param options.mapLimit - Deprecated and ignored: the record of visited objects is now scoped to a
 * single call, so it does not need trimming.
 * @param options.depthLimit - Control how many nested levels deep will be used, -1 = no limit, >-1 = nth level limited.
 * @param options.relevancyRange - Deprecated and ignored: see mapLimit.
 * @param options.map] - A predetermined list of references (source and the object it should
 * resolve to) which every call starts from. It is only read, never added to.
 * @param options.useClone
 */
const mergeObjectsBase = ({
  depthLimit = -1,
  map = [],
  useClone = false
} = {}) => {
  const merge = (visited, depth, objects) => {
    const firstObject = useClone ? Array.isArray(objects[0]) ? [] : {} : objects.shift();
    if (objects.length < 1) {
      return firstObject;
    }
    if (depth === 0) {
      return firstObject;
    }
    return objects.reduce((newObj, arg) => {
      if (!arg) {
        return newObj;
      }
      if (!visited.has(arg)) {
        visited.set(arg, newObj);
      }
      return (0, _reduceObject.default)(arg, (returnObj, value, key) => {
        if ((0, _isCloneable.default)(value)) {
          if (visited.has(value)) {
            return (0, _setValue.default)(key, visited.get(value), returnObj);
          }
          let objectValue = newObj[key];
          if (!(0, _isCloneable.default)(objectValue) || !objectValue) {
            if (!useClone) {
              // Merging by reference: the source object is used as it is, there is nothing to merge it into.
              visited.set(value, value);
              return (0, _setValue.default)(key, value, returnObj);
            }
            objectValue = Array.isArray(value) ? [] : {};
          }
          return (0, _setValue.default)(key, merge(visited, depth - 1, [objectValue, value]), returnObj);
        }
        return (0, _setValue.default)(key, value, returnObj);
      }, newObj);
    }, firstObject || {});
  };
  return (...objects) => merge(new Map(map.map(({
    source,
    object
  }) => [source, object])), depthLimit, objects);
};
var _default = exports.default = mergeObjectsBase;
},{"./isCloneable":316,"./reduceObject":326,"./setValue":328,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228,"core-js/modules/esnext.iterator.reduce.js":229,"core-js/modules/esnext.map.delete-all.js":231,"core-js/modules/esnext.map.every.js":232,"core-js/modules/esnext.map.filter.js":233,"core-js/modules/esnext.map.find-key.js":234,"core-js/modules/esnext.map.find.js":235,"core-js/modules/esnext.map.includes.js":236,"core-js/modules/esnext.map.key-of.js":237,"core-js/modules/esnext.map.map-keys.js":238,"core-js/modules/esnext.map.map-values.js":239,"core-js/modules/esnext.map.merge.js":240,"core-js/modules/esnext.map.reduce.js":241,"core-js/modules/esnext.map.some.js":242,"core-js/modules/esnext.map.update.js":243}],323:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mergeObjectsBase = _interopRequireDefault(require("./mergeObjectsBase"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Uses mergeObjectsBase deep merge objects and arrays, merge by reference.
 * @see {@link module:objectHelpers~mergeObjectsCallback}
 * @param objects - Provide a list of objects which will be merged starting from the end up into the first
 */
const mergeObjectsMutable = (0, _mergeObjectsBase.default)();
var _default = exports.default = mergeObjectsMutable;
},{"./mergeObjectsBase":322}],324:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isObject = _interopRequireDefault(require("./isObject"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Get an array of keys from any object or array. Will return empty array when invalid or there are no keys.
 * Optional flag will include the inherited keys from prototype chain when set.
 * @param object
 * @param includeInherited
 */
const objectKeys = (object, includeInherited = false) => {
  if (typeof object !== 'function' && !(0, _isObject.default)(object)) {
    return [];
  }
  if (includeInherited) {
    const propNames = Object.getOwnPropertyNames(object);
    if (propNames.length) {
      return propNames;
    }
  }
  const keys = [];
  for (const key in object) {
    if (includeInherited || Object.prototype.hasOwnProperty.call(object, key)) {
      if (Array.isArray(object)) {
        keys.push(parseInt(key));
        continue;
      }
      keys.push(key);
    }
  }
  return keys;
};
var _default = exports.default = objectKeys;
},{"./isObject":319}],325:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.map.js");
var _objectKeys = _interopRequireDefault(require("./objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Get an array of values from any object or array. Will return empty array when invalid or there are no values.
 * Optional flag will include the inherited values from prototype chain when set.
 * @param object
 * @param includeInherited
 */
const objectValues = (object, includeInherited = false) => (0, _objectKeys.default)(object, includeInherited).map(key => object[key]);
var _default = exports.default = objectValues;
},{"./objectKeys":324,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.map.js":228}],326:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _callWithParams = _interopRequireDefault(require("../functions/callWithParams"));
var _objectKeys = _interopRequireDefault(require("./objectKeys"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This function is intended to replicate behaviour of the Array.reduce() function but for Objects.
 * If an array is passed in instead then it will perform standard reduce(). It is recommended to
 * always use the standard reduce() function when it is known that the object is actually an array.
 * @param obj - The Object (or Array) to be filtered
 * @param fn - The function to be processed for each filtered property
 * @param initialValue - Optional. Value to use as the first argument to the first call of the
 * callback. If no initial value is supplied, the first element in the array will be used. Calling reduce on an empty
 * array without an initial value is an error.
 */
const reduceObject = (obj, fn, initialValue = obj[(0, _objectKeys.default)(obj)[0]] || obj[0]) => Array.isArray(obj) ? obj.reduce(fn, initialValue) : (0, _objectKeys.default)(obj, true).reduce((newObj, curr) => (0, _callWithParams.default)(fn, [newObj, obj[curr], curr, obj], 2), initialValue);
var _default = exports.default = reduceObject;
},{"../functions/callWithParams":287,"./objectKeys":324,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],327:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Set a value on an item, then return the value
 * @param item - An object or array to be updated
 * @param key - The key on the item which will have its value set
 * @param value - Any value to be applied to the key
 */
const setAndReturnValue = (item, key, value) => {
  item[key] = value;
  return value;
};
var _default = exports.default = setAndReturnValue;
},{}],328:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Set a value on an item, then return the item.
 * NOTE: Argument order designed for usage with pipe
 * @param key - The key on the item which will have its value set
 * @param value - Any value to be applied to the key
 * @param item - An object or array to be updated
 */
const setValue = (key, value, item) => {
  // @ts-ignore
  item[key] = value;
  return item;
};
var _default = exports.default = setValue;
},{}],329:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "camelCase", {
  enumerable: true,
  get: function () {
    return _camelCase.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "kabobCase", {
  enumerable: true,
  get: function () {
    return _kabobCase.default;
  }
});
Object.defineProperty(exports, "makeFilepath", {
  enumerable: true,
  get: function () {
    return _makeFilepath.default;
  }
});
Object.defineProperty(exports, "makeRelativePath", {
  enumerable: true,
  get: function () {
    return _makeRelativePath.default;
  }
});
Object.defineProperty(exports, "regexEscape", {
  enumerable: true,
  get: function () {
    return _regexEscape.default;
  }
});
Object.defineProperty(exports, "snakeCase", {
  enumerable: true,
  get: function () {
    return _snakeCase.default;
  }
});
Object.defineProperty(exports, "strAfter", {
  enumerable: true,
  get: function () {
    return _strAfter.default;
  }
});
Object.defineProperty(exports, "strAfterLast", {
  enumerable: true,
  get: function () {
    return _strAfterLast.default;
  }
});
Object.defineProperty(exports, "strBefore", {
  enumerable: true,
  get: function () {
    return _strBefore.default;
  }
});
Object.defineProperty(exports, "strBeforeLast", {
  enumerable: true,
  get: function () {
    return _strBeforeLast.default;
  }
});
Object.defineProperty(exports, "titleCase", {
  enumerable: true,
  get: function () {
    return _titleCase.default;
  }
});
Object.defineProperty(exports, "ucFirst", {
  enumerable: true,
  get: function () {
    return _ucFirst.default;
  }
});
Object.defineProperty(exports, "words", {
  enumerable: true,
  get: function () {
    return _words.default;
  }
});
var _camelCase = _interopRequireDefault(require("./strings/camelCase"));
var _kabobCase = _interopRequireDefault(require("./strings/kabobCase"));
var _makeFilepath = _interopRequireDefault(require("./strings/makeFilepath"));
var _makeRelativePath = _interopRequireDefault(require("./strings/makeRelativePath"));
var _regexEscape = _interopRequireDefault(require("./strings/regexEscape"));
var _snakeCase = _interopRequireDefault(require("./strings/snakeCase"));
var _strAfter = _interopRequireDefault(require("./strings/strAfter"));
var _strAfterLast = _interopRequireDefault(require("./strings/strAfterLast"));
var _strBefore = _interopRequireDefault(require("./strings/strBefore"));
var _strBeforeLast = _interopRequireDefault(require("./strings/strBeforeLast"));
var _titleCase = _interopRequireDefault(require("./strings/titleCase"));
var _ucFirst = _interopRequireDefault(require("./strings/ucFirst"));
var _words = _interopRequireDefault(require("./strings/words"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Manage how strings are manipulated with these utilities.
 */
var _default = exports.default = {
  camelCase: _camelCase.default,
  kabobCase: _kabobCase.default,
  makeFilepath: _makeFilepath.default,
  makeRelativePath: _makeRelativePath.default,
  regexEscape: _regexEscape.default,
  snakeCase: _snakeCase.default,
  strAfter: _strAfter.default,
  strAfterLast: _strAfterLast.default,
  strBefore: _strBefore.default,
  strBeforeLast: _strBeforeLast.default,
  titleCase: _titleCase.default,
  ucFirst: _ucFirst.default,
  words: _words.default
};
},{"./strings/camelCase":330,"./strings/kabobCase":331,"./strings/makeFilepath":332,"./strings/makeRelativePath":333,"./strings/regexEscape":334,"./strings/snakeCase":335,"./strings/strAfter":336,"./strings/strAfterLast":337,"./strings/strBefore":338,"./strings/strBeforeLast":339,"./strings/titleCase":340,"./strings/ucFirst":341,"./strings/words":342}],330:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _ucFirst = _interopRequireDefault(require("./ucFirst"));
var _words = _interopRequireDefault(require("./words"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Given a string in kebab-case, snake_case or 'Sentence case', convert to camelCase.
 * @param str - The string to convert.
 */
const camelCase = str => (0, _words.default)(str).reduce((camel, part) => camel ? camel.concat((0, _ucFirst.default)(part)) : part.toLowerCase(), '');
var _default = exports.default = camelCase;
},{"./ucFirst":341,"./words":342,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],331:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _words = _interopRequireDefault(require("./words"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Given a string in snake_case, camelCase or 'Sentence case', convert to kabob-case.
 * @param str - The string to convert.
 */
const kabobCase = str => (0, _words.default)(str).reduce((kabob, part) => kabob ? kabob.concat('-' + part.toLowerCase()) : part.toLowerCase(), '');
var _default = exports.default = kabobCase;
},{"./words":342,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],332:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeFilepath = exports.default = void 0;
var _strBeforeLast = _interopRequireDefault(require("./strBeforeLast"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Format the given path so that it does not have trailing slashes and also correctly appends a path.
 * @param root - The base path to start from.
 * @param append - A path to append to `root` - may itself use `./` or `../` segments.
 */
const makeFilepath = (root, append = '') => {
  if (root.startsWith('./')) {
    root = root.slice(2);
  }
  if (root.startsWith('/')) {
    root = root.slice(1);
  }
  if (root.endsWith('/')) {
    root = root.slice(0, -1);
  }
  if (append.startsWith('/')) {
    append = append.slice(1);
  }
  if (append.startsWith('./')) {
    append = append.slice(2);
  }
  if (append.startsWith('../')) {
    if (!root) {
      return append.endsWith('/') ? append.slice(0, -1) : append;
    }
    append = append.slice(3);
    root = (0, _strBeforeLast.default)(root, '/');
    return makeFilepath(root, append);
  }
  if (append.endsWith('/')) {
    append = append.slice(0, -1);
  }
  if (!root) {
    return append;
  }
  return append ? `${root}/${append}` : root;
};
exports.makeFilepath = makeFilepath;
var _default = exports.default = makeFilepath;
},{"./strBeforeLast":339}],333:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRelativePath = exports.default = void 0;
var _strBefore = _interopRequireDefault(require("./strBefore"));
var _strAfter = _interopRequireDefault(require("./strAfter"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Compare two file paths and simplify them to a relative path.
 * @param fromFile - The path of the file the resulting relative path will be used from.
 * @param toFile - The path of the file being referenced.
 * @returns `toFile` expressed relative to `fromFile`.
 */
const makeRelativePath = (fromFile, toFile) => {
  let relativePath = toFile;
  let nextPart = fromFile;
  let firstPart = (0, _strBefore.default)(nextPart, '/');
  let hasMatches = false;
  while (firstPart && relativePath.startsWith(firstPart)) {
    relativePath = (0, _strAfter.default)(relativePath, `${firstPart}/`);
    nextPart = (0, _strAfter.default)(nextPart, `${firstPart}/`);
    firstPart = (0, _strBefore.default)(nextPart, '/');
    hasMatches = true;
  }
  if (!hasMatches) {
    // No similar base paths, use the path as-is
    return relativePath;
  }
  let relativePrefix = '';
  const nextParts = nextPart.split('/');
  if (nextParts.length < 2) {
    relativePrefix = './';
  }
  for (let i = 1; i < nextParts.length; ++i) {
    relativePrefix += '../';
  }
  return relativePrefix + relativePath;
};
exports.makeRelativePath = makeRelativePath;
var _default = exports.default = makeRelativePath;
},{"./strAfter":336,"./strBefore":338}],334:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.regexEscape = exports.default = void 0;
/**
 * Take a string and escape the regex characters.
 * @param str - The string to escape, so it can be used literally inside a `RegExp`.
 */
const regexEscape = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.regexEscape = regexEscape;
var _default = exports.default = regexEscape;
},{}],335:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _words = _interopRequireDefault(require("./words"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Given a string in kebab-case, camelCase or 'Sentence case', convert to snake_case.
 * @param str - The string to convert.
 */
const snakeCase = str => (0, _words.default)(str).reduce((snake, part) => snake ? snake.concat('_' + part.toLowerCase()) : part.toLowerCase(), '');
var _default = exports.default = snakeCase;
},{"./words":342,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],336:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Retrieve the string part after the search match.
 * @param str - The string to search within.
 * @param search - The substring to search for.
 * @returns The portion of `str` after the first occurrence of `search`, or `''` if not found.
 */
const strAfter = (str, search) => {
  const index = str.indexOf(search);
  return index === -1 ? '' : str.substring(index + search.length);
};
var _default = exports.default = strAfter;
},{}],337:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Retrieve the string part after the last search match.
 * @param str - The string to search within.
 * @param search - The substring to search for.
 * @returns The portion of `str` after the last occurrence of `search`, or `''` if not found.
 */
const strAfterLast = (str, search) => {
  const index = str.lastIndexOf(search);
  return index === -1 ? '' : str.substring(index + search.length);
};
var _default = exports.default = strAfterLast;
},{}],338:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Retrieve the string part before the search match.
 * @param str - The string to search within.
 * @param search - The substring to search for.
 * @returns The portion of `str` before the first occurrence of `search`, or `''` if not found.
 */
const strBefore = (str, search) => {
  const index = str.indexOf(search);
  return index === -1 ? '' : str.slice(0, index);
};
var _default = exports.default = strBefore;
},{}],339:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Retrieve the string part before the last search match.
 * @param str - The string to search within.
 * @param search - The substring to search for.
 * @returns The portion of `str` before the last occurrence of `search`, or `''` if not found.
 */
const strBeforeLast = (str, search) => {
  const index = str.lastIndexOf(search);
  return index === -1 ? '' : str.substring(0, index);
};
var _default = exports.default = strBeforeLast;
},{}],340:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.reduce.js");
var _ucFirst = _interopRequireDefault(require("./ucFirst"));
var _words = _interopRequireDefault(require("./words"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Given a string in kebab-case, snake_case, camelCase or 'Sentence case', convert to 'Title Case'.
 * @param str - The string to convert.
 */
const titleCase = str => (0, _words.default)(str).reduce((title, part) => title ? title.concat(' ' + (0, _ucFirst.default)(part)) : (0, _ucFirst.default)(part), '');
var _default = exports.default = titleCase;
},{"./ucFirst":341,"./words":342,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.reduce.js":229}],341:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Given a string, make the first character uppercase and the rest lowercase.
 * @param str - The string to convert.
 */
const ucFirst = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
var _default = exports.default = ucFirst;
},{}],342:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Split a string into sets of numbers or letters - the shared tokenizer behind camelCase/kabobCase/snakeCase/
 * titleCase, so each can rebuild the string in its own casing style.
 * @param str - The string to split.
 */
const words = str => str.match(/\d+|[A-Z]?[a-z]+|[A-Za-z]+/g);
var _default = exports.default = words;
},{}],343:[function(require,module,exports){
"use strict";

require("core-js/modules/esnext.iterator.constructor.js");
require("core-js/modules/esnext.iterator.for-each.js");
require("core-js/modules/esnext.weak-map.delete-all.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {};
exports.default = void 0;
var _arrays = _interopRequireWildcard(require("./helpers/arrays"));
Object.keys(_arrays).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _arrays[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _arrays[key];
    }
  });
});
var _descriptors = _interopRequireWildcard(require("./helpers/descriptors"));
Object.keys(_descriptors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _descriptors[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _descriptors[key];
    }
  });
});
var _functions = _interopRequireWildcard(require("./helpers/functions"));
Object.keys(_functions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _functions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _functions[key];
    }
  });
});
var _numbers = _interopRequireWildcard(require("./helpers/numbers"));
Object.keys(_numbers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _numbers[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _numbers[key];
    }
  });
});
var _objects = _interopRequireWildcard(require("./helpers/objects"));
Object.keys(_objects).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _objects[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _objects[key];
    }
  });
});
var _strings = _interopRequireWildcard(require("./helpers/strings"));
Object.keys(_strings).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _strings[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _strings[key];
    }
  });
});
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * All the siFunciona system functions for stringing together functions and simplifying logic.
 */

// Every function is available by name (import { curry } from 'si-funciona', require('si-funciona').curry) ...

// ... and all together on the default export (import siFunciona from 'si-funciona', require('si-funciona').default)
const siFunciona = Object.assign({}, _arrays.default, _descriptors.default, _functions.default, _numbers.default, _objects.default, _strings.default);
var _default = exports.default = siFunciona;
if (void 0) {
  // @ts-ignore
  (void 0)['siFunciona'] = siFunciona;
} else if (typeof window !== 'undefined') {
  // @ts-ignore
  window['siFunciona'] = siFunciona;
}
},{"./helpers/arrays":265,"./helpers/descriptors":273,"./helpers/functions":286,"./helpers/numbers":298,"./helpers/objects":308,"./helpers/strings":329,"core-js/modules/esnext.iterator.constructor.js":222,"core-js/modules/esnext.iterator.for-each.js":227,"core-js/modules/esnext.weak-map.delete-all.js":260}]},{},[71])(71)
});
