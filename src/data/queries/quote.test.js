import { quote } from './quote'
import { parser } from './parser'

// What the parser reads back for a quoted value
const readBack = text => parser(`insert t values a = ${text}`)[0].insertValues[0].a

describe('quote', () => {
  test('wraps text in single quotes', () => {
    expect(quote('hello')).toBe('\'hello\'')
  })

  test('escapes the quote and the backslash', () => {
    expect(quote('it\'s')).toBe('\'it\\\'s\'')
    expect(quote('C:\\temp')).toBe('\'C:\\\\temp\'')
    expect(quote('\\\'')).toBe('\'\\\\\\\'\'')
  })

  test('wraps in double quotes when asked, escaping those instead', () => {
    expect(quote('say "hi", it\'s', '"')).toBe('"say \\"hi\\", it\'s"')
  })

  test('converts anything else to text first', () => {
    expect(quote(42)).toBe('\'42\'')
    expect(quote(null)).toBe('\'null\'')
  })

  test.each([
    'plain',
    '',
    'it\'s',
    'say "hi"',
    '\\\'',
    '\\',
    'ends with a backslash \\',
    'C:\\new\\table',
    'a; read b -- not a comment /* nor this */',
    'x\' and where b = \'y',
    '[1, 2] sort a limit 1',
    'line one\nline two\ttabbed',
    'Ça va? 你好 🏃'
  ])('reads back exactly through the parser: %j', (value) => {
    expect(readBack(quote(value))).toBe(value)
    expect(readBack(quote(value, '"'))).toBe(value)
  })
})
