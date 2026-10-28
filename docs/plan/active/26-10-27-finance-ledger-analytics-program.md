---
title: "Finance Ledger and Analytics Program"
created: "26-10-27"
updated: "26-10-28"
status: in-progress
branch: "bug/finance-review-ui (Phase 3 corrections in kickoff)"
base: staging
predecessor: "archive/26-10-24-government-finances-economic-context.md"
---

# Finance Ledger and Analytics Program

## Objective

On 26-10-27 the user asked for a methodical, full program covering six things:

- a reliable, repeatable parser for the COA Executive Summary PDFs and audit-report workbooks
- honest handling of towns and years with no report
- government finance fields beyond total revenue and expenses: revenue sources, expense types and spending by sector
- Capitol forms where admins enter and correct COA figures
- business industries plus Focus Tags, such as Agriculture and Fishery
- a centralized, transparent analytics engine on a dedicated page for the public and the Capitol

There is no deadline pressure: "we can finish this one". This program supersedes the deferred remainder of [Government Finances and Economic Context](../archive/26-10-24-government-finances-economic-context.md).

## Phases

Each phase gets its own branch from `staging` and its own pull request.

| Phase | Branch | Status |
| :- | :- | :- |
| 0 Docs and decisions | `docs/finance-ledger-decisions` | [PR #22](https://github.com/m-njp/cagayan-central-businesses/pull/22) open |
| 1 Python parser for Executive Summaries | `data/coa-parser` | [PR #23](https://github.com/m-njp/cagayan-central-businesses/pull/23) open |
| 2 Finance ledger schema and import | `feat/finance-ledger` | [PR #24](https://github.com/m-njp/cagayan-central-businesses/pull/24) open |
| 3 Manual entry and sign-off in the Capitol | `bug/finance-review-ui` in kickoff | Implemented foundation; UI and input corrections in progress |
| 4 Workbook collection and workbook parser | `data/coa-workbooks` | Parser and the 17 existing workbooks done, pull request open; remaining collection deferred |
| 5 Industries, Focus Tags, simulated businesses, privacy guard | `feat/business-industries` | Not started |
| 6 Analytics engine and pages | `feat/analytics-engine` | Not started; needs Phases 2 to 5 |

## Scope and Acceptance

### Phase 0

- [x] Record this program and supersede the deferred finance plan.
- [x] Add decisions D34 (Python source tooling), D35 (Finance ledger) and D36 (Industries and Focus Tags).
- [x] Draft metric definitions M19 to M31 and the missing-data rules in `metrics.md`.
- [x] User approved the metric definitions and the per capita census rule (26-10-28).
- [x] Fix the contradictions found during research: finance labels, year range, and the audit opinion and project wording.

### Phase 1: Python Parser for Executive Summaries

- [x] `tools/coa/` holds a pinned `requirements.txt` (pdfplumber, openpyxl, pytest), the `coa` package and its tests. Composer runs it with `data:finances:extract` and `data:finances:test`.
- [x] `data/towns/finances/lines.csv` is the single source of truth for line codes and source-label aliases, shared by Python and PHP.
- [x] Committed outputs: `extracted/<year>.csv`, `documents.csv` and `issues/<year>.csv`, each stamped with an extractor version.
- [x] Automatic checks:
  - Assets = Liabilities + Equity.
  - Revenue minus Expenses = Net Income.
  - The stated change column matches the computed change.
  - The prior-year column matches the previous report (otherwise flagged as restated).
  - The SHA-256 matches `sources.csv`.
- [x] Reproduces the four verified 2024 pairs to the cent and passes golden fixtures for 12 layouts.
- [x] A full run over all 158 PDFs, with its counts recorded below.

### Phase 2: Finance Ledger

- [x] Create the `finance_lines`, `finance_documents` and `finance_figures` tables. A partial unique index allows only one verified figure per town, year, line and basis.
- [x] `finances:import`:
  - never deletes or overwrites manual rows
  - resets a figure to pending when its value changes
- [x] `finances:export` writes sign-offs and manual entries to committed CSVs, so they survive `composer db:reset`.
- [x] Move revenue and expenditure out of `town_facts`. Home and the workspace map read the newest verified ledger figures, with the Data shapes unchanged.

### Phase 3: Capitol Review

#### UI and Input Corrections Requested 26-10-28

Work only in `cagayan-business-kickoff`, on `bug/finance-review-ui` from the integrated preview branch. The finance folder is a preserved earlier working copy, not the active implementation.

The index answers which town/report needs review; its first screen should show a compact report list, explicit pagination and a right filter panel. The report answers which figures belong to each fiscal year and which are ready for review.

- [x] Shared pagination with previous/next, numbered pages, total pages and record range, reused by finance, Community Wishes and Activity Logs.
- [x] Central breadcrumbs in the workspace layout, including nested town/report routes; document the page contract and required use.
- [x] Compact index table and right-hand desktop filters, stacked on phones.
- [x] Fiscal-year tabs, newest first, and category groups. Switching already-loaded years uses local URL history without a request.
- [x] Source cards with official COA destinations and per-figure source provenance; remove redundant back-links from content.
- [x] Enter a Figure opens a right-hand drawer; Sign Off and Reject use separate dialogs. Rejection requires a reason; sign-off notes are optional.
- [x] Shared accessible required marker on labels, used with actual required controls.
- [x] Central input limits on server and browser; official COA HTTPS URLs only, line-appropriate basis, no negative values for the 13 stored lines, no figure year later than its report. Existing maximum is preserved.
- [x] PostGIS validation and pagination regressions, full CI, production build and desktop browser flow verification.

Audit before changes: 1,339 figures, 240 documents, 0 manual entries and 9 verified figures in the finance preview database (read-only query). There are 13 stored financial lines. Manual entry has seven submitted fields: line, fiscal year, basis, value, source kind, conditional source URL and note. Prior implementation accepted either basis for every line, negative values for all lines, any HTTPS source, and any configured year regardless of report year. Structural database constraints enforce source presence, enums, foreign keys and a single verified observation; they do not enforce all form semantics. No database reset or change to metric definitions is authorized by these UI corrections.

#### Follow-up Simplification, 26-10-28

The user's screenshot review superseded the earlier tabs, source-card strip and expanded pagination. The uniform table and concise layout below are the final accepted direction; the earlier checked items describe the first draft only.

- [x] Replace separate category tables with one aligned table and internal category rows; use Item and Amount in PHP (₱).
- [x] Put Fiscal Year in the right filter panel while retaining local history, newest-first choices and Back/Forward.
- [x] Remove the repeated report-year subtitle. Replace source cards with compact Source attribution; link the actual source/page or sheet/cell citation in each row.
- [x] Default to reading mode. Reveal checkboxes through Review Figures; show bulk actions and a selection count only for a non-empty selection.
- [x] Use quiet Previous / Page n of m / Next pagination and remove the inner width cap causing the screenshot's asymmetric empty strip.
- [x] Document the repeated unwanted patterns in design.md, frontend.md, CLAUDE.md and the path-scoped frontend rule.
- [x] Rerun the frontend checks and record verification of this simplified revision.

- [x] Capitol finance index, detail page, entry form and sign-off.
- [x] Gates:
  - `finance-entry`: Staff for their assigned towns; Admin and Super Admin anywhere.
  - `finance-review`: Admin and Super Admin, never on a figure they entered themselves.
- [x] Activity Log events carry an event code and an actor key only.

### Phase 4: Workbook Collection and Parser

- [ ] Collect the remaining Annual Audit Report ZIPs. Deferred 26-10-28 by the user to a separate session; this phase uses the 17 archives already on disk.
- [x] Read the FS and Annex workbooks, finding sheets by their content.
- [x] Extract the business-focused breakdowns: revenue sources, business taxes and fees, and development spending (trimmed 26-10-28).
- [x] Extract business taxes and fees from the General Fund annex.
- [x] Reproduce the values read during planning.

### Phase 5: Industries and Business Data

- [ ] Have the PSIC sections verified with a dated record.
- [ ] Add Focus Tags and the Business Categories page.
- [ ] Add the `businesses` and `business_years` tables, plus a simulated seed.
- [ ] Add `PrivacyGuard`.
- [ ] Implement `metrics:refresh` with `stats_area_year` and `stats_industry_year`.

### Phase 6: Analytics Engine

- [ ] Add the `AnalyticsMetric` registry.
- [ ] Add `stats_finance_year`, computed in SQL.
- [ ] Add `AnalyticsSeriesQuery` and separate public and Capitol Data objects.
- [ ] The public Economy page becomes the Analytics page; add a Capitol Analytics page.
- [ ] Every state is handled, and selections of already loaded data are local.

## Field Catalog

The catalog is the contract for the parser, the ledger, the entry form and the screens. Definitions are in [metrics.md, Government Finances](../../engineering/metrics.md#government-finances-approved-26-10-28).

| Section | Fields | Source | Shown on |
| :- | :- | :- | :- |
| A Totals | Government Revenue, Government Expenses, Surplus or Deficit | Executive Summary (all towns); FS workbook as a cross-check | Home map panel (revenue and expenses only); Analytics |
| B Budget Execution | Current Appropriations, Current Obligations, Budget Utilization | Executive Summary | Analytics |
| C Revenue Sources | Local Taxes, National Tax Allotment Share, Fees and Business Income; Other Revenue and Locally Generated Share derived | FS, Statement of Financial Performance | Analytics |
| D Business Taxes and Fees | Business Tax, Permit Fees, Market Operations, Real Property Tax (General Fund) | Annex | Analytics |
| E Development Spending | 20% Development Fund, Economic Services, with final budget and utilization | FS, SCBAA | Analytics |
| G Checks only | Assets, Liabilities, Equity, Net Income, allotments, continuing items, other revenue lines, expense types, other sector headings | Summary and workbooks | Read for arithmetic and section boundaries, never stored |

## Deferred or Excluded

The following are out of scope:

- **Audit opinions and audit findings** (user, 26-10-27): not extracted, stored or displayed.
- **Infrastructure project lists** (user, 26-10-27): not extracted, stored or displayed.
- **BIR registration seal and online posting:** a separate plan.
- **COA fiscal year 2026:** waits for its report.
- **Python predictions and the outlook:** not part of this program.
- **Other annex revenue lines:** hospital, cemetery and quarry lines are not extracted.

## Decisions and Sources

- **26-10-27, publishing:** the parser checks figures automatically, then a person signs off. Nothing publishes without sign-off. This keeps the existing verification rule ([D35](../../engineering/decisions.md#d35-finance-ledger)).
- **26-10-27, parser:** Python, run locally only. This session set up `tools/coa/` with pdfplumber and openpyxl as the recommended default ([D34](../../engineering/decisions.md#d34-python-source-tooling)).
- **26-10-27, breakdowns:** collect the audit-report workbooks for all 29 towns. Missing ones show Not available.
- **26-10-27, business grouping:** one PSIC industry per Business Type, plus admin-managed Focus Tags ([D36](../../engineering/decisions.md#d36-industries-and-focus-tags)).
- **26-10-27, manual entry:** admins can enter and correct figures through a form, sharing one ledger with parsed figures.
- **26-10-27, analytics audience:** analytics is for both the public and the Capitol, at different depth.

### Sources inspected during planning

- **Executive Summaries:** all 158 have a text layer. The labels vary, for example "Income", "Total Income (Includes Subsidy from Other Funds)" and "Total Revenues". Baggao 2021 interleaves its tables with other text.
- **Workbooks read:**
  - Tuguegarao and Abulug, 2024
  - Gattaran, Baggao and Rizal, 2025
- **What the workbooks show:**
  - Sheet names vary, for example `Performance`, `6 - Financial Performance 2024`, `Stmt of Finl Performance` and `B-1 (Consolidated SFPerf)`.
  - Sector headings vary.
  - Gattaran's 2025 SCBAA sheet carries a 2024 title.

## Change History

| Date | Change | Reason / Reference |
| :- | :- | :- |
| 26-10-27 | Program recorded and Phase 0 documentation drafted | User approved the umbrella plan after two rounds of questions |
| 26-10-27 | Audit opinions and infrastructure projects excluded | User correction during plan review |
| 26-10-28 | Metric definitions M19 to M31 approved; Phases 1 and 2 authorized | User approval |
| 26-10-28 | Scope trimmed to a business focus by the user. Expense types, health, education, social welfare and other sector spending, per-sector capital outlay, Community Tax, and stored assets, liabilities, net income and allotments are dropped. M21 to M23 were revised and M24 withdrawn. Remaining ZIP collection deferred; Phase 4 uses the 17 archives on disk | User review of the workbook results |
| 26-10-28 | Phase 2 ledger built with three changes to the column plan. Review columns are `reviewed_by` and `reviewed_on`, because rejections need them too. The report year comes from `finance_document_id`, not a separate `reported_in_year` column. A nullable `source_url` lets a manual figure cite a report that is not in `documents.csv`. A check constraint requires a document or a URL | Found while building |
| 26-10-28 | Phase 1 parser built. Summaries that print Appropriations, Allotments or Obligations without current or continuing map to the current line with `definition_variant` `unspecified_period`, as the catalog requires. A new `repeats_previous_year` check flags swapped columns | Found while reading all 158 summaries |

## Verification and Handoff

### Phase 3 UI and Input Verification, 26-10-28

- All changes are in `cagayan-business-kickoff` on `bug/finance-review-ui`; the older finance checkout is unchanged. The original phase status was stale and has been corrected. No new dependency, schema change or database reset.
- Final `composer ci:check` passed: frontend format/lint, TypeScript, Pint, PHPStan (0 errors), and 224 tests with 1,343 assertions. All database tests use `cagayan_business_test` on PostGIS. `npm run build` passed with existing bundle-size warnings.
- Added regressions for exact amount limits and digit count, decimals/scientific notation, report/fiscal-year ordering, line-specific basis, note length, unofficial/lookalike/credential-bearing sources, malicious line input, pagination links/metadata, manual source provenance, and manual CSV bypasses. The unofficial-source test failed when the URL rule was disabled only inside a test process; the rule was immediately restored and final checks passed.
- Browser on port 8000: index pagination and Page 2 breadcrumbs; town/report breadcrumbs; fiscal-year selector and Back restoring 2025 from 2024; one report table; no checkboxes in reading mode; no bulk actions with empty selection; Sign Off opens an optional note and Reject a required reason; Cancel restores focus. No finance entry or review was submitted during these browser checks.
- The simplified revision was visually checked in light and dark at a 1,210px browser width. DOM bounds confirm the filter's right edge is 24px inside the workspace edge, matching its gutter instead of leaving the old asymmetric strip. The final narrow-phone revision has not been visually rechecked.
- The first draft's fiscal-year tabs, source cards and verbose pagination are explicitly superseded by Follow-up Simplification above. Shared usage and the recurring unwanted patterns are documented in frontend.md, design.md, CLAUDE.md and `.claude/rules/frontend.md`. No UI correction is treated as permission to alter metric definitions or source data.

Phase 0 is documentation only. No application code, data or database changed, so no tests or builds were run. Relative links and anchors in the changed docs were checked.

### Phase 1 Verification, 26-10-28

- **Parser tests:** `composer data:finances:test` passed, 46 tests.
  - The tests cover 12 layouts, with expected values read from the PDFs by hand.
  - They reproduce the four verified 2024 pairs to the cent.
  - They also cover variants, a repeated header year, a reversed change column, swapped-column detection, and the Rizal 2025 source net income mismatch.
- **Full run:** `composer data:finances:extract` read all 158 summaries, 2,440 figures.
  - Assets, Liabilities, Equity, Government Revenue and Government Expenses were found in all 158.
  - Net Income was found in 61, Current Appropriations in 108, and Current Obligations in 109. The others do not print these lines.
- **Independent check:** every extracted value appears in Xpdf `pdftotext -raw` text of the same PDF. That confirms the digits, not their rows. The arithmetic checks and layout tests cover rows.
- **Issues recorded:**
  - 10 errors: Gattaran 2024 swapped columns, and Amulung 2025 and Rizal 2025 source net income.
  - 7 warnings.
  - 92 informational: restatements and reversed change signs.
  - Details are in `data/towns/finances/README.md`.
- **Doctor:** `composer doctor` reports the optional parser venv state without failing.

### Phase 2 Verification, 26-10-28

- **Schema:** two new migrations.
  - `create_finance_ledger_tables`
  - `move_government_finances_out_of_town_facts`: deletes revenue and expenditure rows and narrows the `town_facts.measure` check
- **Tests:** `php artisan test --compact` passed 168 tests, including 15 new ledger tests in `tests/Feature/Finances/`. They cover:
  - all-or-nothing validation
  - pending by default
  - a sign-off publishing with its report link
  - a changed value returning to pending
  - manual rows surviving a re-import
  - the latest report winning whatever the review order
  - an export and re-import round trip
  - the committed data publishing exactly the four checked 2024 pairs
  - self-sign-off refused
  - the one-verified index
- **Static checks:** PHPStan and Pint are clean.
- **Clean rebuild:** the steps of `composer db:reset` (migrate, seed and `metrics:refresh`) were run on a separate `cagayan_business_finance` database, so the shared dev database was untouched.
  - The import loaded 174 documents and 2,440 parsed figures: 8 verified and 2,432 pending.
  - The Home atlas shows exactly the four previous towns, with the same values to the cent.
  - `finances:export` reproduces `reviews.csv`.
- **Known pre-existing issue:** the demo-admin seed fails on `users.public_id`, because the seeder runs without model events. It is unrelated to this phase and was flagged as a separate task. The rebuild above ran with the demo-admin email blank.
- **Not run:** the shared dev database was not migrated, because the other checkout uses it. Teammates run `composer db:reset` after merging.

### Phase 4 Verification, 26-10-28

- **Scope:** the user approved committing the workbooks and using only the 17 archives already on disk.
  - Those are Abulug, Alcala, Allacapan and Tuguegarao for 2024, and 13 towns for 2025.
  - A browser collection of the remaining ZIPs was started by mistake and stopped at the user's request. Two files reached the user's Downloads folder and were left for the user to delete.
  - Collecting the rest is deferred to a separate session.
- **Workbook files:** `python tools/coa/run.py add-workbooks` copied 34 workbooks (5.9 MB) into `data/towns/financial-statements/`. Each copy has its checksum and the ZIP's checksum.
  - Abulug's ZIP checksum matches the one recorded at the 2024 verification.
- **Scope trim:** the user approved trimming to a business focus.
  - M21 to M23 were revised and M24 was withdrawn.
  - 13 stored lines remain. Other lines are read for checks only.
- **Parser tests:** `composer data:finances:test` passed 57 tests.
  - 11 of them cover the workbooks, with values read from the cells by hand.
  - They include hand-added sector totals and a General Fund column inside a multi-fund annex.
- **Ledger tests:** `php artisan test --compact tests/Feature/Finances` passed 15 tests after adding the `document_kind` column and the `annex_workbook` kind migration.
- **Import:** `finances:import` loaded 240 documents and 1,339 stored figures. The 8 verified sign-offs survive.

### Workspace Controls Follow-up "26-10-28"

User correction supersedes the entry button in the page header, required entry note, ghost review/cancel controls and shared greeting row. Entry now starts from the fiscal-filter panel. The drawer orders Year, Item, Basis, Amount and Source Report, uses contextual help and required markers, and sends no note. The server prohibits submitted entry notes; existing imported notes and separate review reasons are preserved. Activity Logs and Community Wishes move existing filters to the right without adding sorting behavior. Profile removes the character caption and marks Display Name required. Compact grouped navigation puts Profile and Sign Out in a bottom account dropdown; destination permissions and breadcrumbs share the existing navigation registry. The finance icon is a peso sign. Session activity and expiry warnings remain active.

Browser testing is explicitly excluded by the user for this follow-up. Automated verification results are recorded below once complete. No shared development database reset is authorized or performed.

Follow-up verification "26-10-28": `composer ci:check` passed with 223 tests and 1,342 assertions on PostGIS `cagayan_business_test`. The updated entry test asserts a stored null note; an unsolicited entry note is rejected, and rejection-reason tests remain intact. Frontend formatting/lint, TypeScript and production build passed. Source review checked shared controls, required markers, permissions, logout route method and preserved session expiry/renewal logic. No browser verification was performed, as requested. No shared development database reset, commit, merge or deployment was performed.

Bottom-bar correction "26-10-28": replaced the name/role block with a single-row Account dropdown trigger, aligned beside the appearance toggle. Profile and Sign Out remain in the menu. This supersedes showing identity details in the sidebar. Tests and browser checks were skipped for this small follow-up at the user's request.

Report-year navigation correction "26-10-28": Government Finances index now answers which towns need review in the selected report year. Available authorized years appear newest first, defaulting to the newest; rows never combine years. Removed the Report Year dropdown and redundant table column. Town/status and pagination preserve the active year. Returning to a loaded first-page selection uses local Inertia history; unrequested selections fetch missing data. This supersedes the aggregated index with a year dropdown. Automated tests and browser testing remain skipped as requested; frontend compilation checks are recorded separately.

Year-tab verification "26-10-28": frontend format/lint, TypeScript and production build passed; the changed PHP query passed syntax checking. No automated test suite or browser checks were run for this follow-up.
