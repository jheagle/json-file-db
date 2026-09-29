import { parseLiteralValue } from './parseLiteralValue'

describe('parseLiteralValue', () => {
  const groupMatch = (regex, str) => str.match(regex)

  test('extracts a quoted string', () => {
    const regex = /(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/
    const match = groupMatch(regex, "'foo'")
    expect(parseLiteralValue(match, 2)).toBe('foo')
  })

  test('extracts a number', () => {
    const regex = /(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/
    const match = groupMatch(regex, '42')
    expect(parseLiteralValue(match, 2)).toBe(42)
  })

  test('extracts an array', () => {
    const regex = /(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/
    const match = groupMatch(regex, '[1,2,3]')
    expect(parseLiteralValue(match, 2)).toEqual([1, 2, 3])
  })

  test('extracts null', () => {
    const regex = /(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/
    const match = groupMatch(regex, 'null')
    expect(parseLiteralValue(match, 2)).toBeNull()
  })

  test('extracts true/false', () => {
    const regex = /(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/
    expect(parseLiteralValue(groupMatch(regex, 'true'), 2)).toBe(true)
    expect(parseLiteralValue(groupMatch(regex, 'false'), 2)).toBe(false)
  })

  test('honors a different baseIndex for a differently-shaped parent regex', () => {
    const regex = /([a-z]+)\s*=\s*(["'](.*)['"]|([0-9]+)|(\[.*])|(null)|(true)|(false))/
    const match = groupMatch(regex, 'reps=10')
    expect(parseLiteralValue(match, 3)).toBe(10)
  })
})
