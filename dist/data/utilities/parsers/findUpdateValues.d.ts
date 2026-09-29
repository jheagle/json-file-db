import { ParsedQuery } from './parseQuery';
export type ParsedUpdateValues = {
    [field: string]: any;
};
/**
 * Extract an update's "set field = value, field2 = value2" clause from the query. Uses a two-pass
 * match, unlike the other parsers here: the set clause's own boundary is found first (so it can
 * be removed from the query as a whole, and so the comma-separated list doesn't get confused with
 * anything that follows, like a where clause), then each individual assignment is parsed out of
 * that captured substring.
 * @param parsed
 * @param query
 */
export declare const findUpdateValues: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findUpdateValues.d.ts.map