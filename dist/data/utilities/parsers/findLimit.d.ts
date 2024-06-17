import { ParsedQuery } from './parseQuery';
/**
 * Store the limit clause as an object.
 * @typedef {number} ParsedLimit
 */
export type ParsedLimit = number;
/**
 * Extract the limit clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findLimit: (parsed: ParsedQuery, query: string) => string;
