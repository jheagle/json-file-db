# Where clauses: `and` / `or`, grouping with brackets, and precedence

> Epic plan for `feature/where-clauses`. Each task below gets its own branch and a PR into `feature/where-clauses`.
> Tick a task here (on `feature/where-clauses`) once its PR merges. Remove this file before `feature/where-clauses`
> merges to `main`, after copying its final contents into that PR's description.
>
> **Starts after `feature/query-parser` merges to `main`** (it builds on its scanner and string placeholders): merge
> `main` into this branch first.

## Why

Today (checked 2026-10-25, json-fs-query 1.1.0 plus the parser epic):

- Each condition needs its own `where`: `where a = 1 and where b = 2`. `where a = 1 and b = 2` is an error.
- `or where` is accepted but **treated as `and`**: the parsed condition doesn't record the connector, and every
  condition must match. `read t where a = 1 or where b = 2` silently returns only rows matching both.
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

## Decisions (task 1 settles these)

1. **Syntax**: one `where` followed by the expression (SQL). What happens to today's `and where` / `or where`:
   accept `and where` as an alias, or make it an error with a hint? (`or where` can't keep its current meaning,
   since it's wrong.)
2. **`not`**: in this epic, before a condition or a group? (`!=` and `<>` already exist for single comparisons.)
3. **Release**: ship inside the parser epic's major (2.0.0) if both are ready together, or as its own major.
4. **Indexes with `or`**: see the indexes task; confirm the approach.

## Work Split

- [ ] **Design**: settle the decisions above and write the grammar here (expression, term, factor, condition), with
  examples of each precedence case and each error.
- [ ] **Parsed shape**: conditions become a tree: a condition (`property`, `comparator`, `value`), or a group
  `{ and: [...] }`, `{ or: [...] }`, `{ not: ... }`. Types in `parseQuery.ts`. Decide whether a plain list still
  means `and` (keeps other callers working while the rest moves over).
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

- Subqueries, `exists`, functions in conditions.
- The CLI: its completion check already tracks open brackets through the scanner, so `(` waits for `)`.

## Release

Not part of any task PR: once `feature/where-clauses` merges to `main`, a separate release PR (see decision 3).
