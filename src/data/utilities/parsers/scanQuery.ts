export type QuoteChar = '\'' | '"'

export type BracketChar = '[' | '('

export type ScannedString = {
  // Index of the opening quote
  start: number
  // Index just after the closing quote (the end of the text when the string is unclosed)
  end: number
  quote: QuoteChar
  // The string's contents with the escapes applied
  value: string
}

export type ScannedComment = {
  // Index of the first character of `--` or `/*`
  start: number
  // Index just after the end of the line (`--`) or the closing `*/` (the end of the text when unclosed)
  end: number
  kind: 'line' | 'block'
}

export type ScanState = {
  // The quote of a string left open at the end of the text
  quote: QuoteChar | undefined
  // A backslash at the very end of the text, inside an open string
  escape: boolean
  // Whether the text ends inside a block comment
  blockComment: boolean
  // The brackets left open at the end of the text, innermost last
  brackets: BracketChar[]
  // The first closing bracket which had nothing to close
  strayCloser: { char: string, index: number } | undefined
}

export type ScannedQuery = {
  strings: ScannedString[]
  comments: ScannedComment[]
  // Indexes of every `;` outside strings and comments
  semicolons: number[]
  end: ScanState
  // Nothing is left open: no string, block comment or bracket
  closed: boolean
  // Closed, and the last thing outside whitespace and comments is a `;`
  terminated: boolean
}

const escapes: { [char: string]: string } = { n: '\n', t: '\t' }

const closers: { [char: string]: BracketChar } = { ']': '[', ')': '(' }

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
export const scanQuery = (text: string = ''): ScannedQuery => {
  const strings: ScannedString[] = []
  const comments: ScannedComment[] = []
  const semicolons: number[] = []
  const brackets: BracketChar[] = []
  let strayCloser: ScanState['strayCloser']
  let openQuote: QuoteChar | undefined
  let escape = false
  let blockComment = false
  let lastCode = -1
  let index = 0

  while (index < text.length) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '\'' || char === '"') {
      const start = index
      let value = ''
      index++
      while (index < text.length && text[index] !== char) {
        if (text[index] === '\\') {
          if (index + 1 === text.length) {
            escape = true
            index++
            break
          }
          value += escapes[text[index + 1]] ?? text[index + 1]
          index += 2
          continue
        }
        value += text[index]
        index++
      }
      if (index < text.length) {
        index++
      } else {
        openQuote = char
      }
      strings.push({ start, end: index, quote: char, value })
      lastCode = start
      continue
    }

    if (char === '-' && next === '-') {
      const newline = text.indexOf('\n', index + 2)
      const end = newline === -1 ? text.length : newline + 1
      comments.push({ start: index, end, kind: 'line' })
      index = end
      continue
    }

    if (char === '/' && next === '*') {
      const close = text.indexOf('*/', index + 2)
      const end = close === -1 ? text.length : close + 2
      blockComment = close === -1
      comments.push({ start: index, end, kind: 'block' })
      index = end
      continue
    }

    if (char === '[' || char === '(') {
      brackets.push(char)
    } else if (closers[char]) {
      if (brackets[brackets.length - 1] === closers[char]) {
        brackets.pop()
      } else if (!strayCloser) {
        strayCloser = { char, index }
      }
    } else if (char === ';') {
      semicolons.push(index)
    }
    if (!/\s/.test(char)) {
      lastCode = index
    }
    index++
  }

  const end: ScanState = { quote: openQuote, escape, blockComment, brackets, strayCloser }
  const closed = !end.quote && !end.blockComment && brackets.length === 0
  return {
    strings,
    comments,
    semicolons,
    end,
    closed,
    terminated: closed && semicolons.length > 0 && semicolons[semicolons.length - 1] === lastCode
  }
}

/**
 * Throw a clear error for anything scanQuery found left open or unmatched: a string, a block comment or a bracket.
 * @param scanned
 */
export const assertClosed = (scanned: ScannedQuery): ScannedQuery => {
  const { end } = scanned
  if (end.quote) {
    const open = scanned.strings[scanned.strings.length - 1]
    throw new Error(`Unclosed string: the ${end.quote} at position ${open.start} is never closed`)
  }
  if (end.blockComment) {
    throw new Error(`Unclosed comment: the /* at position ${scanned.comments[scanned.comments.length - 1].start} is never closed`)
  }
  if (end.strayCloser) {
    throw new Error(`Unexpected ${end.strayCloser.char} at position ${end.strayCloser.index}: there is nothing to close`)
  }
  if (end.brackets.length > 0) {
    throw new Error(`Unclosed bracket: ${end.brackets.join(' ')} never closed`)
  }
  return scanned
}
