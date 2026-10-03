<!--
Title: one Conventional Commit line, for example `feat(capitol): add barangay profile page`.
Work pull requests go into staging and are squash merged, so the title becomes the commit on staging.
Release pull requests (staging into main) use a merge commit. CI checks the title format.
In Claude Code, /commit prints this template filled in, and /open-pr uses it.
-->

## What

<!-- What this pull request does, in one or two sentences a teammate understands without opening the code. -->

**Feature or metric:** <!-- C3, P2, M10, F1, or "none" -->
**Type:** <!-- feat / bug / data / docs / chore, or release -->
**Into:** <!-- staging for work, main only for a release from staging -->

## Why

<!-- The problem or need behind it. Link the issue, or the section of mvp-scope.md, metrics.md, or privacy-rules.md. -->

## How

<!-- The approach in 2 to 5 bullets: the main files and the decision behind each. Call out anything a reviewer might question and why you chose it. -->

-

## How to check it

<!-- Exact steps a teammate follows. Not optional. -->

1. `composer db:reset`
2. `composer dev`, open http://localhost:8000/...
3. Log in as the demo administrator, or stay logged out for public pages
4. Click ... and expect to see ...

## Impact

<!-- Write "none" where nothing changed. A reviewer reads this section first. -->

- **Database:** <!-- none / new migration / seeder changed (run composer db:reset) -->
- **Dependencies:** <!-- none / added or upgraded <package> (why, decisions.md line) -->
- **Config, env, and Docker:** <!-- none / new key in config/cagayan.php or .env.example / compose.yaml or docker/ changed -->
- **.gitignore and public files:** <!-- none / what changed and why -->
- **Business data and privacy:** <!-- none / yes, see the privacy checklist -->
- **Breaks or changes for teammates:** <!-- none / what they must change -->

## When

- **Depends on:** <!-- none / #12 must merge first -->
- **After merging, teammates run:** <!-- nothing / composer install / npm install / composer db:reset -->

## Who

- **Author:** @
- **Reviewers:** <!-- area owner; two reviewers if metrics.md, privacy-rules.md, or app/Services/Privacy/ changed -->

## Screenshots

<!-- Required for anything visual, light and dark mode. Delete this section if nothing on screen changed. -->

## Checklist

- [ ] Tests added or updated, including privacy cases if business data is touched
- [ ] `composer ci:check` is green
- [ ] Loading, empty, not available, hidden, and error states handled
- [ ] Wording and visuals follow `docs/engineering/design.md` (no em dashes, middots, or title separators, no gradients)
- [ ] "Simulated data" label on every new screen or export with business records
- [ ] Docs updated: `database.md` for schema, `decisions.md` for packages and decisions, `roadmap.md` status

### Privacy checklist

Answer each one, or write "no business data touched".

1. Does any new response include an admin or never-displayed field? If so, is the route behind login, and is a full record view logged?
2. Is every sales figure produced by the privacy guard?
3. Does a new filter change group sizes? If so, is there a test for the hidden case?
4. Does a new page or export carry the simulated label?
5. Was a model passed to a page anywhere, including shared props?
