# Benchmarks

`npm run benchmark` (after `npm run build`) times json-fs-query's common operations on a scratch database shaped like a
real app's: `kinds` (10 rows) <- `parents` (size / 10, a foreign key to kinds) <- `children` (size rows, a foreign key
to parents and an index on `day`). Reads are timed in Node and in Chromium over `fetch()` from a local server. See
`scripts/benchmark.cjs` for exactly what each row measures.

Every task in the performance epic (`FEATURE_WORK.md`) adds its run here, on the same machine, so the effect of each
change is measured rather than assumed. Times vary a little between runs; compare orders of magnitude, not single
milliseconds.

## What the baseline shows

- **Inserts get slower as the table grows**: 45 ms per row at 100 rows, 389 ms per row at 1,000 (each insert rewrites
  the record file and every index, and those grow with the table). 1,000 inserts take 6.5 minutes.
- **Joins are the worst case**: one join over 1,000 rows takes 5.2 s in Node and 15 s in a browser, because the joined
  record's index and entry files are read again for every row. Two joins take 26 s in a browser.
- **Reads go one file at a time**: reading all 1,000 rows is 0.4 s in Node and 4.3 s in a browser (1,000 sequential
  requests).
- **Indexed lookups are already fine**: 8 ms in Node, 55 ms in a browser at 1,000 rows.
- **Many small files**: 438 KB of data in 1,119 files.

### Baseline: 3.1.4, before the epic (2026-11-06, Node v24.21.0, 11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz)

| Operation | 100 rows | 1000 rows |
|---|---:|---:|
| insert each | 4.5 s | 388.8 s |
| insert per row | 45 ms | 389 ms |
| read all | 35 ms | 376 ms |
| indexed where | 3.6 ms | 7.8 ms |
| join 1 | 145 ms | 5.2 s |
| join 2 | 244 ms | 5.6 s |
| update 1 by key | 38 ms | 402 ms |
| update many by index | 25 ms | 3.2 s |
| delete 1 by key | 77 ms | 784 ms |
| browser read all | 594 ms | 4.3 s |
| browser indexed where | 34 ms | 55 ms |
| browser join 1 | 1.7 s | 15.2 s |
| browser join 2 | 2.4 s | 26.1 s |
| files on disk | 129 | 1,119 |
| bytes of data | 50 KB | 438 KB |

