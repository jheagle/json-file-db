export type QuoteChar = '\'' | '"';
export type BracketChar = '[' | '(';
export type ScannedString = {
    start: number;
    end: number;
    quote: QuoteChar;
    value: string;
};
export type ScannedComment = {
    start: number;
    end: number;
    kind: 'line' | 'block';
};
export type ScanState = {
    quote: QuoteChar | undefined;
    escape: boolean;
    blockComment: boolean;
    brackets: BracketChar[];
    strayCloser: {
        char: string;
        index: number;
    } | undefined;
};
export type ScannedQuery = {
    strings: ScannedString[];
    comments: ScannedComment[];
    semicolons: number[];
    end: ScanState;
    closed: boolean;
    terminated: boolean;
};
/**
 * Walk a query once, left to right, finding its strings, comments and the `;` between statements.
 *
 * Strings use `'` or `"` and close only with the quote they opened with. Inside a string a backslash escapes the
 * next character: `\n` and `\t` are a newline and a tab, any other `\x` is `x` (so `\'`, `\"` and `\\` are a quote
 * and a backslash). Outside strings a backslash has no meaning. Comments run from `--` to the end of the line, or
 * from `/*` to `*\/`; anything inside a comment is ignored, and comment markers inside a string are just text.
 *
 * Never throws: whatever is left open is reported in `end`, for a prompt which asks for more input. Use
 * assertClosed to turn it into an error.
 * @param text
 */
export declare const scanQuery: (text?: string) => ScannedQuery;
/**
 * Throw a clear error for anything scanQuery found left open or unmatched: a string, a block comment or a bracket.
 * @param scanned
 */
export declare const assertClosed: (scanned: ScannedQuery) => ScannedQuery;
//# sourceMappingURL=scanQuery.d.ts.map