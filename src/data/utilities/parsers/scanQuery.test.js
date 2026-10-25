import { assertClosed, scanQuery } from './scanQuery'

const values = text => scanQuery(text).strings.map(scanned => scanned.value)

describe('scanQuery', () => {
  describe('strings', () => {
    test('finds single and double quoted strings, with their positions', () => {
      const text = 'read t where a = \'x\' and b = "y"'
      const { strings } = scanQuery(text)
      expect(strings).toEqual([
        { start: 17, end: 20, quote: '\'', value: 'x' },
        { start: 29, end: 32, quote: '"', value: 'y' }
      ])
      expect(text.slice(strings[0].start, strings[0].end)).toBe('\'x\'')
    })

    test('closes a string only with the quote it opened with', () => {
      expect(values('name = "it\'s"')).toEqual(['it\'s'])
      expect(values('name = \'say "hi"\'')).toEqual(['say "hi"'])
    })

    test('keeps keywords, operators and semicolons inside a string as text', () => {
      const scanned = scanQuery('insert notes values text = \'please read this; and -- not a comment /* either */\'')
      expect(scanned.strings[0].value).toBe('please read this; and -- not a comment /* either */')
      expect(scanned.semicolons).toEqual([])
      expect(scanned.comments).toEqual([])
    })

    test('finds an empty string', () => {
      expect(values('a = \'\' and b = ""')).toEqual(['', ''])
    })
  })

  describe('escapes', () => {
    test('escapes a quote, the other quote and a backslash', () => {
      expect(values('\'it\\\'s\'')).toEqual(['it\'s'])
      expect(values('"say \\"hi\\""')).toEqual(['say "hi"'])
      expect(values('\'C:\\\\temp\'')).toEqual(['C:\\temp'])
    })

    test('reads escapes left to right: \\\\\\\' is an escaped backslash then an escaped quote', () => {
      // The query text is '\\\'' : a backslash and a quote inside the string
      expect(values('\'\\\\\\\'\'')).toEqual(['\\\''])
    })

    test('turns \\n and \\t into a newline and a tab, and any other \\x into x', () => {
      expect(values('\'a\\nb\\tc\\qd\'')).toEqual(['a\nb\tcqd'])
    })

    test('gives a backslash no meaning outside a string', () => {
      const scanned = scanQuery('read t \\ where a = \'x\'')
      expect(scanned.strings.map(scanned => scanned.value)).toEqual(['x'])
      expect(scanned.closed).toBe(true)
    })
  })

  describe('comments', () => {
    test('finds a line comment, which ends at the end of the line', () => {
      const text = 'read t -- it\'s a comment; with "quotes"\nwhere a = 1;'
      const scanned = scanQuery(text)
      expect(scanned.comments).toEqual([{ start: 7, end: 40, kind: 'line' }])
      expect(scanned.strings).toEqual([])
      expect(scanned.semicolons).toEqual([text.length - 1])
    })

    test('starts a line comment only at the start, or after whitespace or a ;, since names can contain -', () => {
      expect(scanQuery('read my--table').comments).toEqual([])
      expect(scanQuery('-- first\nread t').comments).toEqual([{ start: 0, end: 9, kind: 'line' }])
      expect(scanQuery('read t;-- done').comments).toEqual([{ start: 7, end: 14, kind: 'line' }])
      expect(scanQuery('read t\t--done').comments).toEqual([{ start: 7, end: 13, kind: 'line' }])
    })

    test('finds a line comment at the very end, with no newline', () => {
      expect(scanQuery('read t -- the end').comments).toEqual([{ start: 7, end: 17, kind: 'line' }])
    })

    test('finds a block comment, which can span lines', () => {
      const text = 'read t /* one ; two\n\'three\' */ where a = 1'
      const scanned = scanQuery(text)
      expect(scanned.comments).toEqual([{ start: 7, end: 30, kind: 'block' }])
      expect(scanned.semicolons).toEqual([])
      expect(scanned.strings).toEqual([])
    })
  })

  describe('semicolons', () => {
    test('finds every ; outside strings and comments', () => {
      const text = 'read a; read b where c = \';\'; -- ;\nread d'
      expect(scanQuery(text).semicolons).toEqual([6, 28])
    })

    test('does not count a ; inside brackets', () => {
      expect(scanQuery('read t where a in [1;2]; read b').semicolons).toEqual([23])
      expect(scanQuery('read t where a in (1;2').semicolons).toEqual([])
    })

    test('is terminated when the last thing outside whitespace and comments is a ;', () => {
      expect(scanQuery('read a;').terminated).toBe(true)
      expect(scanQuery('read a; \n -- done\n /* really */ ').terminated).toBe(true)
      expect(scanQuery('read a').terminated).toBe(false)
      expect(scanQuery('read a; read b').terminated).toBe(false)
      expect(scanQuery('read a where b = \';\'').terminated).toBe(false)
      expect(scanQuery('read a; \'x\'').terminated).toBe(false)
    })
  })

  describe('what is left open', () => {
    test('a closed query', () => {
      const { end, closed } = scanQuery('read t where a in [1, (2), 3]')
      expect(end).toEqual({ quote: undefined, escape: false, blockComment: false, brackets: [], strayCloser: undefined })
      expect(closed).toBe(true)
    })

    test('an open string, and which quote opened it', () => {
      const scanned = scanQuery('read t where a = "it\'s')
      expect(scanned.end.quote).toBe('"')
      expect(scanned.closed).toBe(false)
      expect(scanned.strings[0]).toEqual({ start: 17, end: 22, quote: '"', value: 'it\'s' })
    })

    test('a string whose closing quote is escaped is still open', () => {
      const scanned = scanQuery('a = \'x\\\'')
      expect(scanned.end.quote).toBe('\'')
      expect(scanned.end.escape).toBe(false)
    })

    test('a backslash at the very end, waiting for the character it escapes', () => {
      const scanned = scanQuery('a = \'x\\')
      expect(scanned.end.quote).toBe('\'')
      expect(scanned.end.escape).toBe(true)
    })

    test('an open block comment', () => {
      const scanned = scanQuery('read t /* still going ;')
      expect(scanned.end.blockComment).toBe(true)
      expect(scanned.closed).toBe(false)
      expect(scanned.terminated).toBe(false)
    })

    test('open brackets, innermost last', () => {
      const scanned = scanQuery('where a in [1, (2')
      expect(scanned.end.brackets).toEqual(['[', '('])
      expect(scanned.closed).toBe(false)
    })

    test('the first closing bracket which had nothing to close', () => {
      expect(scanQuery('where a in 1, 2] )').end.strayCloser).toEqual({ char: ']', index: 15 })
      expect(scanQuery('where a in [1, 2)').end.strayCloser).toEqual({ char: ')', index: 16 })
    })
  })

  test('scans an empty or missing query', () => {
    expect(scanQuery('')).toEqual(scanQuery())
    expect(scanQuery().closed).toBe(true)
    expect(scanQuery().terminated).toBe(false)
  })
})

describe('assertClosed', () => {
  test('returns a closed scan unchanged', () => {
    const scanned = scanQuery('read t where a = \'x\';')
    expect(assertClosed(scanned)).toBe(scanned)
  })

  test('throws for an unclosed string', () => {
    expect(() => assertClosed(scanQuery('a = \'abc'))).toThrow('Unclosed string: the \' at position 4 is never closed')
  })

  test('throws for an unclosed block comment', () => {
    expect(() => assertClosed(scanQuery('read t /* no end'))).toThrow('Unclosed comment: the /* at position 7 is never closed')
  })

  test('throws for a closing bracket with nothing to close', () => {
    expect(() => assertClosed(scanQuery('where a in 1]'))).toThrow('Unexpected ] at position 12: there is nothing to close')
  })

  test('throws for an unclosed bracket', () => {
    expect(() => assertClosed(scanQuery('where a in [1, (2'))).toThrow('Unclosed bracket: [ ( never closed')
  })
})
