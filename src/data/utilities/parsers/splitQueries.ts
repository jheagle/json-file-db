const queryMatch = /\s*(?=(?:delete|insert|read|update)\s+[a-z0-9._-]+)\s*/i

export const splitQueries = (queries: string = ''): string[] =>
  queries.split(queryMatch).filter((query) => query.length > 0)