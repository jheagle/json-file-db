import { assertClosed, scanQuery } from './scanQuery'

/**
 * Regex source matching one placeholder from maskStrings, with the hex-encoded value as its only group. The
 * find* parsers use it where they would otherwise match a quoted string.
 */
export const placeholderSource = '\\u0000([0-9a-f]*)\\u0000'

const placeholderMatch = new RegExp(placeholderSource, 'g')

/**
 * Encode a value as hex, four digits per UTF-16 code unit: only 0-9 and a-f, so no keyword, quote, space or
 * bracket a parser looks for can appear in it.
 * @param value
 */
const toHex = (value: string): string =>
  value.split('').map((char) => char.charCodeAt(0).toString(16).padStart(4, '0')).join('')

/**
 * Turn the hex of a placeholder back into the string's value.
 * @param hex
 */
export const fromPlaceholder = (hex: string): string =>
  (hex.match(/.{4}/g) || []).map((code) => String.fromCharCode(parseInt(code, 16))).join('')

/**
 * Replace every quoted string in a query with a placeholder holding its value (with the escapes applied), so that
 * nothing inside a string (a keyword, a quote, `and`, a `]`) can be matched by the find* parsers.
 * @param query
 * @throws {Error} For an unclosed string, comment or bracket, or a NUL character outside a string (which could
 * otherwise pass for a placeholder).
 */
export const maskStrings = (query: string): string => {
  const { strings } = assertClosed(scanQuery(query))
  for (let index = query.indexOf('\u0000'); index !== -1; index = query.indexOf('\u0000', index + 1)) {
    if (!strings.some(({ start, end }) => start < index && index < end)) {
      throw new Error(`Unexpected NUL character at position ${index}`)
    }
  }
  return strings.reduceRight(
    (masked, { start, end, value }) => `${masked.slice(0, start)}\u0000${toHex(value)}\u0000${masked.slice(end)}`,
    query
  )
}

/**
 * Put every placeholder back as a quoted string, the way it would be written in a query: for error messages, and
 * for array literals read as JSON.
 * @param text
 * @param quote - wrap with JSON's double quotes (the default) or with single quotes
 */
export const unmaskStrings = (text: string, quote: 'json' | '\'' = 'json'): string =>
  text.replace(placeholderMatch, (placeholder, hex) => {
    const value = fromPlaceholder(hex)
    return quote === 'json' ? JSON.stringify(value) : `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`
  })
