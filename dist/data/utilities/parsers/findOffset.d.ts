import { ParsedQuery } from './parseQuery';
/**
 * Store the limit clause as an object.
 * @typedef {number} ParsedOffset
 */
export type ParsedOffset = number;
/**
 * Extract the offset clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findOffset: (parsed: ParsedQuery, query: string) => string;
