export type LiteralValue = string | number | boolean | null | any[];
/**
 * Several parsers (findConditions, findInsertValues, findUpdateValues) capture a query-string
 * literal into one of six consecutive alternation groups depending on its shape - quoted string,
 * number, array, null, true, false - since a single regex can't otherwise tell them apart. Given
 * the match and the index of the first of those six groups (which shifts depending on how many
 * groups come before it in the parent regex), return the literal with its real JS type.
 * @param match
 * @param baseIndex
 */
export declare const parseLiteralValue: (match: RegExpMatchArray, baseIndex: number) => LiteralValue;
//# sourceMappingURL=parseLiteralValue.d.ts.map