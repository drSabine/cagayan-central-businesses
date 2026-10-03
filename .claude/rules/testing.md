---
paths:
  - "tests/**"
---

# Testing rules

- **Pest, function style**: `test('...', function () { ... })`. Create with `php artisan make:test --pest NameTest`. The starter kit's class-style tests stay as they are.
- **Tests run on PostGIS**, in `cagayan_business_test` (set in `phpunit.xml`). Never SQLite. Add `uses(RefreshDatabase::class)` to anything that touches the database.
- **Where tests go**: `tests/Feature/Metrics/`, `tests/Feature/Privacy/`, `tests/Feature/Capitol/`, `tests/Feature/Public/`, `tests/Arch/`. Create the folder with its first real test.
- **Metric tests use hand-built fixtures**: two or three barangays, a handful of businesses, two to four years. Write the hand calculation in a comment above the assertion. Run `$this->artisan('metrics:refresh')`, then assert the stored value. Add one test for the "not available" case and, for sales, one for the "hidden" case.
- **Never test a metric against the demo seeder.** The seeder can change; the definition cannot. Only the seeder requirement tests (data-model.md, items 5 to 9) use the demo seeder.
- **Privacy tests assert absence.** Seed a sentinel value (a distinctive sales amount, owner name, contact number), call every relevant route, and assert the sentinel appears nowhere in the response. Assert the hidden reason (`small_group`, `dominance`, `complementary`), not just a missing value.
- **Hidden is never zero.** When a value is hidden or not available, assert its state and assert it is not `0`.
- **Thresholds from config in tests too.** Build fixtures around `config('cagayan.privacy.small_group_min')`, so a changed threshold cannot leave a test passing for the wrong reason.
- Run the narrowest set first, for example `php artisan test --compact tests/Feature/PostgisTest.php`. Then `composer ci:check` before committing.
- Never delete or weaken an existing test to make a change pass. If a test looks wrong, stop and ask.
