import { ParsedQuery } from './parseQuery';
/**
 * The main join entity for this query.
 * @typedef {string} ParsedJoinEntity
 */
export type ParsedJoinEntity = string;
/**
 * Extract the main join entity from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findJoinEntity: (parsed: ParsedQuery, query: string) => string;
