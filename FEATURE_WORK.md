# Where clauses: `and` / `or`, grouping with brackets, and precedence

> Epic plan for `feature/where-clauses`. Each task below gets its own branch and a PR into `feature/where-clauses`.
> Tick a task here (on `feature/where-clauses`) once its PR merges. Remove this file before `feature/where-clauses`
> merges to `main`, after copying its final contents into that PR's description.
>
> `main` (2.0.0 + 2.1.0) was merged into this branch on 2026-10-26 (cda3c5d).

## Why

Today (checked 2026-10-25, json-fs-query 1.1.0 plus the parser epic):

- Each condition needs its own `where`: `where a = 1 and where b = 2`. `where a = 1 and b = 2` is an error.
- `or where` was accepted but **treated as `and`** (1.x), returning only rows matching both; since 2.0.0 (#62) it is
  an error until this epic builds `or`.
- There is no grouping, no precedence and no `not`.
- `conditions` is a flat list, and everything that uses it assumes every condition must match: `where.ts` (applies
  them one after another), `runQuery.ts` (`typeConditions`, and applying what's left after the indexes),
  `getConditionIndexedList.ts` (uses an index to *load* the candidate rows for a condition, which is only right
  when that condition must match).

## Goal

Boolean expressions after `where`, like SQL:

```
read workouts where date = '2024-06-02' and (exercise_id = 3 or exercise_id = 5)
read exercises where not (name like 'bench%' or name like 'squat%')
```

- `and` and `or` join conditions; brackets `( )` group them, nested to any depth.
- Precedence: `not` before `and` before `or` (SQL's), so `a or b and c` is `a or (b and c)`. Brackets override it.
- The same results with or without indexes.

## Design proposal (task 1, 2026-10-26) - waiting on the questions at the end

### Today (2.1.0), checked against the code

- One condition per `where`: `where a = 1 and where b = 2`. `or where` is an error (since 2.0.0).
- Conditions are a flat list that must all match. Indexed conditions are answered from the index files first and
  dropped from the list (`getConditionIndexedList`), and the rest are applied by `where()`. That split is where
  3 wrong-rows bugs came from (fixed in #69, into `main`): each indexed condition replaced the last one's rows, an
  index matching nothing made every row load again, and composite indexes were used for one field.
- A condition on a joined entity's field never matches: `read workouts.exercises on ... where exercises.name =
  'Bench Press'` returns `[]` (indexed `exercises._id = 1` too).
- Clause order is free: `where` may come before or after `on` / `merge`, and `on` clauses use `and` as well
  (`on a.x = b.y and on b.z = c.w`).
- New since this plan was written: `is null`, `is not null`, `exists`, `does not exist` (2.1.0). Null and missing
  match no comparison, as in SQL.

### Grammar

Precedence from loosest to tightest: `or`, `and`, `not`. Brackets override it.

```
where      = "where" expression
expression = term { "or" term }
term       = factor { "and" factor }
factor     = "not" factor | "(" expression ")" | condition
condition  = field comparator value            (= != <> > >= < <= in between like)
           | field "is" ["not"] "null" | field "exists" | field "does not exist"
field      = name | entity "." name
```

- Keywords are whole words, any case. `not` is only an operator at the start of a factor, so `is not null` and
  `does not exist` stay conditions.
- The expression ends at the next clause keyword outside brackets: `sort`, `group by`, `limit`, `offset`,
  `select`, `merge`, `on`, or `and on` (a join clause). Strings and arrays are placeholders by then, so a bracket,
  `and` or `or` inside a value never counts.
- `between` keeps its array form (`between [1, 5]`): SQL's `between 1 and 5` would clash with `and`.

Examples (each one becomes a test):

| Query | Means |
|---|---|
| `where a = 1 or b = 2 and c = 3` | `a = 1 or (b = 2 and c = 3)` |
| `where (a = 1 or b = 2) and c = 3` | as written |
| `where not a = 1 and b = 2` | `(not a = 1) and b = 2` |
| `where not (a = 1 or b = 2)` | neither |
| `where a = 1 and (b = 2 or (c = 3 and not d exists))` | nesting to any depth |

Errors (each one becomes a test), all naming the place:
- unbalanced brackets: `where (a = 1 or b = 2` -> `Missing ) ...`; `where a = 1)` -> `Unexpected )`
- a dangling operator: `where a = 1 and`, `where or a = 1`, `where not` -> `Missing a condition after and`
- an empty group: `where ()`
- two conditions with nothing between: `where a = 1 b = 2` -> `Missing and/or before: b = 2`
- `where` with nothing after it

### Parsed shape

`parsed.where` is a tree (the flat `conditions` list goes away):

```ts
type ConditionNode = ParsedCondition | { and: ConditionNode[] } | { or: ConditionNode[] } | { not: ConditionNode }
```

`a and b and c` is one `and` node with three children (not nested pairs). `typeConditions` walks the tree.

### Evaluation: SQL's three-valued logic

A comparison on a null or missing field is neither true nor false but **unknown** (that's why it matches
nothing today). Keeping that inside `and` / `or` / `not`:

| | result |
|---|---|
| `not unknown` | unknown |
| `false and unknown` | false |
| `true and unknown` | unknown |
| `true or unknown` | true |
| `false or unknown` | unknown |

A row is kept only when the whole expression is **true**. The point: `not (n = 5)` returns the same rows as
`n != 5` (neither returns null or missing rows). With plain true/false, `not (n = 5)` would return them. `is null`,
`is not null`, `exists` and `does not exist` are never unknown.

### Indexes: they only narrow, the full expression always runs

Proposed change of approach: an index only picks the **candidate rows**, and then the whole expression is evaluated
on every candidate, including the conditions an index already answered. Conditions are no longer removed from the
list, so the index path can't change results any more (the source of all 3 bugs in #69). Re-checking an indexed
condition on the loaded rows is cheap next to reading the files.

Candidates for a node (on the queried entity):
- an indexed condition: the files its index matches; an unindexed one: all rows
- `and`: the intersection of its children that aren't "all rows"
- `or`: the union, if **every** branch is indexed; otherwise all rows
- `not`: all rows (its complement would have to leave out the unknown rows; not worth it yet)

So `where date = 'x' and (exercise_id = 1 or exercise_id = 2)` reads only that date's rows, intersected with the
union of the two exercise_id lookups. Tests run every example with and without indexes and expect the same rows.

### Conditions on a joined entity's field

Proposal: SQL's inner join, evaluated per pair. For each row and each of its joined rows, the expression is
evaluated with both. The row keeps the joined rows for which it's true, and is dropped if none are left. A condition
on the main entity alone gives the same answer for every pair, so it keeps or drops the row as today.

`read workouts.exercises on ... where date = '2024-06-02' and exercises.name like 'B%'` -> the 2024-06-02 workouts
whose exercise starts with B, each with only that exercise.

For now, only the main entity and the one entity after the `.` (`workouts.exercises`); fields of the entities that
only link them (`exercise_muscle` in `workouts.muscles`) are an error.

### Questions for you (my recommendation in bold)

1. **`and where` / `or where`**: **accept them as old spellings of `and` / `or`** (no query breaks; the README shows
   the single-`where` form), or make them errors with a hint?
2. **Three-valued logic** (`not (n = 5)` leaves out null/missing, like `n != 5`), **yes**, or plain true/false?
3. **Indexes only narrow, and the full expression always runs** (simpler and safer than removing answered
   conditions), **yes**?
4. **Joined-entity conditions per pair** (inner join), with the joined list filtered to matching rows, **yes**? Or
   keep the row with all its joined rows when any one matches (EXISTS style)?
5. Clause order: **keep it free** (the expression ends at the next clause keyword, incl. `and on`), or require
   `where` after `on` / `merge` as in SQL?
6. **Release: a minor (2.2.0)** if `and where` stays accepted (purely additive), since 2.0.0 is out.

## Work Split

- [ ] **Design**: settle the decisions above and write the grammar here (expression, term, factor, condition), with
  examples of each precedence case and each error. *Proposal above; waiting on the 6 questions.*
- [ ] **Parsed shape**: conditions become a tree: a condition (`property`, `comparator`, `value`), or a group
  `{ and: [...] }`, `{ or: [...] }`, `{ not: ... }`. Types in `parseQuery.ts`. Decide whether a plain list still
  means `and` (keeps other callers working while the rest moves over).
- [ ] **Indexes narrow only**: (if question 3 is yes) the index path picks candidate rows and nothing else, and the
  full condition list always runs after it. Done first, on today's flat list, so it lands before the tree changes
  how conditions are stored.
- [ ] **Parser**: `findConditions` reads the expression into the tree with the precedence above, walking the
  masked text (strings are placeholders by then, so a bracket or `or` inside a value can't count). Clear errors
  for an unbalanced bracket, a dangling `and` / `or`, and an empty group. Regression test: `or where` no longer
  means `and`.
- [ ] **Evaluation**: `where` evaluates the tree for each row; `typeConditions` gives every condition in the tree
  its field type.
- [ ] **Indexes**: `getConditionIndexedList` may only use an index where it's safe: a condition directly under the
  top-level `and` narrows the candidate rows as today; an `or` whose branches are all indexed can union them;
  anything else falls back to a full scan. Tests that every query gives the same rows with and without indexes.
- [ ] **Joined entities**: conditions on a joined entity's fields (`exercises.name`) inside groups.
- [ ] **Docs**: a README section on where clauses: operators, `and` / `or` / `not`, brackets, precedence, examples.

## Out of scope

- Subqueries, `exists (subquery)` (the field-level `exists` is already there), functions in conditions.
- The CLI: its completion check already tracks open brackets through the scanner, so `(` waits for `)`.

## Release

Not part of any task PR: once `feature/where-clauses` merges to `main`, a separate release PR (see question 6).
