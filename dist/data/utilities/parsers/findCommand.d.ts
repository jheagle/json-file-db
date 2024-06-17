import { ParsedQuery } from './parseQuery';
/**
 * The command for this query.
 * @typedef {string} ParsedCommand
 */
export type ParsedCommand = string | 'delete' | 'insert' | 'read' | 'update';
/**
 * The main entity for this query.
 * @typedef {string} ParsedEntity
 */
export type ParsedEntity = string;
/**
 * Extract command clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findCommand: (parsed: ParsedQuery, query: string) => string;
