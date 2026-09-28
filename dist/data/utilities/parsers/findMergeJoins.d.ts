import { ParsedQuery } from './parseQuery';
export type ParsedMergeJoin = {
    propertyA: string;
    propertyB: string;
};
/**
 * Extract merge-join clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findMergeJoins: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findMergeJoins.d.ts.map