# Cagayan Business

A map of Cagayan's registered businesses, barangay by barangay, for the Provincial Government of Cagayan.
Capitol staff log in to see business counts, trends, and area sales totals. The public explores the map, gets a start-a-business checklist, and tells the Capitol what businesses their town lacks.
The MVP covers Tuguegarao City's 49 barangays. Built for the PGC Digital Innovation Challenge 2026.

> **Simulated data.** Barangay boundaries and population are real. Every business record is simulated, and every screen that shows them says so.

## What you need

Install these once. After each one, open a **new** PowerShell window and run the check command.

| Tool | How to get it | Check |
| :- | :- | :- |
| Git | https://git-scm.com/download/win | `git --version` |
| PHP 8.3 or newer | WAMP, Laravel Herd, or https://php.new | `php -v` |
| PHP extensions `pdo_pgsql` and `pgsql` | See below | `php -m` lists both |
| Composer | https://getcomposer.org/download | `composer --version` |
| Node 22 | https://nodejs.org (the LTS installer) | `node --version` |
| Docker Desktop | https://www.docker.com/products/docker-desktop | `docker --version` |
| GitHub CLI (for pull requests) | `winget install GitHub.cli`, then `gh auth login` | `gh --version` |

**Turning on the two PHP extensions.** Run `php --ini`. It prints the "Loaded Configuration File", for example `C:\wamp64\bin\php\php8.3.14\php.ini`. Open that file in a text editor, find these two lines, and delete the `;` at the start of each:

```
;extension=pdo_pgsql
;extension=pgsql
```

Save, open a new PowerShell window, and run `php -m`. With WAMP, the command line uses `php.ini` and the web server uses a different file, `phpForApache.ini`, so this change does not affect your other WAMP projects.

**Docker Desktop** must be running whenever you work on this project. It runs only the database. Start it from the Start menu and wait until it says "Engine running".

## First-time setup

```
git clone https://github.com/drSabine/cagayan-central-businesses.git
cd cagayan-central-businesses
composer setup
```

`composer setup` installs everything, creates your `.env` file, starts the database, creates the tables, builds the front end, and ends with a health check. The first run downloads the database image and takes a few minutes. It is safe to run again.

Then start the app:

```
composer dev
```

Open http://localhost:8000 and log in as the demo administrator:

- Email: `admin@cagayan.test`
- Password: `password`

Both come from `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` in your `.env`. Press `Ctrl+C` in the terminal to stop the app.

## Every day

```
git checkout main
git pull
git checkout -b feat/c3-barangay-profile
composer db:up
composer dev
```

Work, then before committing:

```
composer ci:check
```

Commit with `/commit` in Claude Code, and open the pull request with `/open-pr`. Branch names, commit format, and review rules are in `docs/team/team-rules.md`.

## Commands

| Command | What it does |
| :- | :- |
| `composer setup` | First-time setup. Installs packages, creates `.env`, starts the database, migrates, seeds, builds, runs the doctor. |
| `composer dev` | Runs the app at http://localhost:8000 with live reload. |
| `composer ci:check` | Everything CI checks: front end format and lint, TypeScript, PHP format, static analysis, tests. Run it before every commit. |
| `composer test` | PHP format check, static analysis, and tests only. |
| `php artisan test --compact tests/Feature/PostgisTest.php` | Runs one test file. |
| `composer lint` | Fixes PHP formatting. |
| `npm run check:fix` | Fixes front end formatting and lint. |
| `composer db:up` | Starts the database and waits until it answers. |
| `composer db:reset` | Deletes all local data and rebuilds the demo dataset. |
| `php artisan metrics:refresh` | Rebuilds the summary tables every screen reads. |
| `composer doctor` | Checks your machine and the database, and prints the fix for anything wrong. |
| `docker compose stop` | Stops the database. Your data stays. |

## Where things are

```
app/                    PHP: controllers, data objects, services, Artisan commands
config/cagayan.php      Every threshold the product uses
database/               Migrations, seeders, and (soon) the metric SQL
data/boundaries/        Barangay and town shapes, with their sources
resources/js/           React: pages, components, layouts
routes/                 URLs
tests/                  Pest tests, run against PostGIS
docs/                   Product, engineering, and team documents
.claude/                Claude Code rules, skills, and the privacy reviewer
.github/                CI, deploy, and pull request templates
compose.yaml            The database (PostgreSQL 17 with PostGIS 3.5)
```

The full target layout is in `docs/engineering/repo-blueprint.md`, section 1.

## Working with Claude Code

Start Claude Code in the project folder. `CLAUDE.md` tells it how this project works. Start each task in a new session, from a skill:

| Skill | When to use it | Example |
| :- | :- | :- |
| `/feature-builder` | Build one feature from the product document | `/feature-builder C3` |
| `/metric-builder` | Build one metric from `metrics.md`, test first | `/metric-builder M1` |
| `/db-change` | Change the database schema | `/db-change add wishes table` |
| `/checklist-content` | Add or update a start-a-business guide item, with its official source | `/checklist-content barangay business clearance for a storefront` |
| `/privacy-check` | Check a change against the privacy rules before committing. Claude may also run it on its own. | `/privacy-check` |
| `/demo-check` | Prove the ten-step demo works before recording or the booth | `/demo-check` |
| `/commit` | Run the checks and make one clean commit | `/commit` |
| `/open-pr` | Push and open a pull request with the template filled in | `/open-pr C3` |

There is also a `privacy-reviewer` agent, which `/feature-builder` runs on its own. You can ask for it directly: "Run the privacy-reviewer agent on my changes."

Read the plan Claude proposes before you approve it. When Claude gets something wrong twice, add the correction to `CLAUDE.md` or to `.claude/rules/` in the same pull request.

## Looking at the database

The database runs in Docker on your laptop. Connect to it with any PostgreSQL tool:

| Setting | Value |
| :- | :- |
| Host | `127.0.0.1` |
| Port | `5432` (or `DB_PORT` in your `.env`) |
| Database | `cagayan_business` (tests use `cagayan_business_test`) |
| User | `cagayan` |
| Password | `secret` |

- **DBeaver** (https://dbeaver.io): New Database Connection, PostgreSQL, fill in the values above.
- **pgAdmin** (https://www.pgadmin.org): Register, Server, then the values above on the Connection tab.
- **QGIS** (https://qgis.org), to see the shapes on a map: in the Browser panel, right-click PostgreSQL, New Connection, fill in the values above, then drag the `barangays` or `municipalities` table onto the map. Those tables arrive with roadmap items F1 and F2.

## When something breaks

Run `composer doctor` first. It checks everything below and prints the fix.

**Port 5432 is already in use.** Another PostgreSQL is running, often a local install. Pick a free port, for example 5433, and set both lines in `.env`:

```
DB_PORT=5433
FORWARD_DB_PORT=5433
```

Then run `composer db:up`.

**`could not find driver`.** The `pdo_pgsql` extension is on for the web server but not for the command line. Run `php --ini` to see which file the command line loads, and turn the extensions on in that file (see "What you need").

**Docker Desktop is not running.** You see `failed to connect to the docker API` or `Cannot connect to the database`. Start Docker Desktop, wait for "Engine running", then run `composer db:up`.

**The PHP version is too old.** `php -v` shows 8.2 or lower. Install PHP 8.3 or newer. With WAMP, add a newer PHP and make sure the folder that comes first in your Windows `PATH` is the 8.3 one. Check again with `php -v` in a new window.

**The map is empty.** Either the boundaries are not loaded or the metrics were not refreshed. Run `composer db:reset`, which loads everything and refreshes the metrics.

**PHPStan runs out of memory.** `composer ci:check` already passes `--memory-limit=1G`. If you run PHPStan yourself, use `vendor/bin/phpstan analyse --memory-limit=1G`.

**Still stuck?** Run `composer doctor`, copy its output, and post it in the group chat.

## Setup notes for the repository owner

Do these once, after every member has pushed their first branch. **Branch protection on a private repository needs GitHub Pro, Team, or the GitHub Student Developer Pack.** With branch protection on, every change to `main` needs a pull request with one approval from someone other than its author, so turn it on only once a second member has joined the repository.

Allow squash merge only, and delete branches after merging:

```
gh repo edit drSabine/cagayan-central-businesses --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false --delete-branch-on-merge
```

Protect `main`: pull request required with one approval, both CI jobs (`checks`, `conventions`) must pass, no direct pushes, no force pushes:

```
gh api --method PUT repos/drSabine/cagayan-central-businesses/branches/main/protection --input .github/branch-protection.json
```

Check the result:

```
gh api repos/drSabine/cagayan-central-businesses/branches/main/protection
```

Then replace `@drSabine` in `.github/CODEOWNERS` with each area owner's GitHub username, and fill in the names in `docs/team/team-rules.md`.

## Documents

Product:

- [Product description and MVP scope](docs/product/mvp-scope.md)
- [Challenge guidelines](docs/product/challenge-guidelines.md)

Engineering:

- [Decisions](docs/engineering/decisions.md)
- [Data model](docs/engineering/data-model.md)
- [Metrics](docs/engineering/metrics.md)
- [Privacy rules](docs/engineering/privacy-rules.md)
- [Repository blueprint](docs/engineering/repo-blueprint.md)
- [Deployment](docs/engineering/deployment.md)

Team:

- [Team rules](docs/team/team-rules.md)
- [Roadmap](docs/team/roadmap.md)

Data:

- [Boundary files](data/boundaries/README.md)
