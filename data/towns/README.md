# Town Figures

Real public figures for Cagayan's 29 towns. The Home page map shows population, revenue, and expenditure. The other measures stay in the file for later. One file, `town-facts.csv`, loaded into the `town_facts` table by `php artisan towns:import` (or `composer data:towns`). `composer db:reset` loads it too.

Prepared on October 23, 2026.

## The file

One row per town, measure, and year:

| Column | Example | Notes |
| :- | :- | :- |
| `psgc_code` | `0201529000` | Must match `data/boundaries/cagayan-municipalities.geojson` |
| `town` | `Tuguegarao City` | For people reading the file. The import ignores it |
| `measure` | `population` | One of the measures below |
| `year` | `2024` | The year the figure is for |
| `value` | `167297` | A plain number: no commas, no peso sign, no percent sign |
| `source_url` | `https://...` | Where the figure was read. Required, `https://` only |
| `checked_on` | `2026-10-23` | The date a team member checked the figure against the official release. Blank until then |

Measures:

| Measure | Unit | Years in the file |
| :- | :- | :- |
| `population` | residents | 2020 census, 2024 census (POPCEN) |
| `barangay_count` | barangays | 2020 (PSA PSGC) |
| `income_class` | 1 to 6, the DOF income class | 2024 |
| `poverty_incidence` | percent of the population | 2023 (PSA small area estimates) |
| `revenue` | pesos | 2024 |
| `expenditure` | pesos | 2024 |

## How to update

1. Add or edit rows in `town-facts.csv`. For a new census or budget year, **add** rows with the new year. Keeping the old ones keeps the history.
2. Run `composer data:towns`. It checks every row first and imports nothing if a row is wrong, listing each problem with its line number.
3. Refresh the Home page. It always uses the newest year of each measure.

The CSV is the source of truth: every import replaces the whole table with the file.

## Where the figures came from

Each `source_url` points to the original release used for that figure. The 2024 population values below were checked directly against the Cagayan tab of the PSA Region II Statistical Tables workbook:

| Measure | Original source | `source_url` |
| :- | :- | :- |
| `population` 2024 | PSA, 2024 Census of Population, Region II Statistical Tables, Cagayan tab | https://psa.gov.ph/statistics/population-and-housing/node/1684077888 |
| `population` 2020 | PSA, 2020 Census of Population and Housing, counts declared official July 2021 | https://psa.gov.ph/content/2020-census-population-and-housing-2020-cph-population-counts-declared-official-president |
| `poverty_incidence` 2023 | PSA, 2023 city and municipal poverty estimates (February 6, 2026) | https://psa.gov.ph/content/881-cities-and-municipalities-recorded-poverty-incidence-20-percent-or-lower-2023 |
| `income_class` 2024 | DOF Department Order 074-2024 (RA 11964), published by BLGF | https://blgf.gov.ph/wp-content/uploads/2025/01/DOF-DO-074.2024.pdf |
| `revenue`, `expenditure` 2024 | Each town's audited financial statements, Commission on Audit (the source Wikidata records for these values) | https://www.coa.gov.ph/reports/annual-audit-reports/aar-local-government-units/ |
| `barangay_count` | PSA PSGC page for the town | `https://psa.gov.ph/classification/psgc/barangays/<code>` |

Land area was dropped: it could not be traced to an official document, and nothing shows it.

The PSA source page and its attached workbook were opened for this check. The COA source still needs a manual review when checking town revenue and expenditure figures.

**Scope:** the Region II workbook has a separate tab for each province. Only the Cagayan tab is used. Its 28 municipalities and Tuguegarao City match the 29 Cagayan PSGC boundary codes; no Batanes records are included.

**Check:** the 29 towns add up exactly to the Cagayan total in the 2024 tab, 1,284,676. The 2020 town total remains 1,268,603.

**Not available on purpose:**
- Gattaran's revenue and expenditure (no single year was given).
- Abulug's revenue (only 2019 was given).

The page shows "Not available" for these, and the province revenue total is not shown until every town has one.

## Before the demo

The 29 town rows for 2024 population have `checked_on=2026-10-23`. Other rows remain unchecked until a team member compares them with their source.

When you check a figure, replace its `source_url` with the exact release or document if you find one, and fill in `checked_on`.
