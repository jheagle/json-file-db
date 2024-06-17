import { ParsedQuery } from './parseQuery';
/**
 * Store the sort clause as an object.
 * @typedef {Object} ParsedSortClause
 * @property {string} property
 * @property {string} direction
 */
export type ParsedSortClause = {
    property: string;
    direction: string | 'asc' | 'desc';
};
/**
 * Extract sort clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findSortClauses: (parsed: ParsedQuery, query: string) => string;
