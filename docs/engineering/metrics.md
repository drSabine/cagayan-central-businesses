# Metric Definitions

Every number on screen has one definition here, one SQL implementation, and one test. If a judge asks how a number is computed, the answer is in this file.

The plain-language definitions come from the product document. This file makes them exact enough to code and to test. Where the product document left a choice open, the choice made here is marked **Choice** and listed in `decisions.md` for the adviser to confirm.

## Building blocks

For an area `a` (a barangay, a town, or the province), a business type `t`, and a year `y`:

- `Active(a, y)`: businesses whose status in year `y` is `new` or `renewed`.
- `New(a, y)`, `Renewed(a, y)`, `NotRenewed(a, y)`, `Closed(a, y)`: businesses with that status in year `y`.
- `Sales(a, y)`: the sum of declared gross sales of businesses active in `a` in year `y`.
- `Pop(a)`: census population.
- `Y`: the latest data year. `T = Y + 1`: the outlook year.

All of these read from `stats_area_year`. A type filter, a size filter, or both narrow the same sums.

## Three states every value can be in

Code and screens must keep these apart. They are never shown as zero.

1. **A value.** Shown.
2. **Not available.** The inputs do not exist, for example a rate whose denominator is zero, or a change from a year with no data. Shown as "Not available".
3. **Hidden.** A privacy rule suppressed it. Shown as "Hidden to protect individual businesses". See `privacy-rules.md`.

## Display rounding

- Counts: whole numbers.
- Rates and shares: percent with one decimal.
- Density: one decimal.
- Specialization: two decimals.
- Money for administrators: whole pesos with separators, or millions with one decimal on charts.
- Money for the public: a band only.

## M1. Net growth

- Number: `New(a, Y) - NotRenewed(a, Y) - Closed(a, Y)`
- Percent: that number divided by `Active(a, Y - 1)`
- Not available when `Active(a, Y - 1)` is zero.

## M2. Business density

- `Active(a, Y) / Pop(a) * 1000`
- Read as registered active businesses per 1,000 residents.

## M3. Total declared sales

- `Sales(a, Y)`
- On-screen note: it measures declared business activity, not the income of residents or of the barangay government.
- Always passes through the privacy guard.

## M4. Sales per business and share of total

- Sales per business: `Sales(a, Y) / Active(a, Y)`
- Share of total: `Sales(a, Y) / Sales(parent of a, Y)`
- Both are hidden whenever `Sales(a, Y)` is hidden.

## M5. Rank and rank change

- Rank areas of the same level by the chosen measure, highest first. Ties share a rank and the next rank is skipped (1, 2, 2, 4).
- Rank change: `rank in Y - 1` minus `rank in Y`. Positive means the area moved up.
- When ranking by sales, areas with a hidden figure are listed unranked at the end.

## M6. Dominant type

- By count: the type with the largest `Active(a, t, Y)`.
- By sales: the type with the largest `Sales(a, t, Y)`, among types whose figure is not hidden.
- Ties: show all tied types.

## M7. Concentration

- By count: the dominant type's `Active` divided by the area's `Active`.
- By sales: the dominant type's `Sales` divided by the area's `Sales`. Hidden when either figure is hidden.
- On-screen note: a high value means the area depends on one kind of business.

## M8. Specialization

- `(Active(b, t, Y) / Active(b, Y)) / (Active(city, t, Y) / Active(city, Y))`
- Above 1 means the barangay has more of that type than is typical for the city.
- Shown only for types with at least 3 active businesses in the barangay, because smaller counts swing wildly. The minimum is in config.

## M9. Renewal rate

- `Renewed(a, y) / Active(a, y - 1)`
- Not available when `Active(a, y - 1)` is zero.

## M10. Survival rate

By business type, city wide. For the cohort of businesses with status `new` in year `c`:

- One-year survival: those with status `renewed` in `c + 1`, divided by the cohort size.
- Two-year survival: those with status `renewed` in both `c + 1` and `c + 2`, divided by the cohort size.
- The most recent one-year figure uses cohort `Y - 1`. The most recent two-year figure uses cohort `Y - 2`.
- Show the cohort size beside every rate. Not available when the cohort is empty.

## M11. Outlook, businesses

For barangay `b`, projecting year `T` from data up to year `Y`.

Step 1, renewal rates by type, city wide:

- `r(t, y) = Renewed(city, t, y) / Active(city, t, y - 1)`
- `r_mid(t)`: the average of `r(t, y)` over the three most recent years. **Choice.** Use two years if only two exist.
- `r_low(t)` and `r_high(t)`: the lowest and highest `r(t, y)` over all past years.
- If a type has no usable rate, use the all-types city rate.

Step 2, businesses kept:

- `Kept_mid(b) = sum over t of Active(b, t, Y) * r_mid(t)`, and the same with `r_low` and `r_high`.

Step 3, expected new registrations:

- `n_mid(b)`: the average of `New(b, y)` over the three most recent years.
- `n_low(b)` and `n_high(b)`: the lowest and highest of those three years.

Step 4, the projection:

- `businesses_mid = round(Kept_mid + n_mid)`, and the same for low and high.

One sentence for the pitch: "We take this year's businesses, apply how often each type renewed in past years, and add the usual number of new registrations."

## M12. Outlook, sales

- `s(t, y) = Sales(city, t, y) / Active(city, t, y)`: average declared sales per business of type `t`.
- `g(t)`: the average yearly growth of `s(t, y)` over the three most recent year pairs.
- `P_mid(b, t)`: projected businesses of type `t`, which is `Active(b, t, Y) * r_mid(t)` plus the average of `New(b, t, y)` over the three most recent years.
- `sales_mid(b) = sum over t of P_mid(b, t) * s(t, Y) * (1 + g(t))`
- `sales_low = sales_mid * businesses_low / businesses_mid`, and the same for high. **Choice:** the sales range follows the business range.
- Hidden whenever the barangay's current sales figure is hidden.

## M13. Backtest error

The same method, run as if standing in an earlier year, compared with what actually happened.

- Run M11 and M12 for every target year that already has real figures and at least two earlier years of rates. With data from 2020 through 2026, that is target years 2023, 2024, 2025, and 2026.
- For one barangay: the average over those target years of `abs(projected - actual) / actual`, skipping years where the actual is zero.
- For the city headline: `sum of abs(projected - actual)` divided by `sum of actual`, across all barangays and target years. This keeps tiny barangays from dominating the figure.
- Also report how often the actual value fell inside the low to high range.
- Shown beside every projection, in words: "Tested on 4 past years: off by X percent on average."
- On simulated data this shows that the method runs, not that it is accurate. Say so on screen.

## M14. Early warning

Raised for a barangay, or for a business type city wide, when either holds:

- Non-renewals rose two years in a row: `NotRenewed(Y - 2) < NotRenewed(Y - 1) < NotRenewed(Y)`, and `NotRenewed(Y)` is at least 3. The minimum is in config and stops flags on tiny counts.
- The outlook points down: `businesses_high(T) < Active(Y)`.

Each flag states which condition raised it.

## M15. Public sales band

- Take the area's total declared sales after the privacy guard.
- If hidden, the public sees the hidden message, not a band.
- Otherwise show the band that contains the total. Band edges are in config and are an open decision (O2).

## M16. Peer group and below peer average

- Peer group: barangays in the same town with the same urban or rural class.
- Peer median: the median density (M2) of the group.
- A barangay is "below peer average" when its density is lower than the peer median by more than the margin: `density < median * (1 - margin)`. The margin is in config and is an open decision (O4).
- Wording on screen is always "below peer average". Never "underperforming".

## M17. Wish count

- The number of wishes for a business type in a town.
- Shown beside `Active(town, t, Y)`, the number of such businesses already registered there.
- Meaning: expressed interest by voluntary respondents, not measured demand. Per the user correction, do not repeat this as page-description copy.

## Town figures (home page map)

Real published figures per town, not business records, so no privacy rule applies. The page shows three figures, each from the newest verified year for that town:

- **Population:** from `town_facts`, loaded from `data/towns/town-facts.csv` (`data/towns/README.md`).
- **Government Revenue and Government Expenses (M19):** the newest signed-off `performance.revenue` and `performance.expenses` in the finance ledger (D35). The response keys stay `revenue` and `expenditure`. The expenses figure is accrual total expenses, not cash disbursements or obligations.

A figure needs a verification date, or a ledger sign-off, and a source URL before publication. Unchecked or pending newer figures do not displace verified older ones.

### M18. Map shade

- On the province map, towns. On the About the Data map, the selected Cagayan town's barangays. Each set is shaded on its own.
- Places with a population are split into `towns.shades` equal-count groups by population, lowest first (`ntile`). Shade 1 is the fewest people.
- On the map every dot is the same size. The shade sets the dot color, from `--map-1` to `--map-5`.
- A place without a population has no shade.

Province population/count totals require complete town coverage in the same reference year. Missing source links are not attributed to another town’s source. City/municipal accounts are never summed and shown as the provincial government’s revenue or expenses.

## Government Finances (Approved 26-10-28)

**Status: approved by the user on 26-10-28.** A definition changes only with a human-approved doc change. See the [Finance Ledger and Analytics Program](../plan/active/26-10-27-finance-ledger-analytics-program.md) and D35.

Revenue + Economic Status is the approved information direction. Government finances sit alongside economic output, household conditions, business activity, and community interests. It is not a composite rating.

Government revenue includes local and external sources. It is not private-business sales and not GDP. Preserve source-specific labels and definitions; real GDP growth uses constant-price output, not government revenue growth. Publish a measure only at the source's supported geographic level: Cagayan Province GDP cannot stand in for Tuguegarao City or barangay GDP. See the October 24 clarification in the product scope.

COA measures describe the reporting local government, not the output or sales of private businesses. Income/revenue, expenses/expenditure, cash outflows and obligations are not interchangeable. Each line below names its source and basis. Audit opinions, audit findings and infrastructure project lists are excluded (D35).

### Sources and Years

| Source | What it contains |
| :- | :- |
| Executive Summary | COA Executive Summary PDF: financial highlights for all 29 towns |
| FS | Part 1 financial statements workbook: Statement of Financial Performance, and Statement of Comparison of Budget and Actual Amounts (SCBAA) |
| Annex | Part 4 Annexes workbook: detailed General Fund performance (Annex C-1) |

- **Fiscal years:** 2019 to 2025. Fiscal 2019 comes only from the prior-year column of the 2020 reports.
- **2026:** waits for its report. No budget or partial-year figure stands in for it.
- **Basis:** accrual actual, unless the value is marked as a final budget.
- **Precision:** exact cents in storage.

### Observation States

Every finance and business observation has one state. When it is not shown, it also has a reason. "Not available" and "Hidden" are never shown as `0`.

| State | Meaning | Shown as |
| :- | :- | :- |
| `shown` | Signed off (D35) | The value |
| `not_published` | COA published no report or workbook for that town and year | Not available; the reason is in the tooltip |
| `not_reported` | The document exists but does not contain the line | Not available; the reason is in the tooltip |
| `pending_review` | Extracted or entered, not yet signed off | Withheld everywhere except the Capitol review screen |
| `hidden` | Business privacy guard, P2 to P6 | Hidden, with the reason |

### M19. Government Revenue, Government Expenses, Surplus or Deficit

| Measure | Code | Definition and source labels |
| :- | :- | :- |
| Government Revenue | `performance.revenue` | Total revenue for the year. Executive Summary: "Income", "Total Income", "Total Revenues". FS: "Total Revenue" |
| Government Expenses | `performance.expenses` | Total expenses, including non-cash expenses and transfers to other entities. It is not cash disbursements or obligations |
| Surplus or Deficit | derived | Government Revenue minus Government Expenses, computed in SQL. The summaries' own "Net Income" is read only to check their arithmetic, not stored |

When a source label states a different definition, the figure carries a `definition_variant`. Example: "Includes Subsidy from Other Funds".

### M20. Budget Utilization

- Current Obligations ÷ Current Appropriations × 100, for the same town and year. Both come from the Executive Summary.
- Not available when either figure is missing, or when appropriations are zero.
- A low or high rate is not a judgment of performance.

### M21. Revenue by Source and Locally Generated Share

Revised 26-10-28 by user approval to a business focus. Source lines come from the FS Statement of Financial Performance:

| Revenue source | Code |
| :- | :- |
| Local Taxes | `revenue.tax` |
| National Tax Allotment Share | `revenue.national_share` |
| Fees and Business Income | `revenue.service_business` |

- **Other Revenue** is Government Revenue minus the three sources, computed in SQL. It covers grants, other national tax shares and miscellaneous income, which are not stored separately.
- **Share of a source** is the source ÷ Government Revenue × 100.
- **Locally Generated Share** is (Local Taxes + Fees and Business Income) ÷ Government Revenue × 100.
- The parser checks that every revenue line in the statement adds up to its Total Revenue, within ₱1.00, before the year's breakdown can be signed off.
- When a statement has no national share line, Local Taxes carries `definition_variant` `may_include_national_share`, and Locally Generated Share is not available for that year.

### M22. Business Taxes and Fees

From the Part 4 Annex detailed statement, General Fund only:

| Line | Code | Note |
| :- | :- | :- |
| Business Tax | `local.business_tax` | |
| Permit Fees | `local.permit_fees` | |
| Market Operations | `local.market_operations` | |
| Real Property Tax | `local.real_property_tax` | Basic tax, net of its discount |

These figures are always labeled General Fund. They are never added to, or compared with, the consolidated totals in M19 and M21. Community Tax was removed on 26-10-28.

### M23. Development Spending

From the SCBAA (budget and actual) sheet, Current Appropriations:

| Line | Code |
| :- | :- |
| Development Fund | `sector.development_fund` (the 20% Development Fund) |
| Economic Services | `sector.economic_services` (agriculture, trade, tourism and other economic offices) |

- **Value:** the sum of every actual amount (personnel, operations, capital outlay, other) listed under the heading.
- **Budget:** the sum of the final budget column is stored with basis `budget_final`.
- **Utilization** is the actual ÷ the final budget × 100. Not available when the final budget is zero.
- **Unknown headings:** the parser recognizes the other sector headings only to know where each section ends. Spending under headings outside the catalog is reported as an issue, never added to these two lines.

### M24. Spending by Sector (Withdrawn)

Withdrawn 26-10-28 by the user. Health, education, social welfare and other sector spending, per-sector capital outlay, and expense types are not stored or displayed. The SCBAA headings proved too inconsistent across towns for a reliable cross-town comparison, and they fall outside the business focus.

### M25. Per Capita

- A figure divided by the town's population in the latest census at or before the fiscal year:
  - the 2020 census for fiscal 2019 to 2023
  - the 2024 census for fiscal 2024 and 2025
- The census year is always stated.
- Not available when that census figure is not verified.

### M26. Year-over-Year Change

- **When computed:** only for consecutive fiscal years where both values are shown and share the same `definition_variant`.
- **Absolute change:** current value minus prior value.
- **Percent change:** absolute change ÷ prior value × 100, shown to one decimal. There is none when the prior value is zero.
- **Missing years:** never bridged, imputed, or carried forward.
- **Restated years:** use the restated figure. The tooltip says it was restated, and the earlier figure stays in Capitol history.
- **No rating:** an increase is not automatically an improvement, and no good or bad rating follows from a change.

### M27. Sum of Reporting Towns

- **Label:** a total across towns for one line and year is always labeled "Sum of Reporting Towns", never provincial government finances.
- **Coverage:** always stated, for example "13 of 29 towns".
- **Year-over-year change (M26):** computed only over the towns shown in both years, and that matched count is stated.
- **Comparing towns:** use the median of the reporting towns. Missing towns are listed last and unranked, as in M5.

### M28. Businesses by Industry or Focus Tag

- **Counts:** Active, New and Closed businesses per year, as defined by the `business_years` status rules.
- **Grouping:** by the Business Type's PSIC industry, or by a Focus Tag (D36).
- **Tags overlap:** one type can carry several tags, so tag counts are never added together across tags.

### M29. Declared Sales by Industry or Focus Tag

- **Value:** M3 for the group's businesses in a year.
- **Privacy guard:** always applies:
  - P2 and P3 on each group.
  - P4 across the cells of a breakdown.
  - P6 for derived change and share.
  - P7: the public sees bands only.
  - Focus Tag sales are bands for every audience, because tags overlap industries (P4, 26-10-28).
- **Label:** every view shows the "Simulated data" label.

### M30. Industry Share of Town

- **Count share:** the industry's active businesses ÷ the town's active businesses × 100.
- **Sales share:** the industry's declared sales ÷ the town's declared sales × 100. It is hidden whenever either sales figure is hidden (P6).

### M31. Business Year-over-Year Change

- **Definition:** M26 applied to M28 and M29.
- **Hidden figures:** a change derived from a hidden figure is hidden (P6).

## Config values

All thresholds live in `config/cagayan.php`, never in code or SQL literals.

- `privacy.small_group_min`: 5
- `privacy.dominance_max_share`: 0.70
- `privacy.sales_bands`: the band edges
- `peer.margin`: 0.20
- `outlook.lookback_years`: 3
- `early_warning.min_non_renewals`: 3
- `specialization.min_type_count`: 3
- `data.first_year`: 2020
- `data.latest_year`: 2026
- `towns.shades`: 5

## How each metric is tested

One Pest test per metric, in `tests/Feature/Metrics/`.

1. Build a tiny fixture by hand: two or three barangays, a handful of businesses, two to four years.
2. Work out the expected value by hand and write the working in a comment above the assertion.
3. Run `metrics:refresh`, then assert the stored value equals the hand-computed one.
4. Add one test for the "not available" case and, for anything involving sales, one for the "hidden" case.

Do not test a metric against the seeded demo data. The seeder can change. The definition cannot.

## Economic Performance Demonstration

Approved 26-10-25. This public page is a synthetic UI/data-contract demonstration, separate from town_facts and the deferred verified COA history. Fixture values and changes are finished synthetic figures; no request or frontend computes financial rates from them. The Query validates applicability: consecutive prior observation, shown values, explicit comparability and matching comparison year. Zero prior values have no percentage; missing calendar years become unavailable observations. Exact currency strings retain cents; display percentage changes to one decimal. Future verified metrics must be computed through the existing SQL summary architecture.

Government Revenue and Government Expenses use equal peso axis bounds. They are city-government accounts, not private-business sales, cash-only expenditure, GDP, prosperity or investment scores. Additional measures require explicit units and accounting basis; charts render metric IDs rather than assuming a revenue/expense object shape.

Demo wishes count approved public phrases, once per wish per label in a future live pipeline. Types and specific businesses are separate presentations and must not be summed as unique respondents. All-time reference date is 26-10-25. Larger cloud words indicate more wishes; exact counts remain in ranked bars and the equivalent table. No real wishes or raw names/reasons are read. Population and registered-business metrics remain deferred.


### Combined Public Wish Ranking Correction

26-10-25: The user approved combining curated business-type and fictional specific-business labels into one public ranking. Preserve each existing count and namespace IDs by source group. Sort count descending, label ascending, then ID ascending for ties. Do not sum type/specific counts or present their combined total as unique respondents: one submission may mention both. Tooltip geography is the actual town attached to the snapshot. Current simulated data supports Tuguegarao only; no comparative most-demanded town or measured market demand is inferred. Snapshot date and all-time basis remain metadata available through source details, rather than an automatic visible caption.
