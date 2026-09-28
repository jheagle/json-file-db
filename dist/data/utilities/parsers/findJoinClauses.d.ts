import { ParsedQuery } from './parseQuery';
export type ParsedJoinClause = {
    propertyA: string;
    comparator: string;
    propertyB: string;
};
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findJoinClauses: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findJoinClauses.d.ts.map