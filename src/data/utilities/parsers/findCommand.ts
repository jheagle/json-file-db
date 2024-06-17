import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const commandMatch: RegExp = /^(delete|insert|read|update)\s+([a-z0-9_-]+)[\w\n]*/i

/**
 * The command for this query.
 * @typedef {string} ParsedCommand
 */
export type ParsedCommand = string | 'delete' | 'insert' | 'read' | 'update'

/**
 * The main entity for this query.
 * @typedef {string} ParsedEntity
 */
export type ParsedEntity = string

/**
 * Extract command clauses from the query.
 * @param {ParsedQuery} parsed
 * @param {string} query
 * @returns {string}
 */
export const findCommand = (parsed: ParsedQuery, query: string): string => {
  const commandFound: RegExpMatchArray = query.match(commandMatch)
  parsed['command'] = undefined
  parsed['entity'] = undefined
  if (commandFound) {
    parsed['command'] = commandFound[1]
    parsed['entity'] = commandFound[2]
    return removeFromQuery(commandFound[0], query)
  }
  return query
}