# Kickoff Prompt: Cagayan Business

## For the person running this

Do these once, on one laptop. The other two members only clone and run `composer setup` afterward.

1. Install Git, PHP 8.3 or newer, Composer, Node 22, Docker Desktop, the GitHub CLI, and Claude Code. Start Docker Desktop.
2. Create an empty private repository on GitHub and clone it.
3. Unzip this kit into the cloned folder, so `KICKOFF_PROMPT.md`, `compose.yaml`, `docs/`, `docker/`, `data/`, and `.claude/` sit at the top level. `.claude` is a hidden folder. Check that it came across.
4. Open a terminal in that folder, start Claude Code, and type:

   `Read KICKOFF_PROMPT.md and carry it out, starting at Phase 0.`

5. Stay nearby. It stops three times to report and ask. Expect one to two hours.

Everything below this line is addressed to Claude Code.

---

## Your role

You are setting up the repository for Cagayan Business, a map-based dashboard of registered businesses for the Provincial Government of Cagayan, built by a team of three for a competition. The prototype video is due October 30, 2026.

Your job in this session is the foundation only: a working Laravel and React application connected to PostGIS, the files that make this repository good to work in with Claude Code, CI and CD, and a README that gets a teammate running. You are not building product features today. The team builds those afterward, one at a time, using the skills you create here.

A good result is one where a teammate on Windows who has never used Docker or PostgreSQL can clone the repository, run one command, and see the app, and where the next Claude Code session can build a feature correctly by reading what you leave behind.

## What you have been given

These files are already in the folder. Treat them as the source of truth and do not regenerate them.

- `docs/product/mvp-scope.md`: what the product is, every feature, and what is out of scope
- `docs/engineering/decisions.md`: the stack and why, with open decisions and their defaults
- `docs/engineering/repo-blueprint.md`: what you must create and the standard for each piece. This is your specification.
- `docs/engineering/data-model.md`: the schema
- `docs/engineering/metrics.md`: every metric, exact enough to code
- `docs/engineering/privacy-rules.md`: the rules that protect business data
- `docs/team/team-rules.md`: how the team works
- `docs/team/roadmap.md`: the schedule and the status of every feature
- `compose.yaml` and `docker/db/init/`: the database
- `data/boundaries/`: the 49 barangay shapes and the 29 town shapes, ready to load, with a README on their sources and limits. Do not download boundary data. It is already here.
- `.claude/settings.json`: permissions, and attribution switched off

## Ground rules for this session

1. **Foundation only.** No product tables beyond enabling PostGIS, no product pages, no metrics, no seeders. Those are the team's first tasks and they are listed at the end.
2. **Installed reality beats written versions.** `decisions.md` records versions checked on October 3, 2026. Use what the installer gives you today, follow the starter kit's own conventions for file names and folders, and write what you actually installed into the "Installed versions" section of `decisions.md`. Never pin a version from memory.
3. **Written product rules beat your judgment.** If a product rule, a metric, or a privacy rule looks wrong or two documents disagree, stop and ask. Do not resolve it quietly.
4. **Windows first.** The team develops on Windows. Every command you put in a script or in the README has to work in PowerShell. Write Composer scripts as arrays of single commands, with no shell operators. Do not add bash or PowerShell setup scripts.
5. **Do not edit `docs/product/`.** Those are the team's source documents.
6. **Never use `--force` with the Laravel installer on this folder.** It can wipe the folder.
7. **Commits carry no attribution.** No co-author lines, no generated-by text, no session links, in commits or pull requests.
8. **Ask only at the three stop points** unless something would be destructive or rule 3 applies. For small choices, decide, carry on, and list what you decided in the final report.
9. **Verify each phase before starting the next.** Each phase has an exit check. If it fails, fix it or stop and say what is wrong. Do not move on with a broken phase.

## Phase 0. Read and check

1. Read the eight documents listed above, starting with `decisions.md` and `repo-blueprint.md`.
2. Check the machine and note each version: Git, PHP, the loaded PHP extensions, Composer, Node, npm, Docker, Docker Compose, and the GitHub CLI. Run `php --ini` to see which configuration file the command line PHP uses.
3. Check the folder: whether it is a Git repository, what its remote is, and which of the given files are present.
4. Confirm Docker is running.

**Stop point 1.** Report in a short list: each tool, the version found, what is required, and either "ok" or the exact fix. Then ask, in one message:

- The three members' names and GitHub usernames, and which of the three areas in `team-rules.md` each one owns
- Anything in the report they need to fix before you continue

Do not continue until the PHP version, the `pdo_pgsql` and `pgsql` extensions, Composer, Node, and Docker are all in place.

## Phase 1. Database

The database comes first so the application has something to connect to.

1. Start it with `docker compose up -d --wait`.
2. If port 5432 is already taken, choose a free port and use it for both `FORWARD_DB_PORT` and `DB_PORT` later. Note this for the README.
3. Confirm both databases exist and PostGIS answers in each.

**Exit check:** `SELECT PostGIS_Version()` returns a version in `cagayan_business` and in `cagayan_business_test`.

## Phase 2. Application scaffold

1. If the `laravel` command is missing, install it with `composer global require laravel/installer`.
2. Create the application in a new empty folder outside this repository, using the command in `decisions.md`, D1, without the `--git` flag since this repository already exists. If the installer asks something the flags do not cover, pick the option closest to `decisions.md`. If it offers to run migrations, decline.
3. Move everything from that folder into this repository's top level. Keep the files you were given: `compose.yaml`, `docs/`, `docker/`, `data/`, `KICKOFF_PROMPT.md`. For `.claude/`, merge: keep the given `settings.json` and add whatever Laravel Boost created. If Boost wrote an MCP server configuration, keep it.
4. Delete the temporary folder.
5. Set the database keys in `.env` and `.env.example` as listed in `repo-blueprint.md`, section 8.
6. Point the test run at `cagayan_business_test` in `phpunit.xml`.
7. Add one migration that enables PostGIS with `CREATE EXTENSION IF NOT EXISTS postgis`.
8. Add one Pest test that proves spatial queries work on the test database: PostGIS reports a version, and a point is found inside a polygon that contains it.
9. Turn off public registration, as decided in D9, and add a test that the registration route is not available.
10. Run the migrations, build the front end, and start the app once to confirm the starter kit's pages load.
11. Fill in "Installed versions" in `decisions.md` from the lock files.

**Exit check:** the app's home page loads, and `composer ci:check` passes with the new tests running against PostGIS.

**Stop point 2.** Report what was installed, anything that differs from `decisions.md`, and the result of the exit check. Wait for a go-ahead.

## Phase 3. Project foundations

Follow `repo-blueprint.md`, sections 1, 6, 7, and 8.

1. `config/cagayan.php` with the keys listed at the end of `metrics.md`.
2. `.gitattributes` forcing LF line endings.
3. The `commit-msg` hook in `.githooks/`.
4. The `app:doctor` command with every check in the blueprint. Each failure prints its fix.
5. The `metrics:refresh` command as an empty shell that says no summary tables exist yet. The team fills it in. It exists now so `composer setup` and `composer db:reset` are complete.
6. The Composer scripts: `setup`, `db:up`, `db:reset`, `doctor`, extending what the starter kit ships.

**Exit check:** `composer doctor` passes every check. Stop the database and run it again to confirm it reports the failure clearly and does not crash. Start the database again.

## Phase 4. The Claude Code layer

Follow `repo-blueprint.md`, sections 2 through 5. Before writing skills, rules, and the subagent, check the current Claude Code documentation for their file formats. Formats change, and the blueprint describes them as of October 3, 2026.

1. `CLAUDE.md`, under 150 lines for the part you write. If Laravel Boost added its own guidelines block, keep it and place it after your sections.
2. The five rule files in `.claude/rules/`, each with a `paths:` list.
3. The eight skills in `.claude/skills/`. Write them against the real commands and real folder names in this repository as it now stands, not against the blueprint's wording.
4. The `privacy-reviewer` subagent.

Write the skills for the reader who will use them: a future Claude Code session with no memory of today. Each one should say what to read first, what order to work in, and how to know it is done. Explain the reason behind a step when the reason is not obvious, because a session that understands why will handle the cases you did not list.

**Exit check:** every skill file has valid frontmatter, and `CLAUDE.md` names only commands and paths that exist. Run each command named in `CLAUDE.md` once to prove it.

## Phase 5. GitHub

Follow `repo-blueprint.md`, sections 9 through 11.

1. `ci.yml`, built from the workflow file the starter kit shipped, keeping its pinned action versions. Remove the starter kit's original workflow if yours replaces it, so checks do not run twice.
2. `deploy.yml`, switched off behind the `DEPLOY_ENABLED` repository variable.
3. `docs/engineering/deployment.md`.
4. The pull request template, the two issue templates, and `CODEOWNERS` using the usernames from stop point 1.
5. Write the branch protection settings for `main` as GitHub CLI commands in the README's setup notes. Do not apply them yet.

**Exit check:** both workflow files parse as valid YAML, and every secret and variable they use is listed in `deployment.md`.

## Phase 6. README

Follow `repo-blueprint.md`, section 12. Replace the README that Laravel generated.

Write it for a teammate who has never used Docker or PostgreSQL. Then test it: read it from the top and run every command in it, in order, exactly as written. Fix whatever does not work as written.

**Exit check:** every command in the README ran successfully today.

## Phase 7. Prove it and hand over

1. Run `composer db:reset`, `composer ci:check`, and `composer doctor`. All three pass.
2. Create a branch named `chore/project-setup`.
3. Commit in a few logical commits, not one large one: the scaffold, the database and foundations, the Claude Code layer, CI and CD, the docs. Follow the commit format in `team-rules.md`.
4. Check the log to confirm no commit message contains attribution.

**Stop point 3.** Show the commit list and ask before pushing. On approval: push, open a pull request with the template filled in, wait for CI, and fix anything that fails until it is green. Then offer to apply the branch protection commands.

## Final report

Keep it short. The team can read the files.

1. What works now, and the one command a teammate runs after cloning
2. What differs from `decisions.md`, and why
3. The choices you made on your own
4. Anything you could not verify
5. The open decisions from `decisions.md` that the team should settle in the first week
6. The team's first tasks, below

## The team's first tasks after kickoff

Give this list to the team as written. Each is one session and one pull request.

1. Read `data/boundaries/README.md`, then check the 49 barangay codes and names against PSA's current listing and record the result under O1 in `decisions.md`.
2. `/db-change core schema: municipalities, barangays, business types, businesses, business years, wishes, record view logs, user role` (roadmap F1)
3. Load the two files in `data/boundaries/` into PostGIS with a seeder, wrapping each geometry with `ST_Multi`, and add urban or rural class and 2024 population from PSA's listing (F2)
4. Build the privacy guard and its tests from `privacy-rules.md` (F5)
5. Build the seeder to the requirements in `data-model.md` (F3)
6. `/metric-builder M1`, then M2, M3, M4, which also creates `stats_area_year` (F4)
7. Build the shared map component and the two layouts with the simulated label (F6, F7)
8. `/feature-builder C1`
