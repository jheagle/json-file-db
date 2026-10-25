/**
 * Regex source matching one placeholder from maskStrings, with the hex-encoded value as its only group. The
 * find* parsers use it where they would otherwise match a quoted string.
 */
export declare const placeholderSource = "\\u0000([0-9a-f]*)\\u0000";
/**
 * Turn the hex of a placeholder back into the string's value.
 * @param hex
 */
export declare const fromPlaceholder: (hex: string) => string;
/**
 * Replace every quoted string in a query with a placeholder holding its value (with the escapes applied), so that
 * nothing inside a string (a keyword, a quote, `and`, a `]`) can be matched by the find* parsers.
 * @param query
 * @throws {Error} For an unclosed string, comment or bracket, or a NUL character outside a string (which could
 * otherwise pass for a placeholder).
 */
export declare const maskStrings: (query: string) => string;
/**
 * Put every placeholder back as a quoted string, the way it would be written in a query: for error messages, and
 * for array literals read as JSON.
 * @param text
 * @param quote - wrap with JSON's double quotes (the default) or with single quotes
 */
export declare const unmaskStrings: (text: string, quote?: "json" | "'") => string;
//# sourceMappingURL=maskStrings.d.ts.map