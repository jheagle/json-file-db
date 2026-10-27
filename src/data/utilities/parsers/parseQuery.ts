import siFunciona from 'si-funciona'
import { findCommand, ParsedCommand, ParsedEntity } from './findCommand'
import { findInsertValues, ParsedInsertRow } from './findInsertValues'
import { findUpdateValues, ParsedUpdateValues } from './findUpdateValues'
import { findJoinEntity, ParsedJoinEntity } from './findJoinEntity'
import { findSelects, ParsedSelect } from './findSelects'
import { findConditions } from './findConditions'
import { ConditionNode } from '../conditionTree'
import { findJoinClauses, ParsedJoinClause } from './findJoinClauses'
import { findMergeJoins, ParsedMergeJoin } from './findMergeJoins'
import { findSortClauses, ParsedSortClause } from './findSortClauses'
import { findGroupBy, ParsedGroupBy } from './findGroupBy'
import { findLimit, ParsedLimit } from './findLimit'
import { findOffset, ParsedOffset } from './findOffset'
import { maskArrays, maskStrings, unmaskStrings } from './maskStrings'
import { createMatch, parseCreate, ParsedCreate } from './parseCreate'
import { parseSchemaStatement, schemaStatementMatch } from './parseSchemaStatement'
import { startsQueryMatch } from './startsQuery'

export type ParsedQuery = {
  command: ParsedCommand | undefined
  entity: ParsedEntity | undefined
  joinEntity: ParsedJoinEntity | undefined
  selectClauses: ParsedSelect[]
  insertValues: ParsedInsertRow[]
  updateValues: ParsedUpdateValues
  // The where clause as a tree (see ConditionNode); undefined when the query has none
  where: ConditionNode | undefined
  joinClauses: ParsedJoinClause[]
  mergeJoins: ParsedMergeJoin[]
  sortClauses: ParsedSortClause[]
  groupBy: ParsedGroupBy | undefined
  limit: ParsedLimit | undefined
  offset: ParsedOffset | undefined
  create: ParsedCreate | undefined
  ifExists: boolean | undefined
}

/**
 * Break a query down into its components.
 * @param query
 */
export const parseQuery = (query: string): ParsedQuery => {
  const parsedQuery: ParsedQuery = {
    command: undefined,
    entity: undefined,
    joinEntity: undefined,
    selectClauses: [],
    insertValues: [],
    updateValues: {},
    where: undefined,
    joinClauses: [],
    mergeJoins: [],
    sortClauses: [],
    groupBy: undefined,
    limit: undefined,
    offset: undefined,
    create: undefined,
    ifExists: undefined,
  }

  const { curry, pipe } = siFunciona

  // No find* step may see inside a string or an array: each one becomes a placeholder holding its value
  query = maskArrays(maskStrings(query))

  // A create statement has its own shape (a bracketed list of fields and keys), so it gets its own parser
  if (createMatch.test(query)) {
    const { entity, create } = parseCreate(query)
    return Object.assign(parsedQuery, { command: 'create', entity, create })
  }
  if (schemaStatementMatch.test(query)) {
    return Object.assign(parsedQuery, parseSchemaStatement(query))
  }

  query = pipe(
    curry(findCommand)(parsedQuery),
    curry(findInsertValues)(parsedQuery),
    curry(findUpdateValues)(parsedQuery),
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
    if (startsQueryMatch.test(query)) {
      throw new Error(`Missing ; before: ${unmaskStrings(query.trim(), '\'')}`)
    }
    throw new Error(`Unrecognized query value: ${unmaskStrings(query, '\'')}`)
  }
  return parsedQuery
}
