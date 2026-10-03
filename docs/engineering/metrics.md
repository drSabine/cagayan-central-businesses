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
- On-screen note: it shows interest from the people who chose to answer, not measured demand.

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

## How each metric is tested

One Pest test per metric, in `tests/Feature/Metrics/`.

1. Build a tiny fixture by hand: two or three barangays, a handful of businesses, two to four years.
2. Work out the expected value by hand and write the working in a comment above the assertion.
3. Run `metrics:refresh`, then assert the stored value equals the hand-computed one.
4. Add one test for the "not available" case and, for anything involving sales, one for the "hidden" case.

Do not test a metric against the seeded demo data. The seeder can change. The definition cannot.
