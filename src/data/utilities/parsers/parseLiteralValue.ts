import { fromPlaceholder } from './maskStrings'

export type LiteralValue = string | number | boolean | null | any[]

/**
 * Regex source matching one number literal: an optional `-`, digits, an optional fraction and an optional exponent
 * (`12`, `-3`, `1.5`, `1e3`, `2.5E-4`), with no group of its own. Anything left after it (`5abc`, `1.5.2`) is an
 * unrecognized query value, as for any other leftover text.
 */
export const numberSource = '-?[0-9]+(?:\\.[0-9]+)?(?:e[+-]?[0-9]+)?'

/**
 * Read one number literal's text (see numberSource) as a number, refusing any it can't hold exactly as written: a
 * whole number past Number.MAX_SAFE_INTEGER, however it is written (`9007199254740993`, `9007199254740993.0`, `1e20`),
 * may be stored rounded (9007199254740993 as 9007199254740992), and a number too big for a double reads as Infinity,
 * which JSON writes back as null. Fractions are kept as the nearest double, as JSON does (an exact decimal type is
 * planned).
 * @param text
 * @throws {Error} For an integer past Number.MAX_SAFE_INTEGER, or a number too big for a double.
 */
export const parseNumber = (text: string): number => {
  const value = Number(text)
  if (!Number.isFinite(value)) {
    throw new Error(`${text} is too large`)
  }
  if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new Error(`${text} is too large to store exactly (the largest whole number is ${Number.MAX_SAFE_INTEGER}): quote it to keep it as text`)
  }
  return value
}

/**
 * Several parsers (findConditions, findInsertValues, findUpdateValues) capture a query-string
 * literal into one of six consecutive alternation groups depending on its shape - quoted string
 * (by then a placeholder from maskStrings, holding the string's value as hex),
 * number, array, null, true, false - since a single regex can't otherwise tell them apart. Given
 * the match and the index of the first of those six groups (which shifts depending on how many
 * groups come before it in the parent regex), return the literal with its real JS type.
 * @param match
 * @param baseIndex
 */
export const parseLiteralValue = (match: RegExpMatchArray, baseIndex: number): LiteralValue => {
  if (typeof match[baseIndex] !== 'undefined') {
    return fromPlaceholder(match[baseIndex])
  }
  if (typeof match[baseIndex + 1] !== 'undefined') {
    return parseNumber(match[baseIndex + 1])
  }
  if (typeof match[baseIndex + 2] !== 'undefined') {
    // An array is a placeholder from maskArrays, holding its JSON
    return JSON.parse(fromPlaceholder(match[baseIndex + 2]))
  }
  if (typeof match[baseIndex + 3] !== 'undefined') {
    return null
  }
  if (typeof match[baseIndex + 4] !== 'undefined') {
    return true
  }
  return false
}
