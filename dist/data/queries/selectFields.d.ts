import { ParsedSelect } from '../utilities/parsers/findSelects';
/**
 * Shape each row down to only the selected properties (aliased, when given). dataSet is either a plain array of
 * rows, or (once groupBy has run) a plain object keyed by group value, each value an array of rows - both are
 * shaped the same way, row by row.
 * @param dataSet
 * @param selectClauses
 */
export declare const selectFields: (dataSet?: Object[] | Object, selectClauses?: ParsedSelect[]) => Object[] | Object;
//# sourceMappingURL=selectFields.d.ts.map