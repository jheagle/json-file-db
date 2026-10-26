import { assertClosed, scanQuery } from './scanQuery'

/**
 * Split a string of queries into one query each, on the `;` between them. A `;` inside a string or a comment does
 * not count, comments are removed, and the `;` after the last query is optional.
 * @param queries
 * @throws {Error} For an unclosed string, block comment or bracket.
 */
export const splitQueries = (queries: string = ''): string[] => {
  const { comments, semicolons } = assertClosed(scanQuery(queries))
  // Blank each comment out with spaces, so the positions of the ; stay the same and the words either side stay apart
  const uncommented = comments.reduce(
    (text, { start, end }) => `${text.slice(0, start)}${' '.repeat(end - start)}${text.slice(end)}`,
    queries
  )
  return [...semicolons, uncommented.length]
    .map((end, index) => uncommented.slice(index === 0 ? 0 : semicolons[index - 1] + 1, end).trim())
    .filter((query) => query.length > 0)
}
