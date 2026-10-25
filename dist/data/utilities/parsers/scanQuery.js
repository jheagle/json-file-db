"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scanQuery = exports.assertClosed = void 0;
const escapes = {
  n: '\n',
  t: '\t'
};
const closers = {
  ']': '[',
  ')': '('
};
/**
 * Walk a query once, left to right, finding its strings, comments and the `;` between statements.
 *
 * Strings use `'` or `"` and close only with the quote they opened with. Inside a string a backslash escapes the
 * next character: `\n` and `\t` are a newline and a tab, any other `\x` is `x` (so `\'`, `\"` and `\\` are a quote
 * and a backslash). Outside strings a backslash has no meaning. Comments run from `--` to the end of the line, or
 * from `/*` to `*\/`; anything inside a comment is ignored, and comment markers inside a string are just text. A `--`
 * starts a comment only at the start of the text or after whitespace or a `;`, since names can contain `-`
 * (`my--table` is a name). A `;` inside brackets does not end a query.
 *
 * Never throws: whatever is left open is reported in `end`, for a prompt which asks for more input. Use
 * assertClosed to turn it into an error.
 * @param text
 */
const scanQuery = (text = '') => {
  const strings = [];
  const comments = [];
  const semicolons = [];
  const brackets = [];
  let strayCloser;
  let openQuote;
  let escape = false;
  let blockComment = false;
  let lastCode = -1;
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '\'' || char === '"') {
      const start = index;
      let value = '';
      index++;
      while (index < text.length && text[index] !== char) {
        if (text[index] === '\\') {
          if (index + 1 === text.length) {
            escape = true;
            index++;
            break;
          }
          value += escapes[text[index + 1]] ?? text[index + 1];
          index += 2;
          continue;
        }
        value += text[index];
        index++;
      }
      if (index < text.length) {
        index++;
      } else {
        openQuote = char;
      }
      strings.push({
        start,
        end: index,
        quote: char,
        value
      });
      lastCode = start;
      continue;
    }
    if (char === '-' && next === '-' && (index === 0 || /[\s;]/.test(text[index - 1]))) {
      const newline = text.indexOf('\n', index + 2);
      const end = newline === -1 ? text.length : newline + 1;
      comments.push({
        start: index,
        end,
        kind: 'line'
      });
      index = end;
      continue;
    }
    if (char === '/' && next === '*') {
      const close = text.indexOf('*/', index + 2);
      const end = close === -1 ? text.length : close + 2;
      blockComment = close === -1;
      comments.push({
        start: index,
        end,
        kind: 'block'
      });
      index = end;
      continue;
    }
    if (char === '[' || char === '(') {
      brackets.push(char);
    } else if (closers[char]) {
      if (brackets[brackets.length - 1] === closers[char]) {
        brackets.pop();
      } else if (!strayCloser) {
        strayCloser = {
          char,
          index
        };
      }
    } else if (char === ';' && brackets.length === 0) {
      semicolons.push(index);
    }
    if (!/\s/.test(char)) {
      lastCode = index;
    }
    index++;
  }
  const end = {
    quote: openQuote,
    escape,
    blockComment,
    brackets,
    strayCloser
  };
  const closed = !end.quote && !end.blockComment && brackets.length === 0;
  return {
    strings,
    comments,
    semicolons,
    end,
    closed,
    terminated: closed && semicolons.length > 0 && semicolons[semicolons.length - 1] === lastCode
  };
};
/**
 * Throw a clear error for anything scanQuery found left open or unmatched: a string, a block comment or a bracket.
 * @param scanned
 */
exports.scanQuery = scanQuery;
const assertClosed = scanned => {
  const {
    end
  } = scanned;
  if (end.quote) {
    const open = scanned.strings[scanned.strings.length - 1];
    throw new Error(`Unclosed string: the ${end.quote} at position ${open.start} is never closed`);
  }
  if (end.blockComment) {
    throw new Error(`Unclosed comment: the /* at position ${scanned.comments[scanned.comments.length - 1].start} is never closed`);
  }
  if (end.strayCloser) {
    throw new Error(`Unexpected ${end.strayCloser.char} at position ${end.strayCloser.index}: there is nothing to close`);
  }
  if (end.brackets.length > 0) {
    throw new Error(`Unclosed bracket: ${end.brackets.join(' ')} never closed`);
  }
  return scanned;
};
exports.assertClosed = assertClosed;