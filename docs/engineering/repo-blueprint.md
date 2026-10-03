# Repository Blueprint

What the repository must contain once kickoff is done, and the standard each piece has to meet. `KICKOFF_PROMPT.md` tells Claude Code when to build each part. This file says what "done" looks like.

Where this blueprint and the starter kit's own conventions differ on naming or folder layout, keep the starter kit's convention and note it in `decisions.md`.

## 1. Target layout

Top level:

- `CLAUDE.md`: project memory for Claude Code
- `README.md`: setup and daily guide for the team
- `compose.yaml`: the database (provided)
- `.gitattributes`: forces LF line endings, so hooks and scripts work on Windows
- `.env.example`: every key the app needs, with safe local defaults
- `data/boundaries/`: barangay and town shapes with their source notes (provided)

Claude Code:

- `.claude/settings.json` (provided)
- `.claude/rules/`: `backend.md`, `frontend.md`, `privacy.md`, `testing.md`, `content.md`
- `.claude/skills/`: one folder per skill, each with a `SKILL.md`
- `.claude/agents/privacy-reviewer.md`

Git and GitHub:

- `.githooks/commit-msg`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/feature.md` and `bug.md`
- `.github/CODEOWNERS`

Application, on top of what the starter kit creates:

- `app/Console/Commands/`: `app:doctor`, `metrics:refresh`
- `app/Data/`: the data objects that pages and exports receive
- `app/Enums/`: one backed enum per enum column
- `app/Http/Controllers/Capitol/` and `app/Http/Controllers/Public/`: the two sides stay apart
- `app/Services/Privacy/`: the guard
- `app/Services/Metrics/`: the refresh logic
- `config/cagayan.php`: every threshold and the simulated flag
- `database/sql/metrics/`: one SQL file per summary table
- `resources/content/checklists/`: start a business checklist content
- `resources/js/pages/capitol/` and `resources/js/pages/public/`
- `resources/js/components/map/`, `charts/`, `privacy/`
- `tests/Feature/Metrics/`, `tests/Feature/Privacy/`, `tests/Feature/Capitol/`, `tests/Feature/Public/`, `tests/Arch/`

Documentation:

- `docs/product/`: the product document and the challenge guidelines (provided)
- `docs/engineering/`: decisions, data model, metrics, privacy rules, this blueprint, plus `deployment.md` written during kickoff
- `docs/team/`: team rules and roadmap (provided)

Kickoff creates folders only where it also creates a real file. Empty placeholder folders are not needed.

## 2. CLAUDE.md

Loaded into every session, so every line costs context. Keep it under 150 lines. Write facts and rules, not explanations that the docs already hold.

Sections, in this order:

1. **What this is.** Three lines: the product, the two audiences, the MVP scope.
2. **Where the truth is.** The docs, each with one line on when to read it. Write each path in backticks. A path with an at sign in front would import the whole file into every session, which is not wanted.
3. **Commands.** Setup, run, test, check, reset the database, refresh metrics, doctor. Exact commands.
4. **Architecture in ten lines.** Request to controller to data object to page. Metrics in SQL summary tables. The guard. The two sides.
5. **Rules that are never broken.** The short list below.
6. **How to work here.** Branch first, use the skills, definition of done.
7. **Out of scope.** The list from the product document, so nobody builds permit processing by accident.

Rules that are never broken, to appear in CLAUDE.md nearly word for word:

- No single business's sales ever leaves the server.
- Every sales figure comes from the privacy guard.
- Pages get data objects, never models.
- Admin fields only behind login, and every full record view is logged.
- Every screen and export with business records shows the "Simulated data" label.
- Thresholds live in `config/cagayan.php`, never as literals.
- Metrics are defined in `docs/engineering/metrics.md` and computed in SQL. Do not change a definition without a human approving the doc change.
- Checklist content needs an official source and a verification date supplied by a team member. Never write a requirement from memory.
- Tests run on PostGIS, never SQLite.
- Never edit a migration that has been merged. Add a new one.
- No attribution trailers or generated-by text in commits or pull requests.

## 3. Path-scoped rules

Files in `.claude/rules/` with a `paths:` list in YAML frontmatter load only when Claude works on matching files. This keeps CLAUDE.md short. Each rule file stays under 60 lines.

- **backend.md**, for `app/**/*.php`, `routes/**/*.php`, `database/**/*.php`, `config/**/*.php`. Thin controllers. Form Request classes for validation. Queries read summary tables. Money as decimal strings. Enums for every enum column. Route names prefixed `capitol.` or `public.`. Capitol routes behind the auth middleware as a group, so a new route cannot be left open by mistake.
- **frontend.md**, for `resources/js/**/*.{ts,tsx}`. Typed props for every page, matching the PHP data object. Use the starter kit's existing components before adding a library. Every data view handles four states: loading, empty, not available, hidden. No metric arithmetic in the browser. Map layers get their data from props, not from a third party at runtime.
- **privacy.md**, for `app/Http/**`, `app/Data/**`, `app/Services/Privacy/**`, and `resources/js/pages/**`. A short form of the review checklist in `privacy-rules.md`, with a pointer to the full file.
- **testing.md**, for `tests/**`. Pest. Hand-built fixtures for metrics, with the working in a comment. Privacy tests assert absence of seeded sentinel values. No test depends on the demo seeder except the seeder requirement tests.
- **content.md**, for `resources/content/**`. Every item needs `source_url`, `verified_on`, `verified_by`. Never invent or infer a requirement, fee, office, or processing time.

## 4. Skills

Format: `.claude/skills/<name>/SKILL.md`, YAML frontmatter then instructions. Use `name`, `description`, and where noted `disable-model-invocation: true`, `argument-hint`, and `allowed-tools`. Put the most important instructions first. Keep each file short and written as steps. Arguments arrive as `$ARGUMENTS`.

Skills that change things outside the working tree, or that should only run when a person decides, are manual: they set `disable-model-invocation: true` and are run by typing the slash command.

### commit (manual)

Purpose: one clean, scoped commit.

1. Stop if on `main`. Offer to create a branch.
2. Read the status and the diff. If the changes are more than one logical change, propose a split and wait.
3. Run `composer ci:check`, unless only documentation changed. Stop on failure.
4. Stage named files only. Never stage `.env` files or build output.
5. Write a Conventional Commit message. Subject in the imperative, 72 characters or fewer. A body only when the reason is not obvious, and then it says why.
6. The message contains no trailers of any kind: no co-author lines, no generated-by line, no session link.
7. Commit. Show the resulting log line. Never push.

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `data`.
Scopes: `capitol`, `public`, `metrics`, `privacy`, `data`, `map`, `guide`, `infra`.

### open-pr (manual)

Purpose: a pull request a teammate can review in ten minutes.

1. Confirm the branch is not `main` and is pushed.
2. Confirm `composer ci:check` passes.
3. Title: a Conventional Commit line, since squash merge makes it the commit on `main`.
4. Body: fill the pull request template. State the feature or metric id, what changed, how to check it by hand, and the privacy checklist answers.
5. No generated-by footer.
6. Create it with the GitHub CLI and print the link.

### feature-builder (manual)

Argument: a feature id from the product document. `C1` through `C14` for the Capitol side, `P1` through `P5` for the public side.

1. Read that feature in `docs/product/mvp-scope.md`. Restate it as three to six acceptance checks, and list what is out of scope for it.
2. Check what it depends on. If a metric or a table is missing, stop and say which skill to run first.
3. Propose a vertical slice: route, controller, data object, query, page, components, tests. Wait for approval before writing code.
4. Build in this order: the server test including the privacy cases, the back end, the page, the four view states, the simulated label.
5. Run `composer ci:check`.
6. Run the privacy-reviewer agent on the diff and resolve what it finds.
7. Update the feature's status in `docs/team/roadmap.md`.
8. Finish with the exact clicks a person should make to check the feature by hand.

### metric-builder (manual)

Argument: a metric id from `docs/engineering/metrics.md`, `M1` through `M17`.

1. Read the definition. If anything is ambiguous, ask. Do not guess.
2. Write the test first, with a hand-built fixture and the hand calculation in a comment.
3. Implement in SQL under `database/sql/metrics/` and wire it into `metrics:refresh`.
4. Read thresholds from config.
5. Add the "not available" test and, for sales, the "hidden" test.
6. Never change the definition file to match the code. If the definition looks wrong, stop and raise it.

### db-change (manual)

Argument: a description of the change.

1. Write a new migration. Never edit a merged one.
2. Update the model, casts, hidden fields, enum, factory, and seeder together.
3. Geometry columns use SRID 4326 and get a spatial index.
4. Update `docs/engineering/data-model.md` in the same change.
5. Run a fresh migrate with seed, then `metrics:refresh`, then the tests.
6. Say which summary tables are affected.

### privacy-check (Claude may run this on its own)

Description for the frontmatter: use before any commit or pull request whose diff touches controllers, data objects, exports, pages, or queries over business data.

1. Read the diff.
2. Walk the review checklist in `docs/engineering/privacy-rules.md`, rule by rule.
3. Search the diff for models passed to pages, `toArray` on models, and any read of the sales column outside the metrics refresh.
4. Run `tests/Feature/Privacy` and `tests/Arch`.
5. Report findings by rule id with file and line. Fix only when asked.

### demo-check (manual)

Purpose: prove the ten-step demo walkthrough works before recording the video and before the booth.

1. Reset the database with the seeder and refresh the metrics.
2. Build the front end assets.
3. For each of the ten steps in the product document's "Demo walkthrough", check that the route responds and the data that step needs exists: a barangay hidden by the small-group rule, an early warning flag, a wish count that increases, and so on.
4. Report pass or fail per step, with the reason for each failure.

### checklist-content (manual)

Purpose: add or update one item in the start a business guide.

1. Require from the person: the official source link and the date they checked it.
2. Write only what the source says. Never add a requirement, fee, office, or processing time from memory.
3. Fill `source_url`, `verified_on`, `verified_by`.
4. List any item whose verification is more than 60 days old.

## 5. Subagent

`.claude/agents/privacy-reviewer.md`. A read-only reviewer that has not seen the code being written, so the work does not grade itself.

- Tools: read and search only.
- Input: a diff or a list of changed files.
- Method: apply `docs/engineering/privacy-rules.md` rule by rule.
- Output: findings by rule id, each with file, line, and why it matters. If there are none, it says which rules it checked.

Check the current Claude Code documentation for the subagent file format before writing it.

## 6. Git hook

`.githooks/commit-msg`, a small POSIX shell script with LF line endings. Git for Windows runs it with its bundled shell.

- It removes generated attribution from the commit message: co-author lines that name an AI tool or a no-reply address of an AI vendor, generated-by lines, and session link trailers.
- It leaves a co-author line that names a teammate alone.
- `composer setup` points Git at it with `git config core.hooksPath .githooks`.

This is the backstop. The `attribution` setting in `.claude/settings.json` and the commit skill should already keep such lines out.

## 7. Composer scripts and Artisan commands

Extend the starter kit's scripts. Do not replace them.

- `composer setup`: first-time setup on a fresh clone. Install PHP packages, create `.env` from the example if missing, generate the app key, set the Git hooks path, start the database and wait until healthy, migrate, seed, refresh metrics, install Node packages, build assets, then run the doctor.
- `composer dev`: from the starter kit. Starts the app for development.
- `composer db:up`: start the database and wait until healthy.
- `composer db:reset`: fresh migrate, seed, and metrics refresh. Restores the demo dataset.
- `composer ci:check`: from the starter kit. The single gate before any commit.
- `composer doctor`: runs `php artisan app:doctor`.

`php artisan app:doctor` checks each item, prints pass or fail, and prints the exact fix for every failure. It must not crash when the database is down, since that is one of the things it reports.

- PHP version meets the requirement in `composer.json`
- `pdo_pgsql` and `pgsql` are loaded in the command line PHP
- Node version
- Docker is reachable and the `db` service is healthy
- The app can connect to the database
- PostGIS responds to `SELECT PostGIS_Version()`
- The test database exists
- `.env` exists and has an app key
- The Git hooks path is set
- No pending migrations
- Summary tables are not older than the newest business record

## 8. Environment keys

`.env.example` carries safe local defaults for all of these. Real secrets never go in a local `.env`. They live in GitHub Actions secrets and on the server.

- `DB_CONNECTION=pgsql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `DB_DATABASE=cagayan_business`
- `DB_USERNAME=cagayan`
- `DB_PASSWORD=secret`
- `FORWARD_DB_PORT=5432`: change this and `DB_PORT` together if another program already uses 5432
- `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD`: the seeded administrator
- `CAGAYAN_SIMULATED=true`: drives the simulated label

The test run uses `cagayan_business_test`, set in `phpunit.xml`. The starter kit's default test database is SQLite in memory, so this has to be changed.

## 9. CI

`.github/workflows/ci.yml`. Start from the workflow the starter kit ships and keep its pinned action versions.

- Runs on every pull request and every push to `main`.
- Cancels an older run when a newer commit arrives on the same branch.
- Job `checks`:
  - A service container using `postgis/postgis:17-3.5`, with a health check, and both databases available
  - PHP at the team's version with `pdo_pgsql` and `pgsql`
  - Node 22
  - Dependency caches for Composer and npm
  - Install, create `.env`, generate key, migrate, build assets
  - `composer ci:check`
- Job `conventions`, on pull requests:
  - The pull request title is a valid Conventional Commit line
  - No commit message in the pull request contains generated attribution

Branch protection on `main`, set in GitHub settings or with the GitHub CLI:

- Pull request required, one approval
- Both CI jobs must pass
- Squash merge only
- No direct pushes, no force pushes

## 10. CD

`.github/workflows/deploy.yml`. Present from day one, switched off until the server exists.

- Runs on a version tag such as `v0.3.0`, and by manual trigger.
- Skips unless the repository variable `DEPLOY_ENABLED` is `true`.
- Requires the same checks as CI to pass on that commit first.
- Connects to the server over SSH, checks out the tag, installs production PHP packages, uploads built assets, runs migrations, rebuilds the config, route, and view caches, and restarts the workers.
- Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`.

Write `docs/engineering/deployment.md` to go with it: what the server needs, how to turn deploy on, and how to roll back to the previous tag.

The video and the booth do not depend on this. Both can run from a laptop with `composer setup`.

## 11. GitHub templates

- **Pull request template:** what and why, feature or metric id, how to check it by hand, screenshots for anything visual, and a checklist: tests added, `composer ci:check` green, privacy checklist walked, simulated label present, docs updated.
- **Feature issue:** the feature id, acceptance checks, out of scope, owner.
- **Bug issue:** steps, expected, actual, screenshot.
- **CODEOWNERS:** route each area to its owner from `docs/team/team-rules.md`. `docs/engineering/metrics.md`, `docs/engineering/privacy-rules.md`, and `app/Services/Privacy/` need review from two members.

## 12. README.md

Written for a teammate on Windows who has never used Docker or PostgreSQL. Short sentences, exact commands, nothing assumed.

1. What this is, in three lines, and the simulated data notice
2. What you need: Git, PHP with the two extensions, Composer, Node 22, Docker Desktop. One line each on how to get it and how to check the version.
3. First-time setup: clone, `composer setup`, `composer dev`, open the address, log in with the demo administrator
4. Every day: pull, branch, work, `composer ci:check`, commit, pull request
5. Commands, with one line each
6. Where things are: the layout in section 1, shortened
7. Working with Claude Code: the skills and when to use each, with one example prompt per skill
8. Looking at the database: connecting with DBeaver or pgAdmin, and with QGIS to see the shapes
9. When something breaks:
   - Port 5432 is already in use
   - `could not find driver`: the extension is enabled for the web server but not for the command line. Run `php --ini` to see which file the command line loads.
   - Docker Desktop is not running
   - The PHP version is too old
   - The map is empty: boundaries are not loaded, or metrics were not refreshed
   - Then: run `composer doctor`
10. Links to every file under `docs/`
