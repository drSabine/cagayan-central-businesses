---
paths:
  - "tests/**"
---

# Testing rules

Full guide: `docs/engineering/testing.md`.

- **Pest functions** (`it()`, `expect()`). Create with `php artisan make:test --pest NameTest`. The starter kit's class-style tests stay until the planned conversion.
- **PostGIS, never SQLite.** `uses(RefreshDatabase::class)` for anything touching the database. Pure logic goes in `tests/Unit/` with no database.
- **Where:** `tests/Feature/Capitol/`, `Public/`, `Metrics/`, `Privacy/`, `Seeder/`, plus `tests/Unit/` and `tests/Arch/`. Create a folder with its first real test.
- **Test behavior at the boundary:** status, redirect, Inertia props (`assertInertia` with `where`, `missing`), database rows. Not page text, unless the text is the rule.
- **Fast:** factories with the few rows needed. Never the demo seeder, except in `tests/Feature/Seeder/`. Fake mail, notifications, queues, HTTP.
- **Reliable:** freeze time with `travelTo()`, set values the test checks explicitly, no network, no test depending on another.
- **Metrics:** hand-built fixture, the hand calculation in a comment above the assertion, run `metrics:refresh`, assert the stored value. Add "not available" and, for sales, "hidden" cases.
- **Privacy:** seed a sentinel value and assert it is absent from every relevant response. Assert the hidden reason, not just a missing value.
- **Thresholds from config** in fixtures, never a literal `5`.
- **Rate limits:** send the allowed number of requests plus one, expect 429. Do not rebuild throttle keys.
- **CSRF in Laravel 13** is off during tests. Assert the route is in the `web` group instead of expecting 419.
- **Security tests must fail without the protection.** Break it on purpose once, watch the test fail, restore it.
- Run the narrowest set first (`php artisan test --compact <file>`). The pre-push hook runs the full suite.
- Never delete or weaken a test to make a change pass. If a test looks wrong, stop and ask.
