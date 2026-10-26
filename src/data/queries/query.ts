import { parser } from './parser'
import { runQuery } from '../utilities/runQuery'
import { withDatabaseLock } from '../utilities/databaseLock'

/**
 * Parse a query string (one query, or several separated by `;`) and run each query in turn, resolving to one result
 * per query. The queries of one call run together, under the database lock: no other call's queries run between
 * them (see withDatabaseLock).
 * @param queryString
 */
export const query = async (queryString = '') => {
  const parsedQueries = parser(queryString)
  return withDatabaseLock(async () => {
    const queryResults = []
    for (const parsed of parsedQueries) {
      const dataSet = await runQuery(parsed)
      queryResults.push(dataSet[parsed.entity])
    }
    return queryResults
  })
}
