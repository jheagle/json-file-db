import siFunciona from 'si-funciona'
import { findCommand, ParsedCommand, ParsedEntity } from './findCommand'
import { findJoinEntity, ParsedJoinEntity } from './findJoinEntity'
import { findSelects, ParsedSelect } from './findSelects'
import { findConditions, ParsedCondition } from './findConditions'
import { findJoinClauses, ParsedJoinClause } from './findJoinClauses'
import { findMergeJoins, ParsedMergeJoin } from './findMergeJoins'
import { findSortClauses, ParsedSortClause } from './findSortClauses'
import { findGroupBy, ParsedGroupBy } from './findGroupBy'
import { findLimit, ParsedLimit } from './findLimit'
import { findOffset, ParsedOffset } from './findOffset'

/**
 * @typedef {Object} ParsedQuery
 * @property {ParsedCommand|undefined} command
 * @property {ParsedEntity|undefined} entity
 * @property {ParsedJoinEntity|undefined} joinEntity
 * @property {Array<ParsedSelect>} selectClauses
 * @property {Array<ParsedCondition>} conditions
 * @property {Array<ParsedJoinClause>} joinClauses
 * @property {Array<ParsedMergeJoin>} mergeJoins
 * @property {Array<ParsedSortClause>} sortClauses
 * @property {ParsedGroupBy|undefined} groupBy
 * @property {ParsedLimit|undefined} limit
 * @property {ParsedOffset|undefined} offset
 */

export type ParsedQuery = {
  command: ParsedCommand | undefined
  entity: ParsedEntity | undefined
  joinEntity: ParsedJoinEntity | undefined
  selectClauses: ParsedSelect[]
  conditions: ParsedCondition[]
  joinClauses: ParsedJoinClause[]
  mergeJoins: ParsedMergeJoin[]
  sortClauses: ParsedSortClause[]
  groupBy: ParsedGroupBy | undefined
  limit: ParsedLimit | undefined
  offset: ParsedOffset | undefined
}

/**
 * Break a query down into its components.
 * @param {string} query
 * @returns {ParsedQuery}
 */
export const parseQuery = (query: string): ParsedQuery => {
  let parsedQuery: ParsedQuery = {
    command: undefined,
    entity: undefined,
    joinEntity: undefined,
    selectClauses: [],
    conditions: [],
    joinClauses: [],
    mergeJoins: [],
    sortClauses: [],
    groupBy: undefined,
    limit: undefined,
    offset: undefined,
  }

  const { curry, pipe } = siFunciona

  query = pipe(
    curry(findCommand)(parsedQuery),
    curry(findJoinEntity)(parsedQuery),
    curry(findSelects)(parsedQuery),
    curry(findConditions)(parsedQuery),
    curry(findJoinClauses)(parsedQuery),
    curry(findMergeJoins)(parsedQuery),
    curry(findSortClauses)(parsedQuery),
    curry(findGroupBy)(parsedQuery),
    curry(findLimit)(parsedQuery),
    curry(findOffset)(parsedQuery)
  )(query)

  if (query) {
    throw new Error(`Unrecognized query value: ${query}`)
  }
  return parsedQuery
}