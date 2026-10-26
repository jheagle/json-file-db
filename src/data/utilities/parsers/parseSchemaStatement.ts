import { unmaskStrings } from './maskStrings'
import { startsQueryMatch } from './startsQuery'

export type ParsedSchemaStatement = {
  command: 'drop' | 'describe' | 'show'
  entity: string
  ifExists: boolean
}

export const schemaStatementMatch: RegExp = /^\s*(drop|describe|show)(?![a-z0-9_-])/i

const dropMatch: RegExp = /^\s*drop\s+(if\s+exists\s+)?([a-z0-9_-]+)/i
const describeMatch: RegExp = /^\s*describe\s+([a-z0-9_-]+)/i
const showMatch: RegExp = /^\s*show\s+records(?![a-z0-9_-])/i

/**
 * Throw for anything left after a statement: "Missing ; before" when it is another query.
 * @param rest
 */
const assertNothingAfter = (rest: string): void => {
  const after = rest.trim()
  if (!after) {
    return
  }
  const shown = unmaskStrings(after, '\'')
  if (startsQueryMatch.test(after)) {
    throw new Error(`Missing ; before: ${shown}`)
  }
  throw new Error(`Unrecognized query value: ${shown}`)
}

/**
 * Throw for the registry's own name, which the schema statements don't act on.
 * @param entity
 */
const assertNotRegistry = (entity: string): void => {
  if (entity === '__RECORDS') {
    throw new Error('__RECORDS is reserved for the list of records (use: show records)')
  }
}

/**
 * Parse `drop [if exists] <name>`, `describe <name>` or `show records` (strings and arrays already masked). `show`
 * resolves to the registry, so its entity is `__RECORDS`.
 * @param query
 */
export const parseSchemaStatement = (query: string): ParsedSchemaStatement => {
  const command = query.match(schemaStatementMatch)[1].toLowerCase()
  if (command === 'drop') {
    const found = query.match(dropMatch)
    // `drop if exists` with no name would otherwise read `if` as the name
    if (!found || /^\s*drop\s+if\s+exists\s*$/i.test(query)) {
      throw new Error('Expected: drop [if exists] <name>')
    }
    assertNotRegistry(found[2])
    assertNothingAfter(query.slice(found[0].length))
    return { command: 'drop', entity: found[2], ifExists: Boolean(found[1]) }
  }
  if (command === 'describe') {
    const found = query.match(describeMatch)
    if (!found) {
      throw new Error('Expected: describe <name>')
    }
    assertNotRegistry(found[1])
    assertNothingAfter(query.slice(found[0].length))
    return { command: 'describe', entity: found[1], ifExists: false }
  }
  const found = query.match(showMatch)
  if (!found) {
    throw new Error('Expected: show records (the only thing that can be shown so far)')
  }
  assertNothingAfter(query.slice(found[0].length))
  return { command: 'show', entity: '__RECORDS', ifExists: false }
}
