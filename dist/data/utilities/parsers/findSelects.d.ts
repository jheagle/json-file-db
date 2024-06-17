import { ParsedQuery } from './parseQuery';
/**
 * Store the select as an object.
 * @typedef {Object} ParsedSelect
 * @property {string} property
 * @property {string|undefined} alias
 */
export type ParsedSelect = {
    property: string;
    alias: string | undefined;
};
/**
 * Extract select clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findSelects: (parsed: ParsedQuery, query: string) => string;
