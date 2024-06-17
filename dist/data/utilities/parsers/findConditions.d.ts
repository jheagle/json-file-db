import { ParsedQuery } from './parseQuery';
/**
 * Store the condition as an object.
 * @typedef {Object} ParsedCondition
 * @property {string} property
 * @property {string} comparator
 * @property {string} value
 */
export type ParsedCondition = {
    property: string;
    comparator: string;
    value: string;
};
/**
 * Extract condition clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export declare const findConditions: (parsed: ParsedQuery, query: string) => string;
