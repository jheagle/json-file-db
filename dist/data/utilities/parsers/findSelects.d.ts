import { ParsedQuery } from './parseQuery';
export type ParsedSelect = {
    property: string;
    alias: string | undefined;
};
/**
 * Extract select clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findSelects: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findSelects.d.ts.map