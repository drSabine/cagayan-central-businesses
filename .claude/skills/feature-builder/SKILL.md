---
name: feature-builder
description: Build one product feature (C1 to C14 on the Capitol side, P1 to P5 on the public side) as a tested vertical slice, privacy first.
argument-hint: "[feature id, e.g. C3 or P2]"
arguments: [feature]
disable-model-invocation: true
---

# Build feature $feature

One feature, one branch, one pull request. Do not build parts of other features along the way.

## Read first

1. `docs/product/mvp-scope.md`: the entry for $feature, plus "Out of scope for the MVP" and the "Demo walkthrough" step that uses it.
2. `docs/engineering/privacy-rules.md`: all of it, if the feature shows any business data. It almost always does.
3. `docs/engineering/metrics.md`: every metric the feature displays.
4. `docs/engineering/data-model.md`: the tables and the visibility class of every field the feature touches.
5. `docs/team/roadmap.md`: the feature's current status.
6. `.claude/rules/backend.md`, `frontend.md`, `privacy.md`, `testing.md`.

## Steps

1. **Restate the feature** as three to six acceptance checks a person can verify by clicking. List what is out of scope for this feature. If the product document is ambiguous or two docs disagree, stop and ask. Do not resolve it yourself.
2. **Check dependencies.** For every table and every metric the feature needs, confirm it exists: look in `database/migrations/` for the table, and in `database/sql/metrics/` plus `app/Console/Commands/RefreshMetricsCommand.php` for the metric. If something is missing, stop and name the skill to run first, for example `/db-change ...` or `/metric-builder M5`. Building a metric inside a feature hides it from review.
3. **Propose the vertical slice**, then wait for approval before writing code:
   - route and name (`capitol.*` inside the auth group, or `public.*`)
   - controller in `app/Http/Controllers/Capitol/` or `app/Http/Controllers/Public/`
   - Form Request, if the feature takes input or filters
   - data object(s) in `app/Data/`, listing every field. Separate public and admin objects. Sales figures as guarded objects from the privacy guard.
   - the query, reading `stats_` tables only
   - the page in `resources/js/pages/capitol/` or `resources/js/pages/public/` and its components
   - the tests, by name
4. **Build in this order**, because each step proves the one before it:
   1. Server tests first, in `tests/Feature/Capitol/` or `tests/Feature/Public/`: the happy path, and the privacy cases (hidden figure with reason, admin fields absent from public responses, sentinel sales value absent everywhere, a filter that shrinks a group below the threshold). They should fail.
   2. The back end until those tests pass.
   3. The page with typed props matching the data object.
   4. The four view states: loading, empty, not available, hidden, with the exact words from `docs/engineering/privacy-rules.md`.
   5. The "Simulated data" label, from the shared layout.
5. **Run `composer ci:check`.** Fix until green.
6. **Run the `privacy-reviewer` agent** on the diff (`git diff main...HEAD`). Resolve every finding, or explain to the person why one does not apply.
7. **Update `docs/team/roadmap.md`**: set $feature to `Done`, or `In progress` if parts remain.
8. **Finish with the manual check**: the exact URL, which account to log in with (or none for public pages), each click, and what the person should see, including where a hidden figure appears in the demo data.

## Done when

Every acceptance check passes, the privacy tests exist and pass, `composer ci:check` is green, the privacy reviewer has no open findings, the roadmap is updated, and the person has the click-by-click check. Then suggest `/commit` and `/open-pr`.
