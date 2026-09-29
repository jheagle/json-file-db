import { ParsedQuery } from './parseQuery';
export type ParsedInsertRow = {
    [field: string]: any;
};
/**
 * Extract an insert's "values field = value, field2 = value2" clause from the query, the same way
 * findUpdateValues() does for "set". insertEntity() accepts an array of rows for bulk inserts, but
 * a query string only describes a single row for now - wrapped in a one-element array to match.
 * @param parsed
 * @param query
 */
export declare const findInsertValues: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findInsertValues.d.ts.map