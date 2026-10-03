# Engineering Decisions

This file records what the team decided and why. Change a decision only through a pull request that edits this file, so the reason travels with the change.

Status words: **Decided** means build on it. **Open** means a default is in place and a named person still has to confirm it.

Facts marked "checked Oct 3, 2026" were read from the official source on that date. Anything installed later may be newer. Record the real installed versions in the last section.

## D1. One application: Laravel with the official React starter kit

**Status:** Decided

- One codebase, one deploy. Laravel serves the pages, React renders them, Inertia connects the two without a separate API or token login.
- Create it with the Laravel installer: `laravel new <folder> --react --pest --database=pgsql --boost --npm --git`. These flags exist in the installer source (checked Oct 3, 2026).
- The React starter kit ships with (checked Oct 3, 2026, from its `composer.json` and `package.json`):
  - PHP `^8.3`, Laravel `^13.17`, Inertia `^3.0`
  - React `^19.2`, TypeScript `^5.7`, Tailwind CSS `^4`, Vite `^8`
  - Fortify for login, Wayfinder for typed routes, Radix UI based components in the shadcn/ui style
  - Pint for PHP formatting, Larastan for static analysis, Sail for an optional all Docker setup
  - Composer scripts: `setup`, `dev`, `lint`, `test`, `ci:check`
  - npm scripts: `dev`, `build`, `check`, `check:fix`, `types:check`
- **Why:** the video is due October 30. One codebase removes a whole category of work, and PHP is common in Philippine government IT, which supports the Technical Feasibility score and makes handover to the Capitol realistic.
- **Caution:** never run the installer with `--force` on the project folder. Scaffold into an empty temporary folder, then move the files in.

## D2. PHP and Node run on the laptop, the database runs in Docker

**Status:** Decided

- PHP 8.3 or newer on each laptop, from WAMP, Laravel Herd, or the php.new installer. The command line PHP must have `pdo_pgsql` and `pgsql` enabled.
- Node 22, the version the starter kit's own CI uses.
- Docker Desktop runs only the database, using `compose.yaml`.
- **Why:** the team knows WAMP. Moving only the database into Docker teaches Docker without changing the whole daily workflow one month before a deadline.
- **Later:** after the video is submitted, move PHP into Docker with Laravel Sail so laptops and server match.
- **Rule:** all three members use the same PHP minor version. CI uses that same version.

## D3. PostgreSQL 17 with PostGIS 3.5

**Status:** Decided

- Image: `postgis/postgis:17-3.5` (checked Oct 3, 2026: PostgreSQL 17, PostGIS 3.5.2).
- Two databases in the one container: `cagayan_business` for development and `cagayan_business_test` for tests.
- Tests always run against real PostGIS. SQLite is never used, because spatial queries and SQL metrics would not be tested.
- **Why PostGIS over MySQL:** it is the standard for map-based systems, QGIS connects to it directly, and it has the spatial functions needed when more towns and layers are added.
- **Note for a later upgrade:** images for PostgreSQL 18 use a different data volume path (`/var/lib/postgresql`). Do not bump the tag without reading the image notes.

## D4. Setup and daily commands are Composer scripts and Artisan commands

**Status:** Decided

- No bash or PowerShell setup scripts. Everything is `composer <script>` or `php artisan <command>`.
- **Why:** the team is on Windows. PHP runs the same on every machine, so there is one script to maintain, not two.

## D5. Map: MapLibre GL JS through react-map-gl

**Status:** Decided

- Barangay and town shapes come from PostGIS as GeoJSON and are drawn as filled, clickable layers.
- No external basemap is required. The map must work with no internet, because the booth demo runs from a laptop. A basemap from a local PMTiles file is optional polish.
- Shapes are simplified before loading so the province map stays fast.
- Install the current stable releases and record them below.

## D6. Supporting libraries

**Status:** Decided

- Charts: Recharts
- Data tables: TanStack Table
- PDF brief: `barryvdh/laravel-dompdf`
- CSV: a streamed Laravel response, no package
- Boundary preparation, outside the app: QGIS and mapshaper

## D7. Metrics are computed in SQL and stored in summary tables

**Status:** Decided

- One command, `php artisan metrics:refresh`, rebuilds every summary table from the raw records.
- Screens read summary tables. They do not compute metrics in PHP loops or in the browser.
- **Why:** every number has one definition in one place, it can be tested with a small fixture, and judges can be shown the exact query behind a number.
- Definitions are in `docs/engineering/metrics.md`.

## D8. Privacy rules are enforced on the server, in one place

**Status:** Decided

- One service applies the small-group, dominance, and band rules. Every sales figure passes through it before it leaves the server.
- Pages never receive database models. They receive explicit data objects whose fields were chosen on purpose.
- **Why:** with Inertia, everything passed to a page is readable in the browser. Hiding a value in React does not protect it.
- Rules are in `docs/engineering/privacy-rules.md`.

## D9. Login and roles

**Status:** Decided

- Login comes from the starter kit (Fortify).
- Public registration is turned off. Capitol administrator accounts are created by seeder or by an Artisan command.
- One role in the MVP: `capitol_admin`. The public side has no login.
- City and municipal office roles come after the MVP.

## D10. Simulated data

**Status:** Decided

- Laravel seeders with a fixed seed, so every laptop and every demo shows the same numbers.
- Data years: 2020 through 2026. Outlook year: 2027.
- Every simulated record is marked `is_simulated = true`. Every screen and every export that shows business records carries a visible "Simulated data" label.
- The seeder must produce the cases the demo needs. See `docs/engineering/data-model.md`, section "Seeder requirements".

## D11. Quality gates

**Status:** Decided

- Tests: Pest.
- One command checks everything: `composer ci:check`. It runs the front end check, TypeScript check, Pint, Larastan, and the test suite.
- A pull request cannot merge unless CI is green.

## D12. CI and CD

**Status:** Decided for CI. Open for CD, see O5.

- CI: GitHub Actions on every pull request and on every push to `main`, with a PostGIS service container that uses the same image as local development.
- CD: a deploy workflow that runs on a version tag and deploys to one server over SSH. It stays switched off until the server exists.
- Use the action versions that the starter kit's own workflow file ships with. Do not pin action versions from memory.

## D13. Git workflow

**Status:** Decided

- `main` is always demo ready and is protected.
- Short lived branches, pull requests, squash merge, Conventional Commits.
- No attribution trailers or generated-by footers in commits or pull requests.
- Details are in `docs/team/team-rules.md`.

## D14. Laravel Boost

**Status:** Decided

- Install Laravel Boost as a development dependency (`--boost` in the installer, or `composer require laravel/boost --dev` then `php artisan boost:install`).
- **Why:** it gives the coding agent documentation and tools that match the installed Laravel version, which reduces outdated code.

## Open decisions

Each has a default so work is not blocked.

- **O1. Barangay and town boundary source.** Owner: data member. Default, already in the repository: the two files in `data/boundaries/`, taken from `faeldon/philippines-json-maps` (MIT License) and cross-checked for codes against `bendlikeabamboo/barangay-boundaries-repository`. Sources, checks, and limits are in `data/boundaries/README.md`. The map is not blocked. Still open: confirm the terms for the underlying NAMRIA boundaries, check the 49 codes and names against PSA's current listing, and decide whether to upgrade to full detail shapes.
- **O2. Public sales band edges.** Owner: team with adviser. Default in config: under 10 million, 10 to 50 million, 50 to 100 million, 100 to 500 million, 500 million to 1 billion, over 1 billion pesos.
- **O3. Dominance threshold.** Owner: team with adviser. Default: 70 percent.
- **O4. Peer comparison margin.** Owner: team with adviser. Default: 20 percent below the peer median.
- **O5. Hosting for the online version.** Owner: back end member. Default: one small VPS. Not needed for the video or the booth, since both can run from a laptop.
- **O6. Size of the simulated dataset.** Owner: data member. Default: about 4,000 businesses across the 49 barangays. Replace with a figure grounded in a public count if one is found, and cite it.
- **O7. Outlook middle estimate.** The product document does not say which renewal rate the middle estimate uses. Default: the average of the three most recent years. Confirm with the adviser. See `metrics.md`, M11.

## Installed versions

Fill this in during kickoff from the real lock files, then keep it current.

Recorded October 3, 2026, during kickoff, from `composer.lock`, `package-lock.json`, and the running database.

- PHP: 8.3.14 locally (WAMP). CI uses 8.3. `composer.json` requires `^8.3`.
- Laravel: 13.34.0. Fortify 1.40.0, Wayfinder 0.1.21, Boost 2.10.1, Larastan 3.12.2, Pint 1.32.1.
- Inertia: inertia-laravel 3.5.1, @inertiajs/react 3.8.0
- React: 19.3.0
- TypeScript: 5.9.3
- Tailwind CSS: 4.3.3
- Vite: 8.3.2, run through vite-plus 0.3.0 (`vp`). The starter kit's `npm run check` is `vp check`, which formats and lints.
- Node: 22 in CI, as the starter kit ships. One laptop runs Node 24.9.0 locally because of another project, and the build and checks pass on it.
- PostgreSQL and PostGIS: PostgreSQL 17.5, PostGIS 3.5.2 (`postgis/postgis:17-3.5`)
- MapLibre GL JS and react-map-gl: not installed yet. Added with F6, the shared map component.
- Recharts: not installed yet. Added with the first chart feature.
- TanStack Table: not installed yet. Added with the first table feature.
- laravel-dompdf: not installed yet. Added with C14.
- Pest: 4.7.8
- Laravel installer used for the scaffold: 5.25.3

### Differences from the starter kit and from D1, noted at kickoff

- The installer at 5.21 had no `--boost` flag. It was updated to 5.25.3, which has it.
- With `--database=pgsql` the installer runs migrations without asking. It ran in the temporary scaffold folder and failed to connect, so nothing was migrated.
- Boost was installed for Claude Code only. Its Kiro and OpenCode files were removed.
- `.gitignore` from the starter kit ignored `.claude/`, `CLAUDE.md`, `.mcp.json`, and `boost.json`. Those are shared team files here, so they are committed. Only `.claude/settings.local.json` and `CLAUDE.local.md` stay ignored.
- The formatter in `vite.config.ts` skips Markdown, `data/`, `.claude/`, and the Docker and Boost config files, so `npm run check` never rewrites the team's documents or the boundary files.
- `composer types:check` runs PHPStan with `--memory-limit=1G`, because WAMP's default 128 MB limit crashes it.
- Public registration is off: the Fortify feature, its view, the register page, and the "Register" and "Sign up" links were removed. The starter kit's registration test was replaced by `tests/Feature/Auth/RegistrationDisabledTest.php`.
