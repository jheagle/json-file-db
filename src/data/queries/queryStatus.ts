import { scanQuery } from '../utilities/parsers/scanQuery'

export type QueryStatus = {
  // The text is ready to run: nothing is left open and it ends with a `;` (comments and whitespace after it are fine)
  complete: boolean
  // What the text is waiting for, innermost first: `'` or `"` (a string), `/*` (a block comment), `[` or `(`
  // (a bracket), or `;` (everything is closed but the query isn't ended). Empty when complete.
  waitingFor: string
}

/**
 * Whether some query text, typed so far, is ready to run, and if not what it is waiting for: for a prompt which
 * reads a query over several lines (such as the CLI). Uses the same rules as the parser, so a `;` inside a string,
 * a comment or brackets doesn't count, and an open quote, comment or bracket keeps the query going.
 * @example
 * queryStatus("read notes where text = 'it") // { complete: false, waitingFor: "'" }
 * queryStatus('read notes;') // { complete: true, waitingFor: '' }
 * @param text - everything typed so far; join the lines with '\n', since a `--` comment ends at the end of a line
 */
export const queryStatus = (text: string = ''): QueryStatus => {
  const { end, closed, terminated } = scanQuery(text)
  if (terminated) {
    return { complete: true, waitingFor: '' }
  }
  if (end.quote) {
    return { complete: false, waitingFor: end.quote }
  }
  if (end.blockComment) {
    return { complete: false, waitingFor: '/*' }
  }
  if (!closed) {
    return { complete: false, waitingFor: end.brackets[end.brackets.length - 1] }
  }
  return { complete: false, waitingFor: ';' }
}
