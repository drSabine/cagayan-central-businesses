---
title: "Finance Ledger and Analytics Program"
created: "26-10-27"
updated: "26-10-28"
status: in-progress
branch: "data/coa-parser (Phase 1)"
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
| 1 Python parser for Executive Summaries | `data/coa-parser` | Done, pull request open |
| 2 Finance ledger schema and import | `feat/finance-ledger` | Not started |
| 3 Manual entry and sign-off in the Capitol | `feat/finance-review` | Not started |
| 4 Workbook collection and workbook parser | `data/coa-workbooks` | Not started; may run alongside Phase 2 |
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

- [ ] Create the `finance_lines`, `finance_documents` and `finance_figures` tables. A partial unique index allows only one verified figure per town, year, line and basis.
- [ ] `finances:import`:
  - never deletes or overwrites manual rows
  - resets a figure to pending when its value changes
- [ ] `finances:export` writes sign-offs and manual entries to committed CSVs, so they survive `composer db:reset`.
- [ ] Move revenue and expenditure out of `town_facts`. Home and the workspace map read the newest verified ledger figures, with the Data shapes unchanged.

### Phase 3: Capitol Review

- [ ] Capitol finance index, detail page, entry form and sign-off.
- [ ] Gates:
  - `finance-entry`: Staff for their assigned towns; Admin and Super Admin anywhere.
  - `finance-review`: Admin and Super Admin, never on a figure they entered themselves.
- [ ] Activity Log events carry an event code and an actor key only.

### Phase 4: Workbook Collection and Parser

- [ ] Collect the Annual Audit Report ZIPs for 29 towns, 2020 to 2025, through the browser, one file at a time.
- [ ] Read the FS and Annex workbooks, finding sheets by keyword.
- [ ] Extract three breakdowns: revenue sources, expense types and spending by sector.
- [ ] Extract Local Revenue Detail from the General Fund annex.
- [ ] Reproduce the values read during planning.

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
| C Revenue Sources | Local Taxes, National Tax Allotment Share, Other National Tax Shares, Fees and Business Income, Grants and Donations, Other Revenue, Locally Generated Share | FS, Statement of Financial Performance | Analytics |
| D Local Revenue Detail | Business Tax, Real Property Tax, Community Tax, Permit Fees, Market Operations (General Fund) | Annex C-1 | Analytics |
| E Expense Types | Personnel, Operations and Maintenance, Depreciation and Other Non-Cash, Interest and Financial Charges, Transfers to Other Entities | FS, Statement of Financial Performance | Analytics |
| F Spending by Sector | General Public Services, Education, Health, Social Welfare, Housing and Community Development, Labor and Employment, Economic Services, Development Fund, Disaster Risk Fund, Aid to Barangays, Debt Service; capital outlay and final budget for each | FS, SCBAA | Analytics |
| G Checks only | Assets, Liabilities, Equity, allotments, continuing appropriations and continuing obligations | Executive Summary | Not displayed |

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
| 26-10-28 | Phase 1 parser built. Summaries that print Appropriations, Allotments or Obligations without current or continuing map to the current line with `definition_variant` `unspecified_period`, as the catalog requires. A new `repeats_previous_year` check flags swapped columns | Found while reading all 158 summaries |

## Verification and Handoff

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
