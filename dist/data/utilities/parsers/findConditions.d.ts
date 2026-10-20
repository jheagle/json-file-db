import { LiteralValue } from './parseLiteralValue';
import { ParsedQuery } from './parseQuery';
export type ConditionValue = LiteralValue;
export type ParsedCondition = {
    property: string;
    comparator: string;
    value: ConditionValue;
    type?: string;
};
/**
 * Extract condition clauses from the query.
 * @param parsed
 * @param query
 */
export declare const findConditions: (parsed: ParsedQuery, query: string) => string;
//# sourceMappingURL=findConditions.d.ts.map