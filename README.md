# json-fs-query

Read and manage data with JSON files - a small query engine that treats a folder of JSON files as a database, with
a SQL-like query string (`read workouts where date = '2024-06-02'`) instead of a query builder API.

> **Pre-release.** The core engine (schema management plus a full read/insert/update/delete query language) is
> implemented and tested. Still open: multi-field keys, a browser-safe build, and referential integrity on
> delete/update (see the repository's issue tracker for details). Expect the public API below to stay stable, but
> breaking changes are possible before a 1.0 release.

## Install

```shell
npm install json-fs-query
```

## Usage

```js
const { create, query, drop } = require('json-fs-query')

await create('workouts', [
  { name: '_id', type: 'string', optional: false, autoGenerate: true },
  { name: 'reps', type: 'int', optional: false },
  { name: 'date', type: 'string', optional: false }
], [
  { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
])

await query("insert workouts values reps = 10, date = '2024-06-02'")
const rows = await query("read workouts where date = '2024-06-02'")
await query("update workouts set reps = 12 where date = '2024-06-02'")
await query("delete workouts where date = '2024-06-02'")

await drop('workouts')
```

This is a Node-only admin API today - `create`/`drop`/`query` all read and write real files on disk. A
browser-safe read-only build is planned but not yet built (see the pre-release note above).

## Documentation

The reference for every function is in [`docs/`](https://joshuaheagle.com/projects/json-file-db/docs/index.html) (or open `docs/index.html` locally). It is generated from the TypeScript source, and each module is a folder of `src/data/`:

| Module | What it holds |
| --- | --- |
| `introspect` | Create, drop and describe a JSON-file "table" (and the policies that validate one) |
| `queries` | Parse a query string and run it - reads, inserts, updates, deletes, joins, `where`, `sortBy`, `groupBy` |
| `utilities` | Shared helpers the queries use - retrieving records/files/indexes and merging join results |

`src/index.ts` is the package's public entry point - it re-exports `query`, `create`, `drop`, `describe`, and the
schema-definition types (`fieldProperties`, `keyProperties`, etc.) needed to build a `create()` call. Everything else
under `src/data/` is an internal module, reachable but not part of the supported public API.

## Development

```shell
npm install
npm test          # the tests
npm run typecheck # the types
npm run build     # dist/ and docs/
npm run docs      # only the documentation
```
