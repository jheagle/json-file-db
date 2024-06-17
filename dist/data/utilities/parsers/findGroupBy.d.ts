import { ParsedQuery } from './parseQuery';
/**
 * Store the group by clause as an object.
 * @typedef {string} ParsedGroupBy
 */
export type ParsedGroupBy = string;
/**
 * Extract the group by clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findGroupBy: (parsed: ParsedQuery, query: string) => string;
