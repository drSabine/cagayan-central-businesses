# Plan History

Read the matching plan before changing a feature. This index separates unfinished work from completed or superseded decisions so improvements can refer to the original reasoning and verification.

Dates inside plans use the requested `yy-mm-dd` format in Asia/Manila. Filenames use `yy-mm-dd-short-name.md`, using the same date in metadata and filenames.

## Active and Deferred

| Plan | Status | Scope |
| :- | :- | :- |
| [Client Facing Polishing](active/26-10-27-client-facing-polishing.md) | In progress | Local-only quick sign in with Super Admin, Admin, and Staff demo accounts; wish cloud sized by relative demand |
| [Finance Ledger and Analytics Program](active/26-10-27-finance-ledger-analytics-program.md) | Phases 1 to 3 and workbook parser implemented in kickoff | Finance UI simplification plus follow-up entry, sidebar and shared-filter corrections implemented; browser testing waived for the latest follow-up; Phases 5 to 6 remain |

## Archive

| Plan | Status | Reference |
| :- | :- | :- |
| [Government Finances and Economic Context](archive/26-10-24-government-finances-economic-context.md) | Superseded 26-10-27 | Direction, Executive Summary collection and source rules; remainder continues in the Finance Ledger and Analytics Program |
| [Census Atlas Follow-Up](archive/26-10-27-census-atlas-follow-up.md) | Completed 26-10-27 | Barangay atlas cache revisit and missing-population tooltip fixes, plus corrections to the cleanup plan's reuse claims |
| [Single Source of Truth Cleanup](archive/26-10-27-single-source-of-truth-cleanup.md) | Completed 26-10-27 | Shared frontend/backend SSOT helpers, census loader/cache consolidation, three-copy line-count tightening, and obsolete branch cleanup |
| [Compact Home and Session Handoff](archive/26-10-25-compact-home-session-handoff.md) | Completed 26-10-25 | Compact cards, UTF-8 correction, session verification and PRs #16/#17 |
| [Home Economy and Wishes](archive/26-10-25-home-economy-wishes.md) | Completed 26-10-25 | Home actions, combined wishes, scalable ranked bars, town tooltips and copy rules |
| [Local Economy Selections](archive/26-10-25-local-economy-selections.md) | Completed 26-10-25 | Zero-request local filters/maps, bounded public catalog and durable interaction rules |
| [Cagayan Economy Polish](archive/26-10-25-cagayan-economy-polish.md) | Completed 26-10-25 | Compact stacked sections, icon views, stronger grid, town map and obsolete-code cleanup |
| [Cagayan Economic Performance](archive/26-10-25-cagayan-economic-performance.md) | Completed 26-10-25 | Tuguegarao finance and curated-wishes demo; final-only tests, CI, builds and browser verification |
| [Super Admin Dashboard Foundation](archive/26-10-24-super-admin-dashboard-foundation.md) | Completed 26-10-25 | Foundation, later corrections, source verification and final checks |
| [Public Landing Page](archive/26-10-23-public-landing-page.md) | Completed before this register was created | Merged PR #15 |

## Lifecycle

- Create a record for an agreed implementation plan using [the plan-history skill](../../.claude/skills/plan-history/SKILL.md). Resume an existing matching plan when possible.
- Keep accepted scope, dated changes, primary references, and actual verification evidence together. Keep deferred work visibly deferred.
- Archive the same file when completed, cancelled, or superseded; preserve the reason and link its successor. Future improvements get a new plan referring back to it.
- Plan updates do not authorize new scope or external actions. Credentials and protected records never belong in these documents.
