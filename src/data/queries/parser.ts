import { splitQueries } from '../utilities/parsers/splitQueries'
import { parseQuery } from '../utilities/parsers/parseQuery'

export const parser = (queries: string = '') => {
  const queryArray: string[] = splitQueries(queries)
  const parsedQueries = []
  let mergeQuery = ''
  for (let query of queryArray) {
    mergeQuery = mergeQuery ? `${mergeQuery}${query}` : query
    let parsedQuery = {}
    try {
      parsedQuery = parseQuery(mergeQuery)
      mergeQuery = ''
    } catch (e) {
      // attempt to combine queries to fix bad splits
      continue
    }
    parsedQueries.push(parsedQuery)
  }
  if (mergeQuery) {
    throw new Error(`Failed to interpret: ${mergeQuery}`)
  }
  return parsedQueries
}
