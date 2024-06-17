import { parser } from './parser'
import { runQuery } from '../utilities/runQuery'

export const query = async (queryString = '') => {
  const parsedQueries = parser(queryString)
  const queryResults = []
  for (let parsed of parsedQueries) {
    const dataSet = await runQuery(parsed)
    queryResults.push(dataSet[parsed.entity])
  }
  return queryResults
}
