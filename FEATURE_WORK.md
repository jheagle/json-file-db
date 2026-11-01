# Fixed SQL clause order (3.0.0)

> Epic plan for `feature/fixed-clause-order`. Each task below gets its own branch and a PR into
> `feature/fixed-clause-order`. Tick a task here (on `feature/fixed-clause-order`) once its PR merges. Remove this
> file before `feature/fixed-clause-order` merges to `main`, after copying its final contents into that PR's
> description. Sync `main` into this branch with a real merge commit, never a squash.

## Why

Today each `find*` step in `parseQuery` searches the whole (masked) query for its own clause and cuts it out
(`removeFromQuery`), so clauses work in any order: `read k select n limit 1 where n > 1 sort n desc` runs. That makes
the parser twelve independent regex hunts, keeps the old where forms alive, and gives confusing errors (a repeated
`sort` fails with "Unrecognized query value: sort n desc"). A fixed order lets the parser read the query once, left
to right, like SQL.

## Grammar

Each clause is optional and may appear at most once, in this order:

- `read <entity>[.<joined>] [select ...] [on ... [and on ...]] [merge ...] [where ...] [group by ...] [sort ...] [limit n] [offset n]`
- `insert <entity> values ...`
- `update <entity> set ... [where ...]`
- `delete <entity> [where ...]`
- `create`, `drop`, `describe`, `show records`: unchanged (they already have their own parsers).

## Decisions (2026-10-28)

1. The old where forms go in this epic: `where a and where b`, `or where`, and a second `where` clause become errors.
   `and` / `or` / brackets cover them.
2. `sort`, `limit` and `offset` on `update` / `delete` are an error (MySQL allows `delete ... order by ... limit n`;
   not needed now, could be a feature later).
3. Released as **3.0.0**: queries that work in 2.x become errors.
4. Out-of-order or repeated clauses give an error that names the order, e.g.
   `"where" can't come after "sort" (order: select, on, merge, where, group by, sort, limit, offset)`.

## Work Split

- [x] **Clause splitter + order errors.** (#88) One function walks the masked query's top-level words once and splits it
  into `{ clause keyword -> body text }` in the allowed order for the command. Out of order, repeated, or not allowed
  for the command (`sort` on `delete`) -> the errors above. Wire it in front of the existing `find*` steps without
  changing them yet (they still find their clause in the reassembled text), so this PR only adds the order rule.
  Tests: every clause pair in both orders, every repeat, every clause not allowed per command, keywords inside
  strings/arrays/brackets ignored.
- [ ] **`find*` steps parse a slice.** Each step gets only its clause's body from the splitter instead of searching
  the whole query; `removeFromQuery` and the leftover-text bookkeeping go. Leftover text becomes "unexpected ... after
  ...". No behaviour change beyond error messages: the existing parser tests must pass unchanged (except messages).
- [ ] **Remove the old where forms.** `and where`, `or where`, a second `where` -> errors with a hint
  ("use `and` / `or` inside one where clause"). Remove their handling from `findConditions` and the tests that cover
  them (keep one test per form asserting the error).
- [ ] **Docs + consumers.** README: "Clause order" becomes a rule (with the error), remove the old-forms mention in
  "Where clauses", add "Upgrading to 3.0". Check every query in workout-planner and task-manager (and the website's
  json-fs-query demo, if any) against the new rules; list what needs changing in the PR description.

- [ ] **Fix group by** (added 2026-11-01). Today a read runs sort -> limit/offset -> group by -> select, and groups are
  plain-object keys. Three fixes: (1) `limit` / `offset` apply after grouping and count groups, not rows (SQL's
  meaning); (2) groups keep the sort order (integer-like object keys always come out ascending today, so `sort n desc
  group by n` loses its order); (3) nested `group by a, b` (group by a, then by b within each group; an error since
  task 2). Needs a result shape that keeps order, e.g. an array of `{ key, rows }` (null keys stay null, not
  `"null"`): a breaking change, which is why it's in 3.0. This task updates its own README section and lists the
  shape change in "Upgrading to 3.0". Aggregates (count, sum, ...) are a separate epic after this one.

## Notes

- The CLI epic (`feature/create-cli`) only uses `queryStatus()`, which this epic doesn't change; whichever epic lands
  second syncs `main` in.
- The release is a separate PR against `main` after this epic merges (3.0.0).
