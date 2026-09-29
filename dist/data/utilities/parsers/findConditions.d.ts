import { ParsedQuery } from './parseQuery';
export type ConditionValue = string | number | boolean | null | any[];
export type ParsedCondition = {
    property: string;
    comparator: string;
    value: ConditionValue;
};
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findConditions: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findConditions.d.ts.map