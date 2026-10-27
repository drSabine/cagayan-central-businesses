# Roadmap

The plan from today to the submission, and the status of every feature. Update the status lines in the same pull request that finishes the work.

Status words: `Not started`, `In progress`, `Done`.

## Dates that do not move

- **Friday, October 30, 2026:** submission by email. Abstract of at most 250 words, list of team members, adviser's name, and a prototype video of 3 to 5 minutes.
- **By November 30, 2026:** qualified teams are notified.
- **December 10, 2026:** booth and final presentation. Five minutes to present, ten minutes of questions, and a deck of 5 to 10 slides.

The prototype must be at least 50 percent functional in the video and at the booth. The MVP has 19 features, so the floor is 10 working features. The plan below reaches 12 before the video and aims for more.

The team's own target is to submit on **Thursday, October 29**, one day early.

## What the video must show

From the challenge guidelines: problem statement, proposed solution, target users, the working prototype, existing or competing solutions, team composition, and traction if any. The prototype part follows the ten-step demo walkthrough in the product document.

Other submission items to prepare alongside the build, owned by the data and content member: the abstract, the dean's recommendation letter, and the adviser's name. The email subject format is in `docs/product/challenge-guidelines.md`.

## Schedule

### Kickoff: October 3 to 4

- Repository set up (done October 3)
- All three laptops pass `composer doctor`
- Branch protection on, first pull request merged by each member
- The boundary files in `data/boundaries/` are checked against PSA's current listing for Tuguegarao City

### Week 1: October 5 to 11. Foundation

Goal: real boundaries on a map, simulated businesses in the database, one true number on screen.

- F1 Core schema: towns, barangays, business types, businesses, business years
- F2 Boundaries loaded from `data/boundaries/`, plus urban or rural class and population from PSA, for 49 barangays and all towns
- F3 Seeder with the fixed seed and the required demo cases
- F4 `metrics:refresh` filling `stats_area_year`, with M1 to M4
- F5 Privacy guard with its tests
- F6 Shared map component drawing barangays from PostGIS
- F7 Layouts for both sides, the simulated label, administrator login, public registration off

### Week 2: October 12 to 18. The core of both sides

Goal: the first five demo steps work.

- C1, C2, C3, C4 on the Capitol side
- P1, P2 on the public side
- M5, M9

### Week 3: October 19 to 25. Depth

Goal: every tier 1 feature done, tier 2 started in priority order.

- C7, C8, C12, C13
- P3, P4 with the first verified path
- M10, M17
- Then tier 2, starting with C9

### Week 4: October 26 to 30. Freeze and submit

- **Monday, October 26:** feature freeze. Only `bug/` branches merge into `staging` after this.
- Release `staging` to `main` and tag `v1.0.0` before recording.
- `/demo-check` passes on a clean clone on two laptops
- **Tuesday and Wednesday, October 27 to 28:** record and edit the video
- **Thursday, October 29:** submit
- **Friday, October 30:** spare day

### After the submission: November

- Finish tier 2
- The other two checklist paths
- Deploy the online version
- The slide deck and the answers to likely questions
- Follow up on the items under "To verify before the pitch" in the product document

## If the plan slips

Cut from the top of this list down. Never cut the privacy rules, the simulated label, or tests for metrics.

1. P5 Local snapshot
2. C6 Compare
3. C11 Peer comparison
4. C14 PDF brief, keeping CSV
5. C5 Dominance
6. C10 Early warning
7. C9 Outlook

## Feature status

### Foundation

- F1 Core schema: In progress (towns and business types done)
- F2 Boundaries and population: In progress (29 town and 820 browser barangay populations verified against the PSA 2024 workbook; database barangay populations cover Tuguegarao's 49 barangays. Reference figures are imported from `data/towns/`, but economic rows still need source verification and replacement. COA figures describe government finances, not budgets or private-business revenue. Shapes in PostGIS and urban or rural class remain)
- F3 Seeder: Not started
- F4 Metrics refresh: Not started
- F5 Privacy guard: Not started
- F6 Map component: In progress (public SVG and protected MapLibre population maps work. The PostGIS-backed business map remains unbuilt)
- F7 Layouts, label, login: Done (public shell and compact Capitol workspace, three roles, discreet login, protected sessions, and private profile)

### Tier 1: in the video

- C1 Province at a glance: Not started
- C2 Drill down: Not started
- C3 Barangay profile: Not started
- C4 Rankings and movers: Not started
- C7 Status and growth trends: Not started
- C8 Survival rate: Not started
- C12 Citizen wishes: In progress (restricted aggregate town/category page implemented for Admin/Super Admin. Comparison with registered business supply remains unbuilt)
- C13 Business directory with view log: Not started
- P1 Explore map: Not started
- P2 Business listing: Not started
- P3 I wish there was this business here: In progress (form, cooldown, edits, category/company choices, 255-character reason, and count-only background updates done. The registered count waits on F3 and F4)
- P4 Start a business guide, first path: Not started

### Tier 2: as many as time allows, in this order

- C9 Outlook with backtest: Not started
- C10 Early warning: Not started
- C5 Dominance: Not started
- C14 Filters, export, and brief: Not started
- C11 Peer comparison: Not started
- C6 Compare: Not started
- P5 Local snapshot: Not started

### Metrics

- M1 Net growth: Not started
- M2 Business density: Not started
- M3 Total declared sales: Not started
- M4 Sales per business and share: Not started
- M5 Rank and rank change: Not started
- M6 Dominant type: Not started
- M7 Concentration: Not started
- M8 Specialization: Not started
- M9 Renewal rate: Not started
- M10 Survival rate: Not started
- M11 Outlook, businesses: Not started
- M12 Outlook, sales: Not started
- M13 Backtest error: Not started
- M14 Early warning: Not started
- M15 Public sales band: Not started
- M16 Peer group: Not started
- M17 Wish count: In progress (count done. The registered count beside it waits on F4)

## Handoff for the Next Session

October 23, 2026. The user's UI corrections are recorded in `docs/engineering/design.md`, "Working on Existing Screens", and summarized in `CLAUDE.md` and `.claude/rules/frontend.md`. Read that section before proposing further public UI changes.

- Home has one shared icon style control, three measures in the main panel, a cached town/barangay explorer, Geist typography, and a muted blue slate dark theme. The shared SVG map supports both dotted and solid presentation.
- The population datasets cover Cagayan only: 29 towns and 820 barangays from the workbook's Cagayan sheet. Database barangay population currently covers Tuguegarao's 49 barangays. Browser geometry covers all 29 towns; loading PostGIS boundaries for the future business map is still F2/F6 work.
- The wish form shows Business Type first and reveals Specific Business on request. Town and map selection preserve drafts; only category counts load in the background. The registered-business count remains "Not available" until F3/F4 supplies records and metrics.
- COA revenue and expenditure rows without a `checked_on` date still require a team member's source review, as recorded in `data/towns/README.md`.
- The production and SSR builds pass with the existing Inertia sourcemap warning. Refresh a running development preview after rebuilding before checking count requests, because an old asset version can cause a discarded background response.
- Continue with a focused task and commit by concern. Do not restore removed helper copy, modals, map CTAs, legends, or duplicate controls as part of unrelated work.


## October 24 Workspace Foundation

Implemented the map-first three-role workspace with economic context, explicit barangay drill-down, private profile, restricted aggregate Community Wishes, and Super Admin Activity Logs. Existing demo business metrics and approval workflows remain unavailable, not zero. This foundation does not mark C1/C2/C3 business intelligence complete. Role management screens, Staff account management, taxonomy editing, and business requests/publication remain follow-up work. C12 has a working separate aggregate wishes page; comparison with registered supply still waits on business records/metrics. The last approved privacy rule is that Staff sees no Community Wishes and no wishes data appears on any dashboard.

## Future Phase: Historical Local Government Finances

Status: Not started. Requested October 24, 2026. This is future work, not part of the completed workspace foundation.

The user will collect COA reports for fiscal years 2021–2026. A future client-facing view will show increases and decreases in comparable local government financial measures across available years. Keep this as a separate Local Government Finances view, rather than presenting it as business revenue, resident income, measured demand, or an investment recommendation.

- Preserve original executive summaries and full Annual Audit Report archives by LGU and fiscal year. Record the official download URL, report title, publication/access dates, exact page or workbook sheet/cells, units, and audit opinion. Keep extracted observations separate from original files.
- Executive summaries provide financial highlights and audit context. Verify definitions and calculations against the full financial statements and notes before publishing a series. Do not assume Income, Revenue, Expense, Expenditure, Appropriations, Obligations, and cash flows are interchangeable.
- Use explicit measure labels such as LGU Income and LGU Expenses where those match the source. Keep private-business metrics and PSA economic/household measures distinct.
- Show the source year, absolute change, and percentage change only for comparable consecutive fiscal years. Missing years stay unavailable; a zero prior value has no percentage change. Retain restatements and the relevant audit qualifications. An increase is not automatically an improvement.
- As of October 24, 2026, fiscal year 2026 is incomplete. Collect its full-year actuals after an appropriate report is released; never substitute a budget or partial-year figure for audited annual actuals.
- City/municipal government accounts and provincial government accounts describe different reporting entities. A sum of municipal accounts must not be labeled as the provincial government's finances.
- Project and audit findings may provide dated context about infrastructure or service delivery. Preserve the report period and status wording; do not infer current completion, business profitability, or misconduct from a financial trend alone.

The supplied Tuguegarao City Executive Summary 2025 was reviewed: pages i–ii contain 2025/2024 financial highlights and increases/decreases; subsequent pages cover projects, audit opinion, findings, and recommendations. The document reports a qualified audit opinion. Its public-market finding is dated context, not a measurement of customer demand. Source verification and metric definitions are prerequisites to implementing this view. The foundation UI-copy and live-data accuracy review was completed in the subsequent foundation session; historical source collection remains deferred.

## October 24 Handoff: Direction Recorded, Implementation Deferred

The user approved Revenue + Economic Status as an information direction, without pivoting to auditing. Retain source-verified government revenue with an explicit government label alongside separate economic, household, business, and community-interest indicators. Preserve each source's geographic coverage and reference year. The full definition is in docs/product/mvp-scope.md; it does not authorize inventing a composite economic-status score.

Further document collection will take place in another session. That earlier turn was documentation only. The user subsequently authorized finishing the dashboard foundation and its outstanding UI/data reviews, recorded in docs/plan.

Outstanding work, checked against the current routes, models, migrations, and existing workspace:

- Foundation UI-copy and data-accuracy review is complete: redundant page descriptions removed, four 2024 COA fiscal pairs verified with exact source references and cents, unchecked figures withheld, and explicit Government Revenue/Government Expenses labels applied. Remaining economic indicators and COA 2021–2026 histories are deferred.
- Build account-management screens, Super Admin role changes, Staff assignment management, and editable business categories/options. Current authorization and assignment policies are foundations, not management UIs.
- Complete the business/business-year schema, records, entry/editing forms, strict field contracts, and assignment-scoped operations. No working business-record management exists yet.
- Build record publication: Staff prepares/submits; Admin/Super Admin reviews and publishes, with 1 Prepare, 2 Review, 3 Publish. This is publication, not permit processing.
- Finish PostGIS boundary loading and remaining geographic attributes; implement the business map, business directory, full-record view logging, and public business listings.
- Implement business metrics, the sales privacy guard, rankings, trends, survival, and wishes-versus-registered-supply comparisons. Existing population shading and wish counts do not constitute these features.
- Implement the verified start-a-business guide and later comparison, outlook/backtesting, early-warning, export/brief, and local-snapshot features. Deployment, clean-clone demo verification, and submission materials still need their own completion checks.

Implemented foundations are the public landing/population explorer and wishes submission flow, plus the protected workspace's map/geographic navigation, three-role access and session controls, private profile, restricted aggregate Community Wishes, and Super Admin security/account Activity Logs. Business transaction history remains unavailable until business workflows exist. Do not describe those foundations as completion of business intelligence or investment analysis.

## Foundation Completion Record

The accepted dashboard foundation, later UI corrections, source verification limits, and final checks are recorded in [the plan register](../plan/README.md). Business entry/publication, account/category-management screens and historical economic/financial series remain future phases. Runtime patch updates are isolated on `chore/security-runtime-updates`; foundation changes use `feat/capitol-workspace-foundation`, both based on staging. Public landing PR #15 is already merged; no duplicate landing PR was created.

## October 25 Public Economic Performance

Completed 26-10-25: dedicated public Tuguegarao-only synthetic Government Finances and Community Wishes page, 2021 through 2025 finance history, curated type/specific-business cloud with bars/table alternatives, and stable Laravel Data contracts. Other towns show unavailable states. See the [completed plan](../plan/archive/26-10-25-cagayan-economic-performance.md) and data/economic-performance/README.md. Final-only verification passed: 150 tests, 914 assertions, CI static checks, production/SSR builds and desktop/phone browser interactions. Partial clouds keep complete counts in bars/table; import and live review workflows remain deferred.

Explicitly deferred: Population, registered-business counts/trends and leading types, real COA history collection/import, live wish normalization/public-label review, reason themes, spatial analytics and Python predictive analysis. No placeholder charts or forecasts. The existing deferred finance-source plan remains open; this demo does not mark the broader business intelligence metrics complete.

## October 25 Economy Polish

Completed 26-10-25: compact Cagayan Economy overview with stacked finance/wishes sections, independent icon view controls using local URL history, stronger chart grid and a shared town-picker map. The obsolete topic/shared-view branches and unused navigation override were removed. See the [polish record](../plan/archive/26-10-25-cagayan-economy-polish.md). Final-only verification passed: 150 tests, 931 assertions, CI/static checks, production/SSR builds and desktop/phone interactions. No additional data collection, population/business metrics or predictive work is included.


### Economy Local Selections Completed

26-10-25: Removed repeated server visits for period, wish mode, view and town/map selection. Load the bounded public catalog once; all selections use local Inertia history. Durable no-refetch guidance is recorded in CLAUDE, engineering docs and UI skills. Access-log browser checks confirmed zero backend requests for loaded-data interactions. Final CI: 151 tests, 948 assertions; production/SSR builds passed. [Completed fix](../plan/archive/26-10-25-local-economy-selections.md). Deferred finance-source collection remains separate.


### Home Economy and Wishes Completed

26-10-25: Home now offers live town-aware wishes and Economy actions. Public wishes use a single combined curated ranking with bounded full-label bars, cloud/fallback counts and actual town tooltips. Removed public Economy tables, mode filtering, repeated disclaimers/captions and Home placeholder/protection sections. Skills and docs record the no-dangling-copy correction. CI passed with 151 tests and 951 assertions; production/SSR builds and phone/desktop/local-history checks passed. [Completed record](../plan/archive/26-10-25-home-economy-wishes.md).


### Compact Home Session Handoff

26-10-25: Final Home correction removes action-card icons/shadows, reduces padding to 16px and gaps to 12px, and uses Explore Your Town's Economy. The complete Economy session is being prepared in focused review batches; no merge or deployment is authorized. [Handoff plan](../plan/archive/26-10-25-compact-home-session-handoff.md).

Published review batches: foundation PR #16 targets staging; Economy PR #17 depends on #16 and contains this session in focused commits. Required hooks passed; remote CI and human review are pending. No merge/deployment performed.
