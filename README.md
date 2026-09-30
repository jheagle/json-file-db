# json-fs-query

Read and manage data with JSON files - a small query engine that treats a folder of JSON files as a database, with
a SQL-like query string (`read workouts where date = '2024-06-02'`) instead of a query builder API.

The core engine (schema management, a full read/insert/update/delete query language, single- and multi-field key
support, and referential integrity) is implemented and tested. Still open, tracked for whenever they're actually
needed: multi-field *foreign* keys specifically (single-field ones work; composite primary/unique/index keys work
too), and CASCADE/SET NULL modes for referential integrity (deleting/updating a referenced record is RESTRICTed -
blocked outright - rather than cascading or nulling out the dependents; see `configure()` below to turn that
enforcement off entirely if it doesn't fit your workflow).

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

## Configuration

`configure()` sets where this package's data lives and how strictly it enforces foreign keys - call it once,
before anything else:

```js
const { configure } = require('json-fs-query')

configure({
  databasePath: 'database/',   // where the JSON files live (default 'database/')
  relativePath: '',            // URL prefix prepended to databasePath when reading via fetch() in a browser
  enforceForeignKeys: true     // RESTRICT delete/update of a record other entities still reference (default true)
})
```

Turning `enforceForeignKeys` off restores the pre-1.0 behavior (no referential integrity checks at all) - useful if
it doesn't fit a particular workflow, mirroring MySQL's own toggleable `foreign_key_checks`.

## In the browser

A pre-built bundle is included (`browser/jsonFsQuery.js`, `.min.js` - also served directly via
[unpkg](https://unpkg.com/json-fs-query) or [jsDelivr](https://cdn.jsdelivr.net/npm/json-fs-query)) and exposes the
same functions as a global:

```html
<script src="https://unpkg.com/json-fs-query"></script>
<script>
  jsonFsQuery.configure({ databasePath: 'database/', relativePath: 'https://example.com/' })
  jsonFsQuery.query("read workouts where date = '2024-06-02'").then(console.log)
</script>
```

Reads work in the browser via `fetch()` - `create`/`drop`, and any write through `query()` (`insert`/`update`/
`delete`), need real filesystem access and only work in Node. They're still present in the browser build (same
public API either way), but throw if actually called there, rather than being silently unavailable.

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
