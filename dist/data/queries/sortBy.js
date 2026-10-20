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