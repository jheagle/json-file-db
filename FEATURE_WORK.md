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

## Design (task 1, proposed and decided 2026-10-26)

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

### Decisions (the maintainer's answers, 2026-10-26)

1. **`and where` / `or where` stay accepted** as spellings of `and` / `or`, alongside the single-`where` form (the
   README shows the single-`where` form).
2. **Three-valued logic: yes.** Why null and missing are different (the maintainer's reasoning): **null** means the
   field is there but its value is intentionally not set: a row that's ready and waiting for something to act on it,
   or an undecided flag (a true/false that means something either way once set, where null means apply neither, or
   work out the default). Queries on it rely on the field existing. **Missing** means the field is optional to the
   row and rarely queried; when it's there, it adds context that isn't critical. This may support future designs such
   as mutable data entry.
3. **Indexes only narrow; every condition is still applied.** Index optimisation later can make queries faster.
4. **Joined-entity conditions: inner join, per pair** (only matching joined rows are kept). Outer / left / right joins
   are another epic.
5. **Clause order stays free in this epic** (the expression ends at the next clause keyword, `and on` included): it
   adds no complexity now and doesn't stop a strict order later. **A fixed SQL order comes as its own round soon
   after** (the maintainer expects it to make the code simpler and avoid future issues; it's breaking, so it's
   planned on its own).
6. **Minor release (2.2.0)**, as everything here is additive.

## Work Split

- [x] **Design**: grammar, tree, evaluation, indexes and joins above; decisions recorded.
- [ ] **Indexes narrow only** (on today's flat list, first): `getConditionIndexedList` only loads candidate rows; no
  condition is removed from the list, and `runQuery` applies every condition to the candidates (for update/delete
  before the write, for read after the join, as today). Tests: every existing indexed query gives the same rows; an
  indexed condition still applies when the index pre-filter is skipped.
- [ ] **Parsed shape**: `parsed.where` becomes the `ConditionNode` tree (types in `parseQuery.ts`), built from
  today's list as one `and` node, so nothing changes yet; `where` / `runQuery` / `typeClauses` walk the tree.
- [ ] **Parser**: read the expression into the tree with the precedence above, walking the masked text; the
  expression ends at the next clause keyword outside brackets (`and on` included); `and where` / `or where`
  accepted. Every example and error listed in the Grammar section becomes a test, plus a regression test that `or`
  no longer errors.
- [ ] **Evaluation**: three-valued logic (true / false / unknown) for `and`, `or`, `not`; a row is kept only when
  the whole expression is true. Tests: `not (n = 5)` gives the same rows as `n != 5`; the truth tables.
- [ ] **Indexes for the tree**: candidate rows per node (intersection for `and`, union for `or` when every branch is
  indexed, all rows otherwise and for `not`). Tests: every Grammar example gives the same rows with and without
  indexes.
- [ ] **Joined entities**: conditions on the joined entity's fields, evaluated per pair (inner join): the joined
  list keeps the matching rows, a row with none left is dropped. Fields of entities that only link (`exercise_muscle`
  in `workouts.muscles`) are an error. Also: an indexed no-match on a joined field must not reload every joined row
  (left over from #69).
- [ ] **Docs**: a README section on where clauses: operators, `and` / `or` / `not`, brackets, precedence, null and
  missing in expressions, joined fields, the recommended (SQL) clause order, examples.

## Out of scope

- Subqueries, `exists (subquery)` (the field-level `exists` is already there), functions in conditions.
- The CLI: its completion check already tracks open brackets through the scanner, so `(` waits for `)`.

## Release

Not part of any task PR: once `feature/where-clauses` merges to `main`, a separate release PR: 2.2.0 (decision 6).
