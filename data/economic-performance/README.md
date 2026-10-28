# Economic Performance Demo

`demo.php` is an isolated, curated fixture of community wishes for the public Economic Performance page. Every wish count is synthetic. Specific-business names are fictional. Nothing is drawn from live wishes.

26-10-28: the finance fixture was removed. Government finances come from signed-off ledger figures through `stats_finance_year`, and business trends from `stats_area_year`, both read by `AnalyticsCatalogQuery` (Finance Ledger and Analytics Program, Phase 6). The finance paragraphs below describe the retired fixture and are kept for history.

## Contract and Replacement

`EconomicPerformanceQuery` maps the fixture to readonly PHP Data objects mirrored in `resources/js/types/economic-performance.ts`. The public route accepts `town`, `period`, `kind`, `financeView` and `wishView`. The response contains a bounded `datasets` catalog keyed by town code: full finance history and both `types`/`specific` wish snapshots, plus server-supplied `periods` boundaries. It is independent of the initial town/period/kind selection. Finance and wish view selections are independent. Every subsequent selection uses local Inertia history with zero application requests; the browser selects existing rows and never calculates financial metrics. Absent catalog towns are unavailable. The selected-only `state`, `townName`, `finances` and `wishes` fields have been removed; names come from town options. The obsolete prototype `topic` and `view` keys are ignored and dropped on the next navigation. All municipalities remain selectable, but only Tuguegarao City has demonstration content. The town map and dropdown select the same place without implying financial shading.

Financial metrics carry an ID, visible label, unit and accounting basis. Annual rows contain observations keyed by metric ID: state, decimal-string value, comparability, decimal-string absolute change, percentage change and comparison year. Source metadata records simulated/verified mode, label, URL and verification date. Both chart axes share the supplied maximum and peso units. Frontend work is limited to formatting and visual layout, never financial calculations.

Fixture changes are finished values, not calculations performed in the browser. The Query additionally strips values/changes for hidden or unavailable points, inserts missing calendar years, and withholds changes across gaps or non-comparable years. A zero prior value permits a supplied absolute change but no percentage. Current fixture percentages are rounded to one decimal; cents remain in exact-value tables and tooltips.

When verified figures are available, replace this Query's fixture read with verified observations and SQL-derived changes while retaining the Data contract. Keep units, accounting definitions, reference periods, comparable/restated series and source evidence explicit. Never blend simulated and verified points into an unlabeled series. Update the page's simulation flag only when its displayed data mode warrants it; this page deliberately forces the shared simulation label even if the global setting is off. Importers, history storage, revision/source tracking and source verification remain a separate phase.

## Wishes

`types` and `specific` contain stable public label IDs, curated labels and positive integer wish counts. They are separate modes; never sum them as independent respondents. Sort by count descending, then label ascending. Display an all-time snapshot dated 26-10-25 and show at most `cagayan.performance.cloud_limit` phrases in the cloud; bars and table retain all labels.

A future live pipeline must classify against approved labels, count each wish once per label, and keep raw company names, reasons and respondent identifiers private. Curated public labels do not authorize releasing residents' original submissions. Review/normalization tooling is not implemented. Word sizes are a visual encoding, not an economic prediction or proof of market demand.

## Deferred

Population census history; registered-business totals, trends and leading types; reason themes; live classification/publication review; raw-response explorers; spatial analytics; Python prediction and learning; real-time updates; document import and persistent finance history. No placeholder charts are included.


## Current Combined Presentation Correction

26-10-25 supersedes the earlier separate public modes. The fixture preserves its two source groups for traceability, while the Query returns one combined, backend-ranked snapshot with townCode/townName and namespaced IDs (`types:` / `specific:`). Original label counts are preserved; no unique-respondent total is inferred or calculated. Duplicate phrases remain distinct entries by ID. Finance returns all years; public filters are now town/period/wishView (cloud or bars). Tables and financeView/kind controls are removed. All controls still use loaded data/local history with zero application requests.

The all-time basis and explicit asOf date remain in the contract and source tooltip, not a visible caption. Bar rows wrap full labels and show exact counts; cloud omissions become count chips. Both expose actual town/count through the same tooltip. Public wish definitions and finance limitations remain documented rather than repeated as dangling paragraphs. No raw resident submissions, reasons, hashes or private business fields are exposed.
