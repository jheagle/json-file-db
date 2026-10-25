import { splitQueries } from '../utilities/parsers/splitQueries'
import { parseQuery } from '../utilities/parsers/parseQuery'

export const parser = (queries: string = '') => {
  const queryArray: string[] = splitQueries(queries)
  return queryArray.map((query, index) => {
    try {
      return parseQuery(query)
    } catch (e) {
      const which = queryArray.length > 1 ? ` query ${index + 1} of ${queryArray.length}` : ''
      throw new Error(`Failed to interpret${which}: ${query} (${(e as Error).message})`)
    }
  })
}
