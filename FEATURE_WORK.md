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
- [x] **Nullable fields** (#55) (decided 2026-10-25, decision 4): a `nullable` flag on field definitions (`create()` takes
  `nullable: true`; default `false`). A nullable field stores a real JSON `null`; writing `null` to any other field is
  an error. Today `typeCheck` has no `null` case: a `string` field stores the text `"null"`, an `int` field stores `0`,
  and the other types throw. `create()` also checks each default against the field's type (and allows `default null`
  only on a nullable field), so a bad default fails once, at create time, instead of on every insert. Changing what
  `null` does is breaking, which the 2.0.0 release already is.
- [x] **Schema statements: `create`** (#56): the query form of `create(recordName, definition, keys)`, as decided in the
  proposal below, including `create if not exists`.
- [ ] **Schema statements: `drop`**: the query form of `drop()`, including `drop if exists`.
- [ ] **Schema statements: `describe`**: the query form of `describe()`; the CLI shows it as a table. Note: `describe()`
  returns only the fields today, not the keys (found building `create`); the statement should show both.
- [ ] **Schema statements: `show records`**: list the records in the database (from the `__RECORDS` registry).

- [ ] **Rebuild `dist/` and `browser/`** (last, before merging to `main`): from the CLI hook task on, task PRs run
  the build as a check but don't commit its output (decided 2026-10-25). This task rebuilds and commits it once, unless
  json-fs-query has stopped tracking build output by then (it's published to npm, so its build output isn't needed in
  git; see TASKS.md).

## Proposal: schema statements (`create`, `drop`, `describe`, `show`)

> **Status: decided 2026-10-25.** Proposed in #53; the five questions were answered together on 2026-10-25 and are
> written into the syntax below. The decisions and their reasons are under "Decisions" at the end of this section.

### `create`

```sql
create if not exists exercise_muscle (
  _id string auto,
  exercise_id string,
  muscle_id string,
  muscle_rank int,
  note string optional default '',
  replaced_by string null default null,
  primary key (_id),
  foreign key (exercise_id) references exercises (_id),
  foreign key (muscle_id) references muscles (_id)
);
```

Inside the brackets, a comma-separated list of fields, then keys. Everything is case-insensitive except names.

**Fields**: `<name> <type> [optional] [null | not null] [auto] [default <value>]`, the modifiers in any order.

| Part | Means | `create()` equivalent |
|---|---|---|
| `<type>` | `string`, `int`, `boolean`, `object` or `array`; anything else is an error (decision 3) | `type` |
| `optional` | the field may be left out (absent from the stored JSON) | `optional: true` (fields are required by default, as today) |
| `null` | the field may hold a JSON `null` | `nullable: true` (new, see the Nullable fields task) |
| `not null` | the default, accepted to say so explicitly | `nullable: false` |
| `auto` | the value is generated on insert (today a random UUID, `keyGenerate`) | `autoGenerate: true` |
| `default <value>` | any literal the parser reads: a string, number, array, `null`, `true`, `false`. It must pass the field's type check; `default null` needs `null` | `useDefault: true, defaultValue` |

`optional` and `null` are separate on purpose: JSON can leave a key out or store it as `null`, and a field can allow
either, both or neither. `null` after `default` is the default's value, not the modifier.

**Keys**:

| Syntax | Key | Index file (as `create()` users name them today) |
|---|---|---|
| `primary key (a)` | `primary` | `pk_a.json` |
| `unique (a)` | `unique` | `unique_a.json` |
| `index (a)` | `index` | `index_a.json` |
| `index (a, b)` | `index` (decision 2) | `index_a_b.json` |
| `foreign key (a) references other (b)` | `foreign`, referencing `other.b` | `fk_a.json`, reference lookup `other.json` |

Several fields join with `_` in the file name: `primary key (a, b)` is `pk_a_b.json`. The index file names are made
for you, which is the main thing the query form saves over calling `create()`.

**Checked against real data**: written this way, workout-planner's `exercises`, `muscles`, `workouts` and
`exercise_muscle` produce exactly the definitions and keys in its `database/*.json` today, index file names included
(all 11 index and reference file names, e.g. `pk__id.json`, `index_date.json`, `fk_exercise_id.json`, reference
lookup `exercises.json`). The tests name unique keys the same way (`unique_email.json`, `unique_a_b.json`).

**Errors** rather than guesses: an unknown type or key, a key naming a field that isn't in the list, a foreign key
whose referenced record or field doesn't exist, the same field twice, a default that fails its type check (or
`default null` without `null`), and a record that already exists unless the statement says `if not exists`.

**Result**: `query()` resolves to the new record's definition, like `create()`.

### `drop`, `describe`, `show`

```sql
drop exercise_muscle;             -- like drop(); an error if it doesn't exist
drop if exists exercise_muscle;   -- a no-op if it doesn't exist
describe exercise_muscle;         -- like describe(): the fields and keys (the CLI prints them as a table)
show records;                     -- the names of every record, from __RECORDS
```

A bare `show` is an error that lists what can be shown (only `records` for now). `create if not exists` on an existing
record is also a no-op, resolving to `null` like `create()` does today.

### Decisions (2026-10-25)

1. **Existing / missing records**: errors by default, plus `create if not exists` and `drop if exists` (no-ops), for
   setup scripts such as task-manager's. `create()` in JS keeps quietly returning `null` for an existing record;
   changing that would be a separate breaking change.
2. **`multi`**: it was meant as "an index on several fields", and the code treats it exactly like `index`. So
   `index (a, b)` is stored as `index` (as SQL writes composite indexes with the same `create index`), and nothing
   in the query form writes `multi`. `create()` still accepts `multi`. Keeps the name free for array indexes later.
3. **Unknown types**: the query form rejects them, with an error listing the valid types; `create()` stays lenient
   for now. The type list isn't complete yet: more types (and aliases) come from a types spike and its own epic.
4. **`auto` and `optional`**: kept. `auto` generates a UUID, so SQL's `auto_increment` would mislead, and `auto`
   leaves room for a format later (e.g. `auto uuid`, `auto increment`). `optional` means "may be absent", which JSON
   can express and SQL can't. SQL's `null` / `not null` are added for what they mean in SQL: the field may hold
   `null`. Not null is the default here (unlike MySQL), matching required-by-default and existing schemas. Lean
   towards SQL, but do what makes sense for JSON.
5. **`show records`**, not bare `show`: as MySQL's `show tables`, and it leaves room for `show indexes`,
   `show databases`.

## Out of scope (tracked separately in TASKS.md)

- **Transactions** (`begin` / `commit` / `rollback`): a time-boxed spike first.
- **Multiple databases**, **user sessions**, **dump output**: after the schema statements.
- **More field types**: a spike first (JSON storage like MongoDB, SQL-style structure): `float`/`number` (with care
  for precision loss), `date` and `timestamp` (locale, changeable defaults), an array type. Then its own epic.
- **Type aliases** for names people commonly mix up (e.g. a programming language's type names): after the spike.
- **Array indexes** (MongoDB's multikey) and **using a composite index for its leftmost fields** in `where`.
- **The CLI itself**: its own epic, `feature/create-cli`. It only consumes the scanner (CLI hook task above).

## Release

Not part of any task PR: once `feature/query-parser` merges to `main`, a separate release PR bumps the **major**
version (2.0.0). Requiring `;` between queries, erroring on unclosed or mismatched quotes, and giving `\` a meaning
inside strings all change how existing queries behave. If the CLI epic is released first, this goes after it.
