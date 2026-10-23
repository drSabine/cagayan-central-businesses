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
- F2 Boundaries and population: In progress (town population, income class, poverty, and budgets from `data/towns/`; the `barangays` table with Tuguegarao's 2024 barangay population from `data/barangays/`. Shapes in PostGIS and urban or rural class remain)
- F3 Seeder: Not started
- F4 Metrics refresh: Not started
- F5 Privacy guard: Not started
- F6 Map component: Not started
- F7 Layouts, label, login: In progress (public shell, home page, discreet admin login, role, and gate done. Capitol layout remains)

### Tier 1: in the video

- C1 Province at a glance: Not started
- C2 Drill down: Not started
- C3 Barangay profile: Not started
- C4 Rankings and movers: Not started
- C7 Status and growth trends: Not started
- C8 Survival rate: Not started
- C12 Citizen wishes: Not started
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
