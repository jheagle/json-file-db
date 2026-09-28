# json-file-db

Read and manage data with JSON files - a small query engine that treats a folder of JSON files as a database, with
a SQL-like query string (`read workouts where date = '2024-06-02'`) instead of a query builder API.

## The modules

Each module of the documentation is a folder of `src/data/`:

* `introspect`: create, drop and describe a JSON-file "table" (and the policies that validate one).
* `queries`: parse a query string and run it - reads, inserts, updates, deletes, joins, `where`, `sortBy`, `groupBy`.
* `utilities`: shared helpers the queries use - retrieving records/files/indexes and merging join results.

Note: `src/index.ts` (the package's top-level entry point) is still an empty stub - there is no public
`require('json-file-db')` API yet, only the individual modules above.
