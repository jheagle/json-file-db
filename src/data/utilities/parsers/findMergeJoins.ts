import { removeFromQuery } from './removeFromQuery'
import { ParsedQuery } from './parseQuery'

const mergeJoinMatch: RegExp = /(and)?\s*merge\s+([a-z0-9_-]+\.[a-z0-9_-]+)\s+with\s+([a-z0-9_-]+\.[a-z0-9_-]+)/ig

export type ParsedMergeJoin = {
  propertyA: string
  propertyB: string
}

/**
 * Extract merge-join clauses from the query.
 * @param parsed
 * @param query
 */
export const findMergeJoins = (parsed: ParsedQuery, query: string): string => {
  const mergeJoinsFound: IterableIterator<RegExpMatchArray> = query.matchAll(mergeJoinMatch)
  // @ts-ignore
  for (let mergeJoin of mergeJoinsFound) {
    parsed['mergeJoins'].push({
      propertyA: mergeJoin[2],
      propertyB: mergeJoin[3]
    })
    query = removeFromQuery(mergeJoin[0].trim(), query)
  }
  return query
}