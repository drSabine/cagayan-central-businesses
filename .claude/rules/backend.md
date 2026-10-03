---
paths:
  - "app/**/*.php"
  - "routes/**/*.php"
  - "database/**/*.php"
  - "config/**/*.php"
---

# Back end rules

- **Thin controllers.** A controller validates, calls a query or service, builds a data object, and renders. No business logic, no metric arithmetic.
- **Validation in Form Request classes** under `app/Http/Requests/`, never inline `$request->validate()` in Capitol or public controllers.
- **Queries read summary tables.** Anything that shows a count, rate, or sales figure reads a `stats_` table filled by `php artisan metrics:refresh`. Do not aggregate `businesses` or `business_years` in request code. Why: one definition per number, testable in SQL (decisions.md, D7).
- **The sales column is never read in request code.** `business_years.declared_gross_sales` is read only by the SQL in `database/sql/metrics/`, and it is in the model's hidden fields.
- **Money is a decimal string.** `decimal(16, 2)` in the database, a string in PHP. Never cast to float. Add and compare in SQL or with `bcadd` and `bccomp` (bcmath is loaded).
- **PSGC codes are 10 character strings**, never integers. They can start with zero.
- **One backed string enum per enum column** in `app/Enums/`, cast on the model. Case names in TitleCase.
- **Route names are prefixed** `capitol.` or `public.`. Capitol routes live inside one group, `Route::middleware(['auth', 'verified'])->prefix('capitol')->name('capitol.')->group(...)`, so a new route cannot be left open by mistake.
- **Controllers by side**: `app/Http/Controllers/Capitol/` and `app/Http/Controllers/Public/`. A controller never serves both.
- **Pages receive data objects** from `app/Data/`, never models, collections of models, or `->toArray()` of a model. See `.claude/rules/privacy.md`.
- **Thresholds from config.** `config('cagayan.privacy.small_group_min')`, never the literal `5`. Same for every key in `config/cagayan.php`. In SQL, pass them as bindings.
- **Geometry is SRID 4326.** Wrap loaded shapes with `ST_Multi`. Cast to `geography` for areas and distances. Every geometry column gets a spatial index.
- **Migrations**: never edit one that has been merged to `main`; add a new one. Update `docs/engineering/data-model.md` in the same change.
- **No protected data in logs or exceptions** (privacy-rules.md, P14): no sales amounts, owner names, or contact numbers.
- Run `vendor/bin/pint --dirty` after editing PHP, then `composer ci:check` before committing.
