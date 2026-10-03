# Cagayan Business

A map-based dashboard of registered businesses for the Provincial Government of Cagayan, built for the PGC Digital Innovation Challenge. Prototype video due October 30, 2026.
Two audiences: Capitol administrators (logged in, see area sales totals and owner contacts) and the public (no login, sales as bands only, a start-a-business guide, citizen wishes).
MVP: Tuguegarao City's 49 barangays. Real boundaries and population, simulated business records labeled "Simulated data".

## Stack

Laravel 13 (PHP 8.3), Inertia 3, React 19 with TypeScript, Vite 8 (through vite-plus, `vp`), Tailwind CSS 4, shadcn/ui on Radix, Fortify for login, Wayfinder for typed routes, PostgreSQL 17 with PostGIS 3.5 in Docker, Pest 4. There is no separate API: controllers render React pages through Inertia.

## Start every session like this

1. Run `git branch --show-current`. If it says `main` or `staging`, create a work branch inside `staging` before changing anything: `git switch staging`, `git pull --ff-only`, `git switch -c feat/short-description` (or `bug/`, `data/`, `docs/`, `chore/`). `main` is production, `staging` is development, and work branches merge back into `staging` only. Rules: `docs/team/workflow.md`.
2. Read the doc for the area you will touch (table below). The team has a frontend developer, a backend developer, and a data and content member (`docs/team/workflow.md`, "Roles"). The Data object is the contract between frontend and backend.
3. Propose a short plan, then build the smallest slice that works end to end.

## Commands

All work in PowerShell. Add new tasks as Composer scripts, never as bash or PowerShell scripts.

- `composer setup`: first-time setup on a fresh clone. Safe to rerun.
- `composer dev`: run the app at http://localhost:8000 (server, queue, Vite).
- `composer ci:check`: everything CI runs: front end format and lint, TypeScript, Pint, PHPStan, Pest.
- `php artisan test --compact tests/Feature/PostgisTest.php`: one file. Add `--filter="name"` for one test.
- `composer lint`: fix PHP formatting. `npm run check:fix`: fix front end formatting and lint.
- `composer db:up`: start the database. `composer db:reset`: rebuild the demo dataset.
- `php artisan metrics:refresh`: rebuild every `stats_` summary table.
- `composer doctor`: check this machine and the database, with a fix for each failure.

Git hooks run checks on their own: fast checks on `git commit`, the full `ci:check` and a build on `git push`. Never bypass them with `--no-verify`.

## How a request flows

```
route -> Form Request -> controller -> Query (read) or Action (write) -> Data object -> Inertia page -> components
```

- **Routes:** named `public.*` or `capitol.*`. Capitol routes live in one group with `auth` and `can:capitol`.
- **Controllers:** thin. Call one Query or Action, render one page or redirect. No business rules, loops, or `DB::` calls.
- **Queries** (`app/Queries/`) read `stats_` tables and return Data objects. **Actions** (`app/Actions/`) do one write each. **Services** (`app/Services/`) hold rules shared by several of them, such as the privacy guard.
- **Data objects** (`app/Data/`): plain readonly classes with exactly the fields a page needs. Pages never get models.
- **Pages** (`resources/js/pages/`) receive typed props and arrange the screen. Shared UI goes in `resources/js/components/`.

Details and examples: `docs/engineering/architecture.md` (back end) and `docs/engineering/frontend.md` (front end).

## How to write code here

- **Simple first.** Write the shortest clear code that solves today's task. No layer, interface, abstraction, or option "for later".
- **Performance by default.** Eager load with `with()` (lazy loading throws outside production), paginate lists, stream exports with `lazyById()`, aggregate in SQL, send only the props a page renders.
- **Reuse before writing.** Search `app/Queries`, `app/Services`, `app/Data`, model scopes, `resources/js/components`, and `components/ui` first. Extract shared code on the third copy, not the first.
- **Do not over-split.** Keep markup in the page until it repeats or the file passes about 200 lines. No one-line wrapper components, no pass-through props, no `index.ts` re-exports.
- **Comments only when the reason is not obvious from the code.** One short line, saying why, not what. No commented-out code. PHPDoc only where PHPStan needs types (array shapes, generics).
- **Follow sibling files** for naming and structure. Use `php artisan make:*` with `--no-interaction` to create files.
- **Login is Fortify, login and logout only.** The rest of the starter kit was removed (decisions.md, O8). Do not bring back registration, password reset, email verification, two-factor, passkeys, or settings pages without a decision.
- **No new packages** without asking. A new package needs a line in `docs/engineering/decisions.md`.

## UI rules

- No em dashes, en dashes, or middots anywhere in the interface.
- Titles and headings are one name with no separators: no commas, dashes, middots, or pipes.
- No gradients. Colors from tokens only (`bg-primary`, `bg-map-3`, `text-status-closed`), never raw hex or palette classes.
- Every data view handles loading, empty, not available, hidden, and error. "Not available" and "hidden" are never shown as `0`.
- Filters and tabs live in the URL. After a write, redirect and show a toast. Links use Wayfinder imports, never hard-coded URLs.

Full rules: `docs/engineering/design.md`.

## Rules that are never broken

- No single business's sales ever leaves the server.
- Every sales figure comes from the privacy guard.
- Pages get Data objects, never models, including shared props.
- Admin fields only behind login, and every full record view is logged.
- Every screen and export with business records shows the "Simulated data" label.
- Thresholds live in `config/cagayan.php`, never as literals.
- Metrics are defined in `docs/engineering/metrics.md` and computed in SQL. A definition changes only with a human-approved doc change.
- Checklist content needs an official source and a verification date from a team member. Never write a requirement from memory.
- Tests run on PostGIS, never SQLite.
- Never edit a migration that has been merged. Add a new one.
- Docker (`compose.yaml`, `docker/`) is shared by the whole team and CI. Change it only when the task is about Docker, as its own `chore/` pull request. Per-laptop settings such as the port go in `.env`. Never run commands that delete the database (`docker compose down -v`, `docker volume rm`).
- Never commit or push directly to `main` or `staging`. Work pull requests go into `staging`. `main` changes only by a release from `staging`. Never force push a shared branch, never skip hooks.
- No attribution trailers or generated-by text in commits or pull requests.

If a product rule, metric, or privacy rule looks wrong, or two docs disagree, stop and ask. Do not resolve it quietly.

## Read before you touch

| Working on | Read first |
| :- | :- |
| Any feature | `docs/product/mvp-scope.md` (features C1 to C14, P1 to P5, the demo walkthrough) |
| Routes, controllers, models, queries, services | `docs/engineering/architecture.md` |
| Pages, components, styling, copy | `docs/engineering/frontend.md`, `docs/engineering/design.md` |
| Migrations, models, factories, seeders | `docs/engineering/database.md` |
| Any number on screen | `docs/engineering/metrics.md` |
| Anything showing business data | `docs/engineering/privacy-rules.md` |
| Tests | `docs/engineering/testing.md` |
| Adding a package or making a decision | `docs/engineering/decisions.md` |
| Branches, commits, pull requests | `docs/team/workflow.md` |
| Feature status | `docs/team/roadmap.md` |
| Boundary files | `data/boundaries/README.md` |

## Skills

Start each task from one:

- `/feature-builder C3`: build one feature as a tested vertical slice.
- `/metric-builder M10`: build one metric in SQL, test first.
- `/db-change <what>`: change the schema with its model, factory, seeder, and doc.
- `/checklist-content <item>`: add a start-a-business guide item from an official source.
- `/commit`: run the checks, review the diff, commit, and print the pull request description.
- `/open-pr`: push and open the pull request into `staging`.
- `/privacy-check` or the `privacy-reviewer` agent: before committing anything that touches business data.
- `/design-check`: before committing a UI change.
- `/demo-check`: before recording or the booth.

## Done means

Acceptance checks met. Tests pass, including privacy cases. `composer ci:check` green. Loading, empty, not available, hidden, and error states handled. Simulated label shown. Wording follows `design.md` and `privacy-rules.md`. Roadmap status updated. When Claude gets something wrong twice, add the correction here or in `.claude/rules/` in the same pull request.

Where the Laravel Boost guidelines below disagree with this file, this file wins.

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.3. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior and logic changes when a test provides meaningful regression coverage.
- Pure copy, styling, and layout-only changes do not require new or updated tests.
- When test coverage applies, run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

# Pest

- This project uses Pest. Create tests with `php artisan make:test --pest {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval. They are part of the application.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/pest` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.
- After the feature tests pass, ask the user to run the complete suite with `php artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
