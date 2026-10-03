---
name: privacy-check
description: Use before any commit or pull request whose diff touches controllers, data objects, exports, pages, or queries over business data. Walks docs/engineering/privacy-rules.md rule by rule against the diff and reports findings.
argument-hint: "[optional base branch or file list]"
---

# Privacy check

Scope given by the person, if any: $ARGUMENTS. Otherwise check the working tree against `main`.

With Inertia, everything a controller passes to a page reaches the browser. A leak in a prop is a leak, whether or not React shows it. This check exists because the author of a change is the worst person to spot their own leak.

## Steps

1. **Read the diff**: `git diff main...HEAD` plus `git diff` for uncommitted work. List the changed files.
2. **Read `docs/engineering/privacy-rules.md` in full.** Walk P1 to P14 one at a time against the diff. For each rule, decide: applies and holds, applies and is broken, or does not apply.
3. **Search the diff** for the usual leaks:
   - an Eloquent model, collection of models, or `->toArray()` / `->toJson()` of a model passed to `Inertia::render`, `Inertia::share`, `inertia()`, or shared props in `app/Http/Middleware/HandleInertiaRequests.php`
   - any read of `declared_gross_sales` outside `database/sql/metrics/`
   - a sales figure that does not come from the privacy guard, or a numeric sales value in a public data object
   - an admin field (owner name, contact number, ownership type, size category, employee count) in a public data object, public route, or public page
   - a full record view without a `record_view_logs` write
   - a threshold written as a literal instead of `config('cagayan....')`
   - a new page or export without the "Simulated data" label
   - a sales amount, owner name, or contact number in a log call or exception message
   - a new filter without a test for the hidden case
4. **Run the privacy tests**, if the folders exist: `php artisan test --compact tests/Feature/Privacy tests/Arch`. Report failures.
5. **Report findings by rule id**, each with file, line, what is wrong, and why it matters. If there are none, list the rules checked and say each holds or does not apply.
6. **Fix only when asked.**

## Done when

Every rule P1 to P14 has a verdict for this diff, the privacy and architecture tests have run, and each finding has a file and line.
