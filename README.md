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

### Fields: `optional`, `nullable` and defaults

A field is required and can't be `null` unless its definition says otherwise. The two flags are separate, because
JSON can leave a key out or store it as `null`:

| Definition | Left out | `null` |
|---|---|---|
| `{ name: 'note', type: 'string' }` | error | error |
| `{ name: 'note', type: 'string', optional: true }` | allowed | error |
| `{ name: 'note', type: 'string', nullable: true }` | error | stored as `null` |
| `{ name: 'note', type: 'string', optional: true, nullable: true }` | allowed | stored as `null` |

`useDefault: true, defaultValue: …` fills in a field that is left out. `create()` checks the default against the
field's type (a `null` default needs `nullable: true`) and throws if it doesn't fit. Primary key fields can't be
nullable. As in SQL, a `null` is never a duplicate in a unique key (any number of rows can hold it), and
a `null` foreign key isn't checked against the record it references.

## Writing queries

`query()` takes one query, or several separated by `;`, and resolves to one result per query:

```js
const [workouts, exercises] = await query("read workouts where date = '2024-06-02'; read exercises;")
```

The `;` after the last (or only) query is optional. A `;` inside a string, a comment or brackets doesn't end a query.

### Strings

Strings use single or double quotes. A string closes only with the quote it opened with, so the other quote is just
a character inside it:

```sql
insert notes values text = "it's done"
insert notes values text = 'say "hi"'
```

Inside a string, a backslash escapes the next character: `\'`, `\"` and `\\` are a quote and a backslash, `\n` and
`\t` are a newline and a tab, and any other `\x` is just `x`. Escapes are read left to right, so `'\\\''` is a
backslash followed by a quote:

```sql
insert notes values text = 'it\'s done'
insert files values path = 'C:\\temp'
```

An unclosed string, or mismatched quotes (`'abc"`), is an error rather than a guess. Keywords, commas and `;` inside a
string are only text: `where note = 'x sort b limit 1'` compares against that whole text.

### Building a query from values: `quote()`

To put any text into a query (such as user input), wrap it with `quote()`. It escapes the backslash and the quote, so
the query reads back exactly the text given:

```js
const { query, quote } = require('json-fs-query')

const name = "Farmer's walk"
await query(`insert exercises values name = ${quote(name)}`)
await query(`read exercises where name = ${quote(name)}`)
```

`quote(value, '"')` wraps in double quotes instead.

### Arrays

Arrays are JSON-style, and their strings can use either quote. They can be nested, and are used by `in` and
`between`, or stored as a value:

```sql
read workouts where exercise_id in [3, 5, 8]
read workouts where reps between [8, 12]
read exercises where name in ['bench press', "farmer's walk"]
insert routines values days = ['mon', 'thu'], sets = [[3, 10], [3, 8]]
```

### Comments

`-- to the end of the line` and `/* anything, over several lines */`. A `--` starts a comment only at the start of a
line or after whitespace or a `;`, since names can contain `-` (`my--table` is a name). Comment markers inside a
string are just text.

```sql
-- this week's sessions
read workouts where date = '2024-06-02' /* the Sunday */;
```

### Several conditions

Each condition starts with `where`; join them with `and where`:

```sql
read workouts where reps > 8 and where date = '2024-06-02'
```

`or where` is not supported yet: it is currently read the same as `and where`. And/or with grouping and precedence is
planned.

### Creating a record: `create`

The query form of `create()`. Inside the brackets: the fields, then the keys, separated by commas. Everything is
case-insensitive except names.

```sql
create if not exists exercise_muscle (
  _id string auto,
  exercise_id string,
  muscle_id string,
  muscle_rank int,
  note string optional default '',
  replaced_by string null default null,
  primary key (_id),
  index (muscle_id, muscle_rank),
  foreign key (exercise_id) references exercises (_id),
  foreign key (muscle_id) references muscles (_id)
);
```

A field is `<name> <type>`, then any of these, in any order:

| Modifier | Means |
|---|---|
| `optional` | may be left out (see "Fields" above) |
| `null` / `not null` | may hold `null` / may not (the default) |
| `auto` | a UUID is generated on insert; the type must be `string` |
| `default <value>` | used when the field is left out: a string, a whole number, an array, `null`, `true` or `false` (so an `object` field can only default to `null` here; `create()` takes any default) |

The types are `string`, `int`, `boolean`, `object` and `array`; any other is an error.

| Key | Index file |
|---|---|
| `primary key (a)` | `pk_a.json` |
| `unique (a)` | `unique_a.json` |
| `index (a)` | `index_a.json` |
| `foreign key (a) references other (b)` | `fk_a.json` (other's record file: `other.json`) |

Several fields join with `_`: `index (a, b)` is `index_a_b.json`. Foreign keys are single-field for now.

The result is the new record's definition, as from `create()`. Creating a record that already exists is an error;
with `if not exists` it is left as it is and the result is `null`. A foreign key's record and field must exist
already (or be the record being created).

### Dropping, describing and listing records: `drop`, `describe`, `show records`

```sql
drop exercise_muscle;            -- removes the record, its entries and its indexes
drop if exists exercise_muscle;  -- the same, or nothing if there is no such record
describe exercises;              -- the record's fields and keys
show records;                    -- the name of every record, in the order they were created
```

`drop` resolves to the definition the record had, or `null` with `if exists` for a record that doesn't exist; without
it, that is an error. A record that another record's foreign key references can't be dropped until that one is
(unless `enforceForeignKeys` is turned off, see Configuration). `describe` resolves to `{ path, definition, keys }`
(the `describe()` function gives only the fields), and `show records` to an array of names.

### Reading a query over several lines: `queryStatus()`

For a prompt which reads a query line by line (like the CLI), `queryStatus()` says whether the text so far is ready to
run, and if not, what it is waiting for: `'` or `"` (a string), `/*` (a comment), `[` or `(` (a bracket), or `;`.
Join the lines with `'\n'`, since a `--` comment ends at the end of its line.

```js
const { queryStatus } = require('json-fs-query')

queryStatus("read notes where text = 'it")   // { complete: false, waitingFor: "'" }
queryStatus('read notes')                    // { complete: false, waitingFor: ';' }
queryStatus('read notes;')                   // { complete: true, waitingFor: '' }
```

### Upgrading from 1.x

- Several queries in one string need a `;` between them: `read a; read b`. Before, they were split on command words,
  which also split a value such as `'please read this'` and stored it as `pleaseread this`.
- Unclosed strings and mismatched quotes are errors.
- A backslash inside a string is an escape: write `\\` for a backslash (or use `quote()`).
- `--` and `/* */` start comments outside strings.
- `null` is only accepted by fields with `nullable: true`, and is stored as a real `null`. Before, a `string` field
  stored the text `"null"` and an `int` field stored `0`.
- `create()` throws for a default that doesn't fit its field's type, and for a nullable primary key field.
- Sort fields need a comma between them: `sort a, b desc`. Before, the list ran on into the next clause, so
  `sort a limit 1` sorted by `a`, `limit` and `1` and lost the limit; `sort a b` is now an error.

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

## Several calls at once

Calls to `query()`, `create()`, `drop()` and `describe()` on one database (one `databasePath`) run one at a time, in
the order they were made, so concurrent requests (for example in a web server) can't overwrite each other's
changes. All the queries in one `query()` string run together, with no other call in between. This covers one Node
process: two processes writing to the same folder (say a server and a CLI) are not protected from each other.

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

`src/index.ts` is the package's public entry point - it re-exports `query`, `quote`, `queryStatus`, `create`, `drop`,
`describe`, `configure`, and the schema-definition types (`fieldProperties`, `keyProperties`, etc.) needed to build a `create()` call. Everything else
under `src/data/` is an internal module, reachable but not part of the supported public API.

## Development

```shell
npm install
npm test          # the tests
npm run typecheck # the types
npm run build     # dist/ and browser/ (not committed; npm publish builds them)
npm run docs      # the documentation (docs.to)
```
