<!--
Title: one Conventional Commit line, for example `feat(capitol): add barangay profile page`.
Squash merge turns the title into the commit on main. CI checks the format.
-->

## What and why

<!-- What changed, and why. One short paragraph. -->

**Feature or metric id:** <!-- for example C3, P2, M10, F1. "none" for chores. -->

## How to check it by hand

<!-- Exact steps a teammate follows. This is not optional. -->

1. `composer db:reset`
2. `composer dev`, open http://localhost:8000/...
3. Log in as the demo administrator (or stay logged out for public pages)
4. Click ... and expect to see ...

## Screenshots

<!-- Required for anything visual. Delete this section if nothing on screen changed. -->

## Checklist

- [ ] Tests added or updated, including privacy cases if business data is touched
- [ ] `composer ci:check` is green
- [ ] Privacy checklist walked (below), or this change touches no business data
- [ ] "Simulated data" label present on every new screen or export with business records
- [ ] Loading, empty, not available, and hidden states handled
- [ ] Docs updated: `data-model.md` for schema changes, `docs/team/roadmap.md` status, `decisions.md` for new packages or decisions

### Privacy checklist

From `docs/engineering/privacy-rules.md`. Answer each one.

1. Does any new response include an admin or never-displayed field? If so, is the route behind login, and is a full record view logged?
2. Is every sales figure produced by the privacy guard?
3. Does a new filter change group sizes? If so, is there a test for the hidden case?
4. Does a new page or export carry the simulated label?
5. Was a model passed to a page anywhere?
