# Engineering Decisions

What the team decided and why. Change a decision only through a pull request that edits this file, so the reason travels with the change.

**Decided** means build on it. **Open** means a default is in place and a named person still has to confirm it.

## D1. Laravel with Inertia and React in one application

**Decided.** Laravel serves the pages, React renders them, Inertia connects the two. One codebase, one deploy, no separate API, no token login. Created from the official Laravel React starter kit.

**Why:** the video is due October 30. One codebase removes a whole category of work, and PHP is common in Philippine government IT, which helps the Technical Feasibility score and makes handover to the Capitol realistic.

## D2. PHP and Node on the laptop with the database in Docker

**Decided.** PHP 8.3 or newer (WAMP, Laravel Herd, or php.new) with `pdo_pgsql` and `pgsql` on the command line. Node 22. Docker Desktop runs only the database, from `compose.yaml`. All three members use the same PHP minor version, and CI uses it too.

**Why:** the team knows WAMP. Moving only the database into Docker teaches Docker without changing the daily workflow a month before the deadline. After the video, PHP may move into Docker with Laravel Sail.

## D3. PostgreSQL 17 with PostGIS 3.5

**Decided.** Image `postgis/postgis:17-3.5`. Two databases in one container: `cagayan_business` and `cagayan_business_test`. Tests always run on PostGIS, never SQLite.

**Why:** PostGIS is the standard for map systems, QGIS connects to it directly, and it has the spatial functions more towns and layers will need. Do not bump to PostgreSQL 18 without reading the image notes: its data volume path changed.

## D4. Commands are Composer scripts and Artisan commands

**Decided.** No bash or PowerShell setup scripts. Everything is `composer <script>` or `php artisan <command>`, written as arrays of single commands with no shell operators.

**Why:** the team is on Windows, and PHP runs the same everywhere.

## D5. MapLibre GL JS through react-map-gl for the map

**Decided.** Shapes come from PostGIS as GeoJSON and are drawn as filled, clickable layers. No external basemap is required: the booth demo runs offline. Shapes are simplified before loading. A local PMTiles basemap is optional polish.

## D6. Supporting libraries

**Decided.** Charts: Recharts. Tables: TanStack Table. PDF: `barryvdh/laravel-dompdf`. CSV: a streamed Laravel response, no package. Boundary preparation outside the app: QGIS and mapshaper. Each is installed with the first feature that needs it, and its version recorded below.

## D7. Metrics are computed in SQL and stored in summary tables

**Decided.** `php artisan metrics:refresh` rebuilds every `stats_` table from raw records. Screens read summary tables, never compute metrics in PHP loops or React. Definitions are in `metrics.md`.

**Why:** one definition per number, testable with a small fixture, and the exact query can be shown to a judge.

## D8. Privacy rules are enforced in one place on the server

**Decided.** One service applies the small-group, dominance, and band rules. Pages receive Data objects whose fields were chosen on purpose, never models. Rules are in `privacy-rules.md`.

**Why:** with Inertia, everything passed to a page can be read in the browser. Hiding a value in React protects nothing.

## D9. Login and roles

**Decided.** Login from the starter kit (Fortify). Public registration is off. Capitol administrator accounts come from the seeder or an Artisan command. One role in the MVP, `capitol_admin`, checked by a `capitol` gate on the Capitol route group. The public side has no login.

## D10. Simulated data

**Decided.** Seeders with a fixed seed, so every laptop shows the same numbers. Data years 2020 through 2026, outlook year 2027. Every simulated record has `is_simulated = true`, and every screen and export that shows business records carries a visible "Simulated data" label. Requirements are in `database.md`, "Seeder requirements".

## D11. Quality gates

**Decided.** Pest for tests. `composer ci:check` runs the front end check, TypeScript, Pint, Larastan, and the tests. CI must be green to merge.

## D12. CI and CD

**Decided for CI. Open for CD (O5).** GitHub Actions on every pull request and every push to `main` or `staging`, with a PostGIS service container on the same image as local. Deploy runs on a version tag over SSH and stays off until `DEPLOY_ENABLED` is set. See `deployment.md`.

## D13. Git workflow

**Decided, updated October 3, 2026.** `main` is production. `staging` is development and the default branch. Every task is a short-lived branch inside `staging` (`feat/`, `bug/`, `data/`, `docs/`, `chore/`), squash merged back into `staging`. `main` changes only through a release pull request from `staging`, merged with a merge commit so the two keep sharing history, then tagged. Both branches are protected. Conventional Commits, no attribution trailers. See `docs/team/workflow.md`.

## D14. Laravel Boost

**Decided.** Boost is a development dependency. It gives Claude Code documentation and tools that match the installed versions. It rewrites the `<laravel-boost-guidelines>` block in `CLAUDE.md` and the skills listed in `boost.json` on `composer update`. Project guidance lives outside that block and in skills Boost does not manage.

## D15. Keep Inertia and React

**Decided October 3, 2026.** Reviewed after kickoff. Replacing Inertia with a React single-page app and a JSON API would add an API layer, token auth, client routing, and duplicated validation, for no gain in this project. Switching React to Vue would mean rewriting every starter page for no gain. Vite stays either way: it is the build tool, not an alternative to Inertia.

## D16. Git hooks check every commit and push

**Decided October 3, 2026.** `.githooks/` runs for people and AI agents alike.

- `pre-commit`: refuses `main` and `staging`, secrets, build output, and debugging leftovers, then runs the fast checks for the file types staged (Pint, PHPStan, front end format and lint, TypeScript).
- `commit-msg`: strips AI attribution and checks the Conventional Commit format.
- `pre-push`: refuses `main` and `staging`, then builds and runs `composer ci:check`, the same as CI.

**Why:** commits stay quick, and nothing broken leaves a laptop. Claude Code is denied `--no-verify` in `.claude/settings.json`.

## D17. Back end structure

**Decided October 3, 2026.** Controllers stay thin. Reads go in Query classes (`app/Queries/`), writes in Action classes (`app/Actions/`), shared domain rules in Services (`app/Services/`), and page payloads in plain readonly Data classes (`app/Data/`). No repository layer, no data-object package. Lazy loading of relationships throws outside production. See `architecture.md`.

**Why:** each piece has one job, pages get only the fields we chose, and nothing is added before it is needed.

## D18. Progressive Web App later

**Decided October 3, 2026.** Not before the video. Manifest and icons may be added any time. A service worker that caches static assets only may follow before the booth. See `pwa.md`.

## Open decisions

Each has a default so work is not blocked.

- **O1. Boundary source.** Owner: data member. Default: the files in `data/boundaries/` from `faeldon/philippines-json-maps` (MIT), cross-checked against `bendlikeabamboo/barangay-boundaries-repository`. Still open: the terms for the underlying NAMRIA boundaries, checking the 49 codes and names against PSA's current listing, and whether to use full-detail shapes.
- **O2. Public sales band edges.** Owner: team with adviser. Default: under 10 million, 10 to 50 million, 50 to 100 million, 100 to 500 million, 500 million to 1 billion, over 1 billion pesos.
- **O3. Dominance threshold.** Owner: team with adviser. Default: 70 percent.
- **O4. Peer comparison margin.** Owner: team with adviser. Default: 20 percent below the peer median.
- **O5. Hosting for the online version.** Owner: back end member. Default: one small VPS. Not needed for the video or the booth.
- **O6. Size of the simulated dataset.** Owner: data member. Default: about 4,000 businesses. Replace with a figure grounded in a public count if one is found, and cite it.
- **O7. Outlook middle estimate.** Default: the average renewal rate of the three most recent years. Confirm with the adviser. See `metrics.md`, M11.
- **O8. Unused starter kit features.** Owner: back end member. Email verification, passkeys, two-factor login, and account deletion came with the starter kit. Default: leave them as they are until after the video, then remove what Capitol administrators do not need.

## Installed versions

Recorded October 3, 2026, from `composer.lock`, `package-lock.json`, and the running database. Update this when a package is added or upgraded.

- PHP 8.3.14 locally (WAMP), 8.3 in CI
- Laravel 13.34.0, Fortify 1.40.0, Wayfinder 0.1.21, Boost 2.10.1, Larastan 3.12.2, Pint 1.32.1
- inertia-laravel 3.5.1, @inertiajs/react 3.8.0
- React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3
- Vite 8.3.2 through vite-plus 0.3.0 (`vp`). `npm run check` is `vp check`, which formats and lints.
- Node 22 in CI. Node 24.9.0 also works locally.
- PostgreSQL 17.5, PostGIS 3.5.2
- Pest 4.7.8, Paratest 7.20.0
- Not installed yet: MapLibre GL JS and react-map-gl (F6), Recharts (first chart), TanStack Table (first table), laravel-dompdf (C14)

## Changes from the starter kit

- `.claude/`, `CLAUDE.md`, `.mcp.json`, and `boost.json` are committed as shared team files. Only `.claude/settings.local.json` and `CLAUDE.local.md` are ignored.
- The formatter in `vite.config.ts` skips Markdown, `data/`, `.claude/`, and the Docker and Boost config files.
- `composer types:check` runs PHPStan with `--memory-limit=1G`, because WAMP's default limit crashes it.
- Public registration is off: the Fortify feature, its page, and its links were removed. `tests/Feature/Auth/RegistrationDisabledTest.php` checks it.
- Boost's `infer-conventions` skill was removed. The team records conventions in these docs instead.
