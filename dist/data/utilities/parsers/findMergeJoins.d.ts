import { ParsedQuery } from './parseQuery';
/**
 * Store the merge-join as an object.
 * @typedef {Object} ParsedMergeJoin
 * @property {string} propertyA
 * @property {string} propertyB
 */
export type ParsedMergeJoin = {
    propertyA: string;
    propertyB: string;
};
/**
 * Extract merge-join clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findMergeJoins: (parsed: ParsedQuery, query: string) => string;
