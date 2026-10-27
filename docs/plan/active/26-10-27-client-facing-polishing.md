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

- [x] The seeder creates a demo Super Admin, Admin, and Staff. Each account's name, email, and password come from `.env` only; a role with no values is skipped.
- [x] `php artisan db:seed --class=DemoAccountSeeder` adds missing demo accounts without resetting the database.
- [x] The hidden login page shows one button per seeded demo role, and pressing it signs in as that account and lands on `/capitol`.
- [x] The buttons and the route that serves them exist only when `APP_ENV=local`. Any other environment gets a plain 404 and no buttons.
- [x] A quick sign in goes through the same session setup and Activity Logs entry as a password sign in.
- [x] The login path still does not appear in the built JavaScript (`LoginPathOutOfBundleTest`).
- [x] No credentials in the repository: only `.env.example` defaults.
- [x] Decision recorded in `docs/engineering/decisions.md`, startup docs updated.

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
| 26-10-27 | Quick sign in built: `DemoAccountSeeder`, `DemoLoginQuery`, `SignInAsDemoAccount`, `DemoLoginController`, login page buttons, decision D33 | Acceptance checks above |

## Verification and Handoff

- Automated: `php artisan test --compact` passed (164 tests), including `DemoAccountSeederTest`, `DemoLoginTest` (each role signs in locally, 404 in production, staging, and testing, 404 for a missing, inactive, or unknown role, buttons listed only locally) and `LoginPathOutOfBundleTest` after `npm run build`.
- Frontend: `npm run check:fix`, `npm run types:check`, and `npm run build` passed.
- Manual in the built-in browser on `localhost:8000`: Staff and Super Admin buttons signed in and landed on `/capitol`; the login page rendered at 375px and desktop width. Admin was not clicked. Dark mode only; light mode and reduced motion were not checked. A console error about server rendering and Suspense appeared after sign in and was not traced to this change.
- Local setup: the existing `admin@cagayan.test` account already held Super Admin, so the local `.env` maps Super Admin to it and Admin to a new `demoadmin@cagayan.test`. This lives only in the gitignored `.env`.
- `composer ci:check` not run as a whole; its parts ran through the commit hooks and the checks above. No pull request opened.
