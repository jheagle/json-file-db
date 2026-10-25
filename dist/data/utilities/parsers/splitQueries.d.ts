/**
 * Split a string of queries into one query each, on the `;` between them. A `;` inside a string or a comment does
 * not count, comments are removed, and the `;` after the last query is optional.
 * @param queries
 * @throws {Error} For an unclosed string, block comment or bracket.
 */
export declare const splitQueries: (queries?: string) => string[];
//# sourceMappingURL=splitQueries.d.ts.map