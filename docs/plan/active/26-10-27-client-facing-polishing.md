---
title: "Client Facing Polishing"
created: "26-10-27"
updated: "26-10-27"
status: in-progress
branch: "feat/client-facing-polishing"
base: staging
predecessor: null
---

# Client Facing Polishing

## Objective

Make local review of the Capitol workspace faster without putting credentials in the repository. The first slice is a local-only quick sign in with one demo account per role (Super Admin, Admin, Staff). Requested 26-10-27.

## Scope and Acceptance

- [ ] The seeder creates a demo Super Admin, Admin, and Staff. Each account's name, email, and password come from `.env` only; a role with no values is skipped.
- [ ] `php artisan db:seed --class=DemoAccountSeeder` adds missing demo accounts without resetting the database.
- [ ] The hidden login page shows one button per seeded demo role, and pressing it signs in as that account and lands on `/capitol`.
- [ ] The buttons and the route that serves them exist only when `APP_ENV=local`. Any other environment gets a plain 404 and no buttons.
- [ ] A quick sign in goes through the same session setup and Activity Logs entry as a password sign in.
- [ ] The login path still does not appear in the built JavaScript (`LoginPathOutOfBundleTest`).
- [ ] No credentials in the repository: only `.env.example` defaults.
- [ ] Decision recorded in `docs/engineering/decisions.md`, startup docs updated.

## Deferred or Excluded

- Assigning towns to the demo Staff account (Staff editing is future work, D28).
- Any production or staging sign in shortcut, and any Microsoft or Google sign in (D28).
- Further client facing polishing items, which get their own entries here when requested.

## Decisions and Sources

- 26-10-27: Gate by `app()->isLocal()` checked on each request, not at route registration, so tests can exercise both states and a cached route list cannot enable it elsewhere. Reason: the shortcut bypasses the password, so it must fail closed.
- 26-10-27: Quick sign in is not rate limited. It takes no guessable input and is unreachable outside local.
- Related: D20 (discreet login), D28 (roles and sessions).

## Change History

| Date | Change | Reason / Reference |
| :- | :- | :- |
| 26-10-27 | Plan created on `feat/client-facing-polishing` from `staging` | User request |

## Verification and Handoff

Pending.
