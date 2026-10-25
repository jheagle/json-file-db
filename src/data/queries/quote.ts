/**
 * Write a value as a quoted string for a query, so any text can be used in one: the backslash and the quote are
 * escaped, so the parser reads back exactly the text given.
 * @example
 * query(`insert exercises values name = ${quote("Farmer's walk")}`)
 * // insert exercises values name = 'Farmer\'s walk'
 * @param value - the text to quote (anything else is converted with String first)
 * @param quoteChar - the quote to wrap it in
 */
export const quote = (value: any, quoteChar: '\'' | '"' = '\''): string =>
  `${quoteChar}${String(value).replace(/\\/g, '\\\\').split(quoteChar).join(`\\${quoteChar}`)}${quoteChar}`
