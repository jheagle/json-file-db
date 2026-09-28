import { ParsedQuery } from './parseQuery';
export type ParsedSortClause = {
    property: string;
    direction: string | 'asc' | 'desc';
};
/**
 * Extract sort clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findSortClauses: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findSortClauses.d.ts.map