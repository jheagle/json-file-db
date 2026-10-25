# Query parser: strings, escapes, comments, statement endings, then schema statements

> Epic plan for `feature/query-parser`. Each task below gets its own branch and a PR into `feature/query-parser`.
> Tick a task here (on `feature/query-parser`) once its PR merges. Remove this file before `feature/query-parser`
> merges to `main`, after copying its final contents into that PR's description.

## Why

The parser reads every value with its own regular expression (`["'][^"']*['"]`, `(.*)`), which can't keep track of
whether it is inside a quoted string or what a backslash escapes. Checked against the built parser on `main` (1.1.0):

| Input | Today |
|---|---|
| `insert notes values text = 'please read this'` | Split into two queries: `splitQueries` splits on command keywords, not `;` |
| `read t where a = 'x' and b = 'y'` | One condition, whose value is `x' and b = 'y` |
| `insert t values name = "it's"` | Throws "Unrecognized query value" |
| `insert t values name = 'abc"` | Accepted (mismatched quotes), value `abc` |
| `insert t values name = 'it\'s'` | Throws: no escapes |
| comments | Not supported |

Workarounds already exist because of it: workout-planner deletes every `'` from user input before building a query
(`escapeQuoted` in `assets/js/data/workoutQueries.js`).

The CLI epic (`feature/create-cli`) needs the same rules for its "is the query complete?" check: open quotes, open
brackets, a `;` inside a string or comment. One scanner, used by both, means the CLI and the parser can never disagree.

## The rules (decided 2026-10-25)

- **Strings** use `'...'` or `"..."`. A string closes only with the quote it opened with, so the other quote is an
  ordinary character inside it (`"it's"`). An unclosed string is an error, not a guess.
- **Escapes** (inside strings only): a backslash escapes the next character, read left to right. `\'`, `\"` and
  `\\` give a quote or a backslash; `\n` and `\t` give a newline and a tab; any other `\x` gives `x`. So `'\\\''`
  is a backslash then a quote: the value `\'`. Outside strings a backslash has no meaning.
- **Comments**: `-- to the end of the line` and `/* block */`. Quotes, `;` and brackets inside a comment are ignored,
  and comment markers inside a string are just text. `--` starts a comment only at the start or after whitespace or
  `;`, since names can contain `-` (`my--table` is a name; found in the agent review of #46).
- **Statement endings**: `;` ends a query (not inside brackets), and is optional after the last (or only) one. Several queries in one
  string need a `;` between them; command keywords no longer split queries. Checked 2026-10-25: workout-planner,
  the only project using json-fs-query, sends one query per call.

## Approach

Keep the existing `find*` steps of `parseQuery`, and make sure none of their regexes ever sees inside a string:

1. A **scanner** walks the text once, left to right, tracking quote, comment and bracket state and escapes.
2. `splitQueries` splits on the `;` the scanner reports outside strings and comments, and drops comments.
3. Before the `find*` steps run, each string is replaced by a placeholder; `parseLiteralValue` turns a placeholder
   back into the real, unescaped value. So a keyword, quote or `and` inside a value can't be matched by any step.

## Work Split

- [x] **Scanner** (#45) (`src/data/utilities/parsers/scanQuery.ts`): one pass over the text, returning the string literals
  (position, quote, unescaped value), the comment ranges, the `;` positions outside both, and the end state: inside
  which quote, inside a block comment, bracket depth, a trailing backslash. The parser gets a clear error for an
  unclosed string or comment; the CLI reads the end state instead. Unit tests for every rule above,
  including `'\\\''`, `"it's"`, `-- it's` and `/* ; */`.
- [x] **Split on `;`** (#46): `splitQueries` uses the scanner: splits on `;` outside strings and comments, removes comments,
  allows a trailing `;`. Regression test: `'please read this'` stays one query. `read a read b` (no `;`) is now an
  error, which is the breaking change of this epic.
- [x] **Strings through placeholders** (#47): strings become placeholders before the `find*` steps; `parseLiteralValue`
  resolves them; the `literal` regexes in `findInsertValues`, `findUpdateValues` and `findConditions` match a
  placeholder instead of `["'][^"']*['"]` / `(.*)`. Regression tests: the two-condition `where`, `"it's"`,
  mismatched quotes (now an error), `'it\'s'`.
- [x] **Arrays** (#49): values in `[...]` (e.g. `where id in [...]`) are read with the same rules, so they can hold strings
  with either quote and escapes, not only JSON. Today they go through `JSON.parse`.
- [x] **`quote()` helper** (#50): exported from the package. Wraps a value in quotes with `\` and the quote escaped, for code
  that builds query strings. Follow-up in workout-planner once released: replace `escapeQuoted` (which deletes
  apostrophes) with it.
- [x] **CLI hook** (#51): export what the CLI's completion check needs from the scanner (complete or not, and what is still
  open, for the psql-style continuation prompt). The CLI epic's "Detect when a query is complete" task then uses it
  instead of its own quote and bracket scanning.
- [x] **Docs** (#52): a README section on strings, quotes, escapes, comments and `;`, with examples.
- [ ] **Schema statements: `create`**: the query form of `create(recordName, definition, keys)`. Design the syntax
  first (fields with their types, keys), as a short proposal in this file, before building it.
- [ ] **Schema statements: `drop`**: the query form of `drop()`.
- [ ] **Schema statements: `describe`**: the query form of `describe()`; the CLI shows it as a table.
- [ ] **Schema statements: `show`**: list the records in the database (from the `__RECORDS` registry).

- [ ] **Rebuild `dist/` and `browser/`** (last, before merging to `main`): from the CLI hook task on, task PRs run
  the build as a check but don't commit its output (decided 2026-10-25). This task rebuilds and commits it once, unless
  json-fs-query has stopped tracking build output by then (it's published to npm, so its build output isn't needed in
  git; see TASKS.md).

## Proposal: schema statements (`create`, `drop`, `describe`, `show`)

> **Status: questions still open.** Merged into the epic on 2026-10-25 (#53) before the questions below were
> answered. The schema statements aren't built until they are; the answers get written in here first.

### `create`

```sql
create exercise_muscle (
  _id string auto,
  exercise_id string,
  muscle_id string,
  muscle_rank int,
  note string optional default '',
  primary key (_id),
  foreign key (exercise_id) references exercises (_id),
  foreign key (muscle_id) references muscles (_id)
);
```

Inside the brackets, a comma-separated list of fields, then keys. Everything is case-insensitive except names.

**Fields**: `<name> <type> [optional] [auto] [default <value>]`, the modifiers in any order.

| Part | Means | `create()` equivalent |
|---|---|---|
| `<type>` | `string`, `int`, `boolean`, `object` or `array` | `type` |
| `optional` | the field may be left out | `optional: true` (fields are required by default, as today) |
| `auto` | the value is generated on insert | `autoGenerate: true` |
| `default <value>` | any literal the parser reads: a string, number, array, `null`, `true`, `false` | `useDefault: true, defaultValue` |

**Keys**:

| Syntax | Key | Index file (as `create()` users name them today) |
|---|---|---|
| `primary key (a)` | `primary` | `pk_a.json` |
| `unique (a)` | `unique` | `unique_a.json` |
| `index (a)` | `index` | `index_a.json` |
| `index (a, b)` | `multi` (see question 2) | `multi_a_b.json` (new: nothing names one yet) |
| `foreign key (a) references other (b)` | `foreign`, referencing `other.b` | `fk_a.json`, reference lookup `other.json` |

Several fields join with `_` in the file name: `primary key (a, b)` is `pk_a_b.json`. The index file names are made
for you, which is the main thing the query form saves over calling `create()`.

**Checked against real data**: written this way, workout-planner's `exercises`, `muscles`, `workouts` and
`exercise_muscle` produce exactly the definitions and keys in its `database/*.json` today, index file names included
(all 11 index and reference file names, e.g. `pk__id.json`, `index_date.json`, `fk_exercise_id.json`, reference
lookup `exercises.json`). The tests name unique keys the same way (`unique_email.json`, `unique_a_b.json`).

**Errors** rather than guesses: an unknown type or key, a key naming a field that isn't in the list, a foreign key
whose referenced record or field doesn't exist, the same field twice, and a record that already exists (see question 1).

**Result**: `query()` resolves to the new record's definition, like `create()`.

### `drop`, `describe`, `show`

```sql
drop exercise_muscle;             -- like drop(); an error if it doesn't exist (see question 1)
describe exercise_muscle;         -- like describe(): the fields and keys (the CLI prints them as a table)
show records;                     -- the names of every record, from __RECORDS
```

### Questions for you

1. **Existing records**: `create` on a record that exists, and `drop` on one that doesn't, are errors by default.
   Add `create if not exists` / `drop if exists` for scripts that seed a database (no-ops instead)? I'd say yes:
   task-manager's setup is exactly that case. (Today `create()` quietly returns `null` for an existing record.)
2. **`multi` keys**: `key.ts` requires two or more fields for `multi`, but `primary`, `unique` and `index` also work
   with several fields. Is `multi` meant to be "a non-unique index on several fields"? If so, `index (a, b)` maps to
   it as above and nobody writes `multi`. If it's something else, it gets its own keyword.
3. **Unknown types**: `create()` accepts any type name and treats an unknown one as "anything" (so a typo can't block
   writes). For the query form I'd reject unknown types instead, since the statement is typed by hand. OK?
4. **Names**: `auto` and `optional` (short, and `optional` matches the stored definition) rather than SQL's
   `auto_increment` and `null` / `not null`. OK?
5. **`show records`** or plain **`show`**? (`show` alone leaves room for later `show indexes`, `show databases`.)

## Out of scope (tracked separately in TASKS.md)

- **Transactions** (`begin` / `commit` / `rollback`): a time-boxed spike first.
- **Multiple databases**, **user sessions**, **dump output**: after the schema statements.
- **The CLI itself**: its own epic, `feature/create-cli`. It only consumes the scanner (CLI hook task above).

## Release

Not part of any task PR: once `feature/query-parser` merges to `main`, a separate release PR bumps the **major**
version (2.0.0). Requiring `;` between queries, erroring on unclosed or mismatched quotes, and giving `\` a meaning
inside strings all change how existing queries behave. If the CLI epic is released first, this goes after it.
