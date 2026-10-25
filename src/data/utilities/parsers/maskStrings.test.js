import { fromPlaceholder, maskStrings, placeholderSource, unmaskStrings } from './maskStrings'

const placeholders = text => [...text.matchAll(new RegExp(placeholderSource, 'g'))].map(match => fromPlaceholder(match[1]))

describe('maskStrings', () => {
  test('replaces each string with a placeholder holding its value, leaving the rest of the query as it was', () => {
    const masked = maskStrings('read t where a = \'x\' and where b = "y"')
    expect(masked).toMatch(new RegExp(`^read t where a = ${placeholderSource} and where b = ${placeholderSource}$`))
    expect(placeholders(masked)).toEqual(['x', 'y'])
  })

  test('puts nothing a parser looks for inside a placeholder: no keyword, space, quote or bracket', () => {
    const masked = maskStrings('a = \'where b = "c" sort [1]\'')
    expect(masked.slice(4)).toMatch(new RegExp(`^${placeholderSource}$`))
  })

  test('holds the value with its escapes applied', () => {
    expect(placeholders(maskStrings('a = \'it\\\'s\', b = \'\\\\\\\'\''))).toEqual(['it\'s', '\\\''])
  })

  test('round-trips any text, including non-Latin letters, emoji and an empty string', () => {
    expect(placeholders(maskStrings('a = \'Ça va? 你好 🏃\', b = \'\''))).toEqual(['Ça va? 你好 🏃', ''])
  })

  test('throws for an unclosed string', () => {
    expect(() => maskStrings('a = \'abc"')).toThrow('Unclosed string')
  })
})

describe('unmaskStrings', () => {
  test('puts placeholders back as JSON strings by default, for array literals', () => {
    expect(unmaskStrings(maskStrings('[\'x\', "it\'s"]'))).toBe('["x", "it\'s"]')
  })

  test('puts placeholders back as single-quoted strings, escaped as they would be written', () => {
    const text = 'a = \'it\\\'s\' and \'C:\\\\temp\''
    expect(unmaskStrings(maskStrings(text), '\'')).toBe(text)
  })
})
