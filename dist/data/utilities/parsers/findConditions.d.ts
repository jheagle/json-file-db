import { ParsedQuery } from './parseQuery';
export type ParsedCondition = {
    property: string;
    comparator: string;
    value: string;
};
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findConditions: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findConditions.d.ts.map