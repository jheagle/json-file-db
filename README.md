# json-file-db

Read and manage data with JSON files - a small query engine that treats a folder of JSON files as a database, with
a SQL-like query string (`read workouts where date = '2024-06-02'`) instead of a query builder API.

## Install

```shell
npm install json-file-db
```

## Documentation

The reference for every function is in [`docs/`](https://joshuaheagle.com/projects/json-file-db/docs/index.html) (or open `docs/index.html` locally). It is generated from the TypeScript source, and each module is a folder of `src/data/`:

| Module | What it holds |
| --- | --- |
| `introspect` | Create, drop and describe a JSON-file "table" (and the policies that validate one) |
| `queries` | Parse a query string and run it - reads, inserts, updates, deletes, joins, `where`, `sortBy`, `groupBy` |
| `utilities` | Shared helpers the queries use - retrieving records/files/indexes and merging join results |

Note: `src/index.ts` (the package's top-level entry point) is still an empty stub - there is no public
`require('json-file-db')` API yet, only the individual modules above.

## Development

```shell
npm install
npm test          # the tests
npm run typecheck # the types
npm run build     # dist/, browser/ and docs/
npm run docs      # only the documentation
```
