# Government Finances

Figures read from COA reports for Cagayan's 28 municipalities and Tuguegarao City. The parser in `tools/coa/` writes these files (D34). The finance ledger import (D35, Phase 2 of the [program](../../../docs/plan/active/26-10-27-finance-ledger-analytics-program.md)) loads them as **pending** figures. Nothing here is published until a person signs it off.

Definitions: `docs/engineering/metrics.md`, M19 to M27.

## Files

| File | What it holds | Written by |
| :- | :- | :- |
| `lines.csv` | The line catalog: code, label, group, source, whether it is displayed, and the source-label aliases the parser matches | People. Change it with a metric definition change |
| `documents.csv` | One row per town, fiscal year, and document kind: `available` with its file, URL, and SHA-256, or `not_published` when COA had no report on the date checked | Parser |
| `extracted/<year>.csv` | Every figure read from the reports published for that year, including the prior-year column | Parser |
| `issues/<year>.csv` | Every failed check, unreadable header, or missing line, with severity | Parser |

The parser rewrites `documents.csv`, `extracted/` and `issues/` on every run. Do not edit them by hand. Corrections go through the Capitol review screen (Phase 3), or through `lines.csv` aliases followed by a new run.

## extracted/<year>.csv

| Column | Meaning |
| :- | :- |
| `reported_in_year` | The report the figure was read from. The year a file is named after |
| `fiscal_year` | The year the figure describes. A 2020 report also gives 2019 |
| `line_code` | A code from `lines.csv` |
| `basis` | `actual`. Workbook budget columns will use `budget_final` |
| `value` | Pesos with cents, negative for a deficit |
| `definition_variant` | Set when the report's own label states a different definition. Two examples: `includes_subsidy_from_other_funds`, and `unspecified_period` when a summary says only "Appropriations" without current or continuing. Change is not computed across a variant (M26) |
| `source_label`, `location` | The label as printed, and the page, for the reviewer |
| `document_sha256`, `extractor_version` | Which file, and which parser rules, produced the row |

## Checks

Each Executive Summary is checked on its own:

- Assets = Liabilities + Equity, within ₱1.00.
- Revenue minus Expenses = Net Income, when the report states Net Income.
- The stated change column equals current minus prior.

Each report is also compared with the previous year's report:

- A prior-year figure that differs from that report is `restated`. This is informational, and the latest report wins (D35).
- A current-year figure equal to the previous report's own figure is `repeats_previous_year`, an error. It usually means the column headers are swapped.

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

## First Run, 26-10-28

Read 158 Executive Summaries for 2020 to 2025, producing 2,440 figures. Fiscal years 2019 to 2025 are covered.

Assets, Liabilities, Equity, Government Revenue and Government Expenses were read from all 158 reports. Some lines are not in every summary, so they are `not_reported`, not missing data:

| Line | Reports that state it |
| :- | :- |
| Net Income | 61 |
| Current Appropriations | 108 |
| Current Obligations | 109 |

The independent `pdftotext` (Xpdf) text of each PDF contains all 2,440 values.

| Kind | Count | Notes |
| :- | -: | :- |
| `net_income_mismatch` errors | 4 | Amulung 2025 and Rizal 2025 state a net income that is not revenue minus expenses |
| `repeats_previous_year` errors | 6 | Gattaran 2024: its 2024 column repeats the 2023 report's own 2023 figures, and the 2025 report gives 2024 as ₱976.0 million against the ₱917.9 million printed as 2024. The columns look swapped |
| Warnings | 7 | Change-column typos, such as Iguig 2020 "24,421.037.77", and two reports whose two columns are both labeled with the same year |
| Informational | 92 | Mostly cent-level restatements |

The parser never corrects a source error. The reviewer decides.
