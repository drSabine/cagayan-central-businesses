---
name: metric-builder
description: Implement one metric (M1 to M17) from docs/engineering/metrics.md in SQL, wired into metrics:refresh, test first with a hand-built fixture.
argument-hint: "[metric id, e.g. M1]"
arguments: [metric]
disable-model-invocation: true
---

# Build metric $metric

Every number on screen has one definition, one SQL implementation, and one test (decisions.md, D7). The definition is fixed. The code follows it, never the reverse.

## Read first

1. `docs/engineering/metrics.md`: "Building blocks", "Three states every value can be in", the entry for $metric, "Config values", and "How each metric is tested".
2. `docs/engineering/data-model.md`: "Summary tables" and the `business_years` status rules.
3. `docs/engineering/privacy-rules.md` if $metric involves sales (M3, M4, M5 by sales, M6 and M7 by sales, M12, M15).
4. `app/Console/Commands/RefreshMetricsCommand.php` and whatever is already in `database/sql/metrics/`.
5. `.claude/rules/backend.md` and `.claude/rules/testing.md`.

## Steps

1. **Check the definition.** If anything about $metric is ambiguous (a denominator, a tie, a year boundary, a missing case), stop and ask. Do not guess. Items marked **Choice** in `metrics.md` are settled defaults; use them as written.
2. **Check what it needs.** Most metrics read `stats_area_year`. If that table or the raw tables do not exist yet, stop and say so (`/db-change` first, or `/metric-builder M1`, which creates `stats_area_year`).
3. **Write the test first** in `tests/Feature/Metrics/`, named after the metric, for example `NetGrowthTest.php`:
   - A tiny hand-built fixture: two or three barangays, a handful of businesses, two to four years. Insert rows directly or with factories. Never use the demo seeder.
   - Above each assertion, a comment with the hand calculation, step by step, so a reviewer can check the arithmetic without running anything.
   - Run `$this->artisan('metrics:refresh')->assertSuccessful()`, then assert the stored value.
   - One test for the "not available" case (for example a zero denominator). It must come back as not available, not as `0`.
   - For anything involving sales, one test for the "hidden" case.
   Run it and watch it fail.
4. **Implement in SQL** in `database/sql/metrics/<summary_table>.sql`, one file per summary table. A file rebuilds its whole table (delete then insert, or truncate then insert) so a refresh is always complete. Why SQL: the same query can be shown to a judge, and it is fast enough for the whole province.
5. **Wire it into `metrics:refresh`.** Run the SQL files in dependency order (`stats_area_year` first) inside one transaction, so a failed refresh never leaves half-updated tables. Keep the `metrics/refreshed-at.txt` stamp that `app:doctor` reads.
6. **Thresholds from config.** Read `config('cagayan....')` in PHP and pass values as SQL bindings. No numeric literals for anything listed in "Config values".
7. **Sales stay protected.** The SQL may read `declared_gross_sales`; nothing else may. Store totals plus `declared_sales_max_single` where the privacy guard needs it. Hiding happens in the guard when the figure is read, not in the SQL.
8. **Run** `php artisan test --compact tests/Feature/Metrics/`, then `composer db:reset` to prove the refresh runs on the demo data, then `composer ci:check`.
9. **Update `docs/team/roadmap.md`**: set $metric to `Done`.
10. **Never edit `docs/engineering/metrics.md` to match the code.** If the definition looks wrong, stop and raise it. Changing it needs a pull request with two reviewers.

## Done when

The metric's test, its "not available" test, and (for sales) its "hidden" test pass with hand calculations in comments, `metrics:refresh` fills the table on the demo data, `composer ci:check` is green, and the roadmap shows $metric as Done.
