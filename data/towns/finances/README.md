# Government Finances

Figures read from COA reports for Cagayan's 28 municipalities and Tuguegarao City. The parser in `tools/coa/` writes most of these files (D34). `composer data:finances` (`php artisan finances:import`) loads them into the finance ledger (D35) as **pending** figures, then replays the sign-offs in `reviews.csv` and `manual-figures.csv`. Nothing is published until a person signs it off. `composer db:reset` runs the import too.

Every Executive Summary loads for all 29 towns. Workbook breakdowns load only for the towns in `cagayan.finances.workbook_towns`, Tuguegarao City since 26-10-28. The other towns' workbooks stay parsed in `extracted/` and `issues/` until their towns are added to that list. A town whose workbook is not loaded shows "The COA workbook for this year has not been added yet".

Since 26-10-28 every loaded parsed figure is signed off (`reviews.csv`, 1,094 rows): 678 are published and 416 are earlier versions superseded by a later report's restatement. See "Reliability Review, 26-10-28" below.

Definitions: `docs/engineering/metrics.md`, M19 to M27.

## Files

| File | What it holds | Written by |
| :- | :- | :- |
| `lines.csv` | The line catalog: code, label, group, source, whether it is displayed, and the source-label aliases the parser matches | People. Change it with a metric definition change |
| `documents.csv` | One row per town, fiscal year, and document kind: `available` with its file, URL, and SHA-256, or `not_published` when COA had no report on the date checked | Parser |
| `extracted/<year>.csv` | Every stored figure read from the reports and workbooks for that year, including the prior-year column | Parser |
| `issues/<year>.csv` | Every failed check, unreadable header, or missing line, with severity | Parser |
| `reviews.csv` | Sign-offs of parsed figures: the report, line, year, basis, the value signed off, `verified` or `rejected`, the date, a note | `php artisan finances:export` |
| `manual-figures.csv` | Figures entered by hand in the Capitol, with their status | `php artisan finances:export` |

The parser rewrites `documents.csv`, `extracted/` and `issues/` on every run. Do not edit them by hand. Corrections go through the Capitol review screen (Phase 3), or through `lines.csv` aliases followed by a new run.

After signing off or entering figures in the Capitol, run `php artisan finances:export` and commit `reviews.csv` and `manual-figures.csv`. Otherwise the next `composer db:reset` loses them. A sign-off applies only to the value it names: if a new parser run changes that value, the figure goes back to pending and the import prints a warning.

## extracted/<year>.csv

| Column | Meaning |
| :- | :- |
| `reported_in_year` | The report the figure was read from. The year a file is named after |
| `document_kind` | `executive_summary`, `fs_workbook` or `annex_workbook`; with the town and year it names the document in `documents.csv` |
| `fiscal_year` | The year the figure describes. A 2020 report also gives 2019 |
| `line_code` | A code from `lines.csv` |
| `basis` | `actual`, or `budget_final` for the SCBAA final budget |
| `value` | Pesos with cents, negative for a deficit |
| `definition_variant` | Set when the report's own label states a different definition. Two examples: `includes_subsidy_from_other_funds`, and `unspecified_period` when a summary says only "Appropriations" without current or continuing. Change is not computed across a variant (M26) |
| `source_label`, `location` | The label as printed, and the page or `sheet!cell`, for the reviewer |
| `document_sha256`, `extractor_version` | Which file, and which parser rules, produced the row |

## Checks

Each Executive Summary is checked on its own:

- Assets = Liabilities + Equity, within ₱1.00.
- Revenue minus Expenses = Net Income, when the report states Net Income.
- The stated change column equals current minus prior.

Each report is also compared with the previous year's report:

- A prior-year figure that differs from that report is `restated`. This is informational, and the latest report wins (D35).
- A current-year figure equal to the previous report's own figure is `repeats_previous_year`, an error. It usually means the column headers are swapped.
- **Mislabelled column headers (`header_years_swapped`, a warning, extractor version 2):** when the column headed with the report year repeats the previous report's own revenue and expenses to the cent, and the stated change column only adds up with the columns the other way round, the parser reads the columns in printed order. Both proofs are required for revenue and expenses, so a report that only prints its change as prior minus current (Abulug 2021) is never swapped. Gattaran 2024 is the only report that meets them.

Each statement workbook is checked too:

- Every revenue line in the Statement of Financial Performance adds up to its Total Revenue (`revenue_sources_mismatch`, an error).
- The workbook's revenue and expense lines are compared with the same town's Executive Summary (`differs_from_summary`, a warning). A difference often means a different definition, such as transfers counted as revenue.
- A statement with no national share line marks Local Taxes `may_include_national_share` (`national_share_not_separate`).
- A sheet titled with another year, a missing sheet, and spending under headings outside the catalog are reported too.

Only the lines in `lines.csv` outside the `checks` group are written. The `checks` lines (assets, liabilities, equity, net income, allotments, other revenue lines, expense types, other sector headings) are read for these checks and to find where sections end.

Severity tells the reviewer what to do:

| Severity | Meaning |
| :- | :- |
| `error` | The figures disagree with each other, or may be in the wrong year. Check the page before signing off |
| `warning` | Something unusual that does not change the stored values, such as a typo in the change column or a repeated header year |
| `info` | Expected source behaviour: restatements, or a change column printed as prior minus current |

## Running

```bash
composer data:finances:test
```

```bash
composer data:finances:extract
```

The first run creates `tools/coa/.venv` and installs the pinned `tools/coa/requirements.txt`. The tests read the committed PDFs. Their expected values were read from the PDFs by hand, and they include the four 2024 pairs verified against COA workbooks (`../verified-finances-2024.md`).

## Current Run, 26-10-28

Scope was trimmed to a business focus on 26-10-28 (M21 to M23). The run reads 158 Executive Summaries for 2020 to 2025 and the 17 workbook pairs in `../financial-statements/`.

Reports and workbooks containing each stored line, current year only:

| Line | Source | Reports with the line |
| :- | :- | -: |
| Government Revenue, Government Expenses | Executive Summary | 158 of 158 |
| Current Appropriations | Executive Summary | 108 |
| Current Obligations | Executive Summary | 109 |
| Local Taxes, Fees and Business Income | FS workbook | 17 of 17 |
| National Tax Allotment Share | FS workbook | 16; Enrile 2025 combines it with Local Taxes |
| Economic Services, with budget | FS workbook | 17 |
| 20% Development Fund, with budget | FS workbook | 16 |
| Business Tax, Permit Fees | Annex workbook | 15; Abulug and Allacapan 2024 have no General Fund detail |
| Real Property Tax | Annex workbook | 14 |
| Market Operations | Annex workbook | 13 |

Before the trim, the independent `pdftotext` (Xpdf) text of each PDF contained every Executive Summary value.

Notable errors:

- **Gattaran 2024:** the summary heads its columns "2024 2023" but prints 2023 first. Its first column repeats the 2023 report's own figures, and its change column (₱18,941,613.27 revenue) equals 401,727,932.51 minus 382,786,319.24. Since extractor version 2 the parser reads printed order (`header_years_swapped`), giving 2024 revenue ₱401,727,932.51 and expenses ₱408,270,884.16, which the 2025 report confirms.
- **Amulung 2025 and Rizal 2025 (`net_income_mismatch`):** they state a net income that is not revenue minus expenses. Their revenue and expenses match the PDFs to the cent, and their percent and change columns agree, so only COA's own net income line is inconsistent. Net income is not stored; Surplus or Deficit is computed from revenue and expenses (M19).
- **Santo Niño 2025 (`revenue_sources_mismatch`):** its revenue lines miss an unlabeled ₱22,392.82 row, in both years. Its workbook is not loaded yet.

Warnings cover change-column typos, repeated header years, workbook-to-summary differences, and Gattaran's 2025 budget sheet titled 2024. Counts are printed at the end of every run.

Apart from reading mislabelled columns in printed order when both proofs hold, the parser never corrects a source error. The reviewer decides.

## Reliability Review, 26-10-28

Before signing everything off, each report's current-year revenue and expenses were compared with the next year's report, which repeats them as its prior-year column (2020 to 2025 reports, all 29 towns):

| Result | Pairs |
| :- | -: |
| Same to the cent | 217 |
| Columns swapped in the later report (Gattaran 2024, now read correctly) | 2 |
| Different: a later report restated the year | 39 |
| No later report to compare | 32 |

Most restatements are under 1 percent. The largest were opened in the PDFs and are printed that way by COA, not misread: Enrile 2021 revenue (₱181.0 million, restated as ₱232.2 million in 2022), Rizal 2024 expenses, Calayan 2022 expenses, and Santa Ana 2020 revenue. The latest report wins (D35), and the screens say "Restated in the 2022 report" (M26). Aparri 2020 revenue differs by ₱0.63 between reports, a digit swap in one of COA's documents.

Reading a value correctly does not make COA's accounts correct: the figures are transcriptions of the reports, which are themselves audited with qualified opinions in many towns.
