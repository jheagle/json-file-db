import { ParsedQuery } from './parseQuery';
/**
 * Store the join clause as an object.
 * @typedef {Object} ParsedJoinClause
 * @property {string} propertyA
 * @property {string} comparator
 * @property {string} propertyB
 */
export type ParsedJoinClause = {
    propertyA: string;
    comparator: string;
    propertyB: string;
};
/**
 * Extract condition clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findJoinClauses: (parsed: ParsedQuery, query: string) => string;
