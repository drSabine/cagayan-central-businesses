---
paths:
  - "app/**/*.php"
  - "routes/**/*.php"
  - "config/**/*.php"
---

# Back end rules

Full guide with examples: `docs/engineering/architecture.md`.

- **Flow:** route, Form Request, controller, Query (read) or Action (write), Data object, Inertia page.
- **Thin controllers.** Call one Query or Action, then render one page or redirect. No loops, business `if`s, sums, or `DB::` calls in controllers.
- **Where code goes:** reads in `app/Queries/`, single writes in `app/Actions/`, rules shared by several of those in `app/Services/`, page payloads in `app/Data/` (final readonly classes), enums in `app/Enums/`.
- **Validation in Form Requests** under `app/Http/Requests/`. Turn input into typed values there (`$request->filters()`).
- **Routes:** every route named. Public routes `public.*` in `routes/public.php`. Capitol routes `capitol.*` in `routes/capitol.php`, inside the one group with `auth` and `can:capitol`. Bind by readable keys (`{barangay:psgc_code}`). URLs are lower case with hyphens, plural nouns, no verbs, filters in the query string (`architecture.md`, "Clean URLs").
- **After a write, redirect** with `to_route('name')` or `back()`, never a typed path, and flash a toast with `Inertia::flash('toast', [...])`. Never render a page from a write.
- **Pages receive Data objects,** never models, collections of models, or `->toArray()` of a model.
- **Numbers on screen come from `stats_` tables.** Never aggregate `businesses` or `business_years` in request code. `declared_gross_sales` is read only by `database/sql/metrics/`.
- **Money is a decimal string.** Never cast to float. Add and compare in SQL or with `bcadd` and `bccomp`.
- **No N+1.** Lazy loading throws outside production. Eager load with `with()`, count with `withCount()`, select only needed columns. Paginate lists. Stream exports with `lazyById()`.
- **Rate limit** anything a stranger can repeat: named limiters in `AppServiceProvider`, applied with `throttle:<name>`.
- **Thresholds from config:** `config('cagayan.privacy.small_group_min')`, never the literal. Pass them to SQL as bindings.
- **No protected data in logs or exceptions** (privacy rule P14).
- **Keep it simple.** `final` classes, constructor injection, no interfaces with one implementation, no repositories, no base classes for later. Short methods.
- **Comments** only when the reason is not obvious. One line. PHPDoc only for types PHPStan needs.
- **Login** is Fortify with login and logout only (`FortifyServiceProvider`, `config/fortify.php`). The rest of the starter kit was removed (decisions.md, O8).
- Run `composer lint` after editing PHP. The pre-commit hook checks Pint and PHPStan.
