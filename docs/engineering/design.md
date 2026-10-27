# Design System

How screens look, read, and behave. Read this before building or changing any page, and start the work with `/ui-builder`. For code structure, see `frontend.md`.

The short version: **calm, exact, and readable by any citizen.** Sans for words, mono for numbers. Square corners. Dots for data. One hue for values, brass for a choice. Nothing decorative.

## Principles

1. **Start from the user's question.** A planner asks "where are businesses closing?" A resident asks "how many people live in my town?" Every screen answers one question, and the answer is the first thing on it.
2. **Exact over pretty.** Clear numbers, plain labels, obvious next steps. Every figure has a year and a source.
3. **Fast to read.** Short labels, aligned numbers, one idea per block.
4. **Honest.** Simulated data says so. Hidden figures say why. A missing figure reads "Not available", never `0`.
5. **Government grade.** The page must feel trustworthy to a mayor and usable by a first-time phone user. Calm type, high contrast, no tricks.
6. **Two audiences, two densities.** Capitol screens are dense and built for laptops. Public screens are simple and built for phones first.

## Working on Existing Screens

These rules record the user's corrections from the public map and wish form work. Apply them before proposing or implementing another UI change. The latest explicit correction takes precedence over earlier examples or historical decisions.

### Preserve the Requested Structure

- Read `CLAUDE.md`, the relevant skill, and the area docs before editing. Inspect the current page and its shared components first.
- Make the requested change within the existing layout. Moving information from a modal into a panel does not authorize a panel redesign, additional measures, a legend, or new instructions.
- Keep related controls and content in one coherent surface. The wish form and its map share one card; the map must not sit on an unrelated blank canvas.
- Fit additions within the existing section. About the Data must not grow into or overlap its neighboring content. Keep long option lists scrollable through the shared Select primitive.
- Use the available map area deliberately. Avoid large empty padding below the map. Keep the Cagayan islands in view when changing framing or scale.
- Reuse shared components and tokens. One shared map style preference and one icon control serve both Home maps; do not repeat equivalent controls in each section.

### Remove Dangling and Repeated Copy

Every visible sentence must add information needed to understand the data, complete an action, or recover from an error. A sentence that restates a heading, field, placeholder, or button should be removed.

- Do not place descriptions below page titles. Preserve field limits, validation errors, and recovery feedback where they are needed to complete the task.
- Do not add isolated statistics, badges, captions, instructions, or marketing lines merely to fill space. The removed town/dashboard statistics, "Open Now", suggestion totals, and numbered form walkthrough must stay removed unless explicitly requested again.
- Do not explain obvious controls with "Click a town to pick it", double-click instructions, or "Hold Ctrl" copy. Keep keyboard support in the interaction itself and documentation.
- Do not add repeated account/privacy assurances beneath the form or headings. Privacy definitions belong in the documented policy; the user removed the Home protection section on 26-10-25. Do not recreate that section or scatter its text across cards.
- Do not append company examples as helper paragraphs. A concise placeholder is enough. Keep the removed "Have a specific business in mind?" and "Wish for a favorite like..." descriptions out of the interface.
- Prefer one concise action, such as the Specify a Business reveal control, to a paragraph explaining the field.
- Use an underline for text links. Do not append decorative arrows.
- Use formal, factual language for About the Data, source attribution, privacy explanations, and the footer. Do not invent legal assurances, affiliations, seals, or guarantees.

### Keep the Approved Public Map Scope

- Home's details panel shows Population, Revenue, and Expenditure with their relevant years and sources. Do not reintroduce barangay count, income class, poverty incidence, or unrelated source links.
- Show province population context once as "Cagayan Province (as of 2024)". Do not add another detached population-year caption in About the Data.
- The main panel uses "Source" on its own line, followed by one source link per line. The compact barangay explorer uses one inline Source row with the PSA link.
- Use the supplied [PSA 2024 release](https://psa.gov.ph/statistics/population-and-housing/node/1684077888) for population links. Boundary provenance belongs in the data READMEs; a population workbook does not supply boundary shapes.
- Geographic scope is Cagayan Province: 28 municipalities and Tuguegarao City. Batanes is outside this scope.
- About the Data selects a town and displays its barangay boundaries and populations. Do not restore the extra barangay dropdown, duplicated style switch, population legend, or helper paragraphs.
- A single click or keyboard activation selects a place. The details stay in the panel; do not restore More Details, its modal, or Suggest a Business Here on the map.
- Keep Geist for readable words and Geist Mono for numbers and compact data labels. Dark surfaces use muted blue slate that complements the map's blue, with readable foregrounds and field borders. Avoid a near-black base or an unrelated neutral charcoal palette.

### Build Forms Around the Task

- Town is required. Business Type is the default visible choice. Reveal Specific Business only when the user activates "Not on the List? Specify a Business", or when editing a wish that already contains a company name.
- Accept a business type, a specific business, or both. Do not silently make both required or make the reveal control submit the form.
- Label the reason as a direct question about why the business is wished for in the area. Enforce the 255-character limit in both the input and server validation.
- Use "Send Your Wishes" for a new submission and retain a clear back icon on the separate page.
- Selecting a town in the dropdown or map must preserve entered text, focus where practical, and scroll position. Do not request the entire form payload to update a count.
- Update only the count in the background when the selection supports it. Skip unchanged selections, reuse cached counts, cancel superseded requests, and handle failures without replacing the form with a loading state.

### Validate the Result and Leave a Clear Handoff

- Review the diff against the actual request and the removals above. A deleted feature is not permission to recreate it under a different label.
- Check desktop and phone layouts, both appearances, keyboard operation, source links, and section spacing. Check that map and dropdown selections agree and that drafts survive changes.
- For frontend changes, run format/lint, TypeScript, and the production build. Lint alone does not catch an undefined helper such as the earlier `formatCount` SSR failure. Run affected regression tests for behavior changes and the full required checks before pushing.
- After rebuilding while the development preview is open, refresh the preview before the final interaction check so an old Inertia asset version is not mistaken for a new application defect.
- Delete code only after tracing imports, lazy imports, page resolution, routes, and remaining callers. Remove redundant imports and props with the obsolete component. Preserve source datasets still used by importers or tests.
- Keep commits focused by concern. Record the final behavior and any remaining limitation in the docs and PR; do not leave decisions only in chat.

## Tokens

All tokens are CSS variables in `resources/css/app.css`, exposed as Tailwind classes through its `@theme` block. Components use the classes, never raw values. To change the look, change a token, never a page.

### Color

| Token | Classes | Use |
| :- | :- | :- |
| `--background`, `--foreground` | `bg-background`, `text-foreground` | The page and its text |
| `--card`, `--muted`, `--accent`, `--border` | `bg-card`, `bg-muted`, `bg-accent`, `border` | Surfaces, quiet blocks, hover, hairlines |
| `--muted-foreground` | `text-muted-foreground` | Labels, years, notes |
| `--primary` | `bg-primary`, `text-primary` | The one primary button per area, links in focus |
| `--brand` | `bg-brand` | River ink surface: the Home hero and the login panel. Dark in both modes |
| `--highlight` | `fill-highlight`, `bg-highlight` | Brass. A chosen or connected place, the current nav item. Markers only |
| `--map-1` to `--map-5` | `fill-map-*`, `bg-map-*` | Value scale, low to high, one hue. Every step stays visible as a dot on the background |
| `--map-none` | `fill-map-none` | No value: "Not available" |
| `--water` | `fill-water` | Sea dots around the province map. Geography, so always quieter than the map scale |
| `--status-*` | `*-status-new`, `*-status-renewed`, `*-status-not-renewed`, `*-status-closed` | Business status |
| `--chart-1` to `--chart-5` | `*-chart-*` | Other categories in charts |

Hue is kept for data. Only the map scale, statuses, and charts carry color. A colored thing always means something, and color is never the only signal (pair it with a label or dot size).

Dark mode uses muted blue slate surfaces in the same hue family as the river ink map. The base stays lighter than the original near-black theme. Cards, popovers, and hover surfaces step progressively lighter, with visible field borders and light text. The map keeps its river ink blue surface in both appearances.

### Type

Two families, both open-license and self-hosted from `resources/fonts/` (works offline at the booth):

- **Geist** (`font-sans`): every word people read. Titles, headings, body, buttons.
- **Geist Mono** (`font-mono`): numbers, labels, codes, legends, years, sources, the top line. It says "this is data".

| Role | Class | Font and size | Example |
| :- | :- | :- | :- |
| Display | `type-display` | Sans semibold, 4xl to 6xl | See How Cagayan Lives and Works |
| Page title | `type-title` | Sans semibold, 3xl to 4xl | Suggest a Business |
| Section heading | `type-heading` | Sans semibold, xl to 2xl | How Businesses Are Protected |
| Subtitle | `type-subtitle` | Sans, base to lg, muted | Context only when needed |
| Figure | `type-figure` | Mono medium, 3xl to 4xl, `tabular-nums` | 1,284,676 |
| Label | `type-label` | Mono medium, xs, uppercase, tracked | POPULATION |
| Lead | `type-lead` | Sans, base | Protection points |
| Item | `type-item` | Sans medium, base | Business Map |
| Body | `type-body` | Sans, sm | Descriptions, controls |
| Meta | `type-meta` | Sans, sm, muted | Footer, notes |
| Pin | `type-pin` | Sans medium, xs | 38 |

Use the roles, never raw size and weight classes. They are named `type-*` so `cn()` never mistakes them for a text color.

### Space

| Token | Classes | Use |
| :- | :- | :- |
| `--spacing-section` (3rem) | `gap-section`, `pb-section` | Between page sections |
| `--spacing-gutter` (1rem) | `px-gutter` | Page edge on phones. `md:px-6` from `md` |

Inside a section: `gap-3` for a row of controls, `gap-4` for cards in a group, `gap-6` between a heading and its content.

### Shape

- `--radius` is **2px**. Every `rounded-*` step resolves to 2px (`rounded-xs` is 1px). Controls, cards, sheets, and surfaces all look nearly square.
- `rounded-full` only for dots, avatars, and round icon buttons.
- Hairlines (`border`, `divide-y`) separate things. Shadows stay as shadcn ships them.

### Motion

| Token | Class | Use |
| :- | :- | :- |
| `--ease-out-soft` | `ease-out-soft` | The one easing |
| `--duration-quick` (150ms) | `duration-(--duration-quick)` | Hover color |
| `--duration-base` (250ms) | `duration-(--duration-base)` | Dim, lift, fade |
| `--duration-slow` (600ms) | `duration-(--duration-slow)` | Entrances |
| `animate-rise`, `animate-fade`, `animate-nudge`, `reveal` | | Entrance, map fade, the scroll cue, sections rising into view |

Everything that moves sits behind `motion-safe:` or `motion-reduce:transition-none`.

### Halftone

The default map treatment is taken from print. **Dots carry data, never decoration.** A solid-fill view uses the same boundaries, population shades, selection color, tooltips, and loading sequence. One icon-only toggle beside the main town selector controls both Home maps; the preference is shared and remembered in the browser. Each icon has an accessible name and a title.

- Constants live in `resources/js/lib/halftone.ts`: `DOT_STEP` (6 map units between dots), `DOT_RADIUS` (one size for every dot), `DOT_FILL` (the `fill-map-*` class per shade, index 0 is "no value").
- **Every dot is the same size. Color depth carries the value:** a deeper shade means more. Size never changes, so small towns stay as visible as big ones.
- All shapes share one grid, so dots line up across borders like a printed page.
- **Borders always show** as a thin line in the parent's color (45 percent), so every town and barangay reads as its own place. Hover or a choice makes the line full strength.
- **Water** (`water` on `ProvinceMap`): smaller `fill-water` dots on the same grid, only where the coast meets the sea (north of the mainland and around the islands, east of the northeast coast), in a band a few dots wide. Neighboring provinces stay empty. Drawn as one path by `seaPath()`.
- Dots are SVG circles. Never a CSS `radial-gradient` (gradients are banned) and never a dotted background pattern.

## Writing

Every word in the UI: titles, headings, labels, buttons, toasts, empty states, exports.

### Capitalization

- **Title Case** for page titles, section headings, card titles, buttons, tabs, menu and nav items, badges, form field labels, legend titles, and table headers: "How Businesses Are Protected", "Suggest a Business", "Open Suggestions".
  - Small words stay lower case unless first: a, an, and, as, at, but, by, for, in, of, on, or, the, to.
- **Sentence case** for anything that is a sentence: subtitles, descriptions, body text, toasts, errors, empty states, and help text.
- **Proper nouns and acronyms are always right:** Cagayan, Tuguegarao City, Peñablanca, Capitol, PSA, PSGC, DTI, BIR, SEC, CDA, LGU.
- `type-label` renders in uppercase through CSS. Write its text in Title Case anyway, so screen readers and copies read it right.
- The fixed phrases in `privacy-rules.md`, "Words on screen", are used word for word. They are sentences ("Not available", "Hidden to protect individual businesses").

### Rules

- **No em dashes or en dashes** (— or –). Use a period, or rewrite.
- **No middots** (·).
- **No separators in titles and headings.** Not commas, dashes, middots, or pipes. A title is one name. Show context with a `type-label` line above it or a subtitle under it.
- **Plain words.** "Did not renew", not "Non-compliant". "Below peer average", never "underperforming".
- **Buttons say what happens.** "Export CSV", "Suggest a Business", never "OK" or "Click here".
- **No exclamation marks and no emoji.**
- **Numbers:** thousands separators (12,450). Percent with one decimal (9.1%). Changes signed (+3.4%). Pesos as "₱224.7 million" in panels and "₱225M" in legends. Area as "707.5 km²".
- **Say the year and the source once** per group of figures ("Figures as of 2024." and one source line), not beside every number.

Page titles: pass only the page name to `<Head title="Home" />`. The app adds its own name to the browser tab.

## Do and Don't

| Area | Do | Don't |
| :- | :- | :- |
| Color | Use token classes. Keep hue for data. Brass only for a choice or a connection | Hex values, `bg-blue-500`, gradients, glows, tinted backgrounds for mood |
| Type | Geist for words, Geist Mono for numbers and labels. Use `type-*` roles | Raw `text-2xl font-bold`, a third font, mono paragraphs |
| Shape | Let `rounded-*` resolve to 2px. Hairlines between rows | `rounded-[12px]`, pill buttons, heavy shadows |
| Layout | Build on the existing layout. Lead with the answer and let the next section peek in | Redesigning a page that only needed tweaks, empty hero padding, a sticky header, a top nav bar on public pages |
| Map | Same-size dots shaded by value, a select that does the same job, details beside the map | Unrequested legends, dots that shrink until they vanish, a source line under every figure, a map as the only way to pick a place |
| Copy | Title Case headings and buttons, sentences for text, one year and source per group | Repeated helper paragraphs, dangling statistics, sentence case buttons, separators in titles, "N/A", "0" for missing |
| Motion | Short fades and lifts behind `motion-safe:` | Bounce, parallax, motion that blocks reading |
| States | Loading skeleton, empty message, "Not available", "Hidden to protect individual businesses", error | A blank area, a spinner forever, `0` |
| Access | Keyboard for every control, visible focus ring, `aria-label` on icon buttons and map places | Hover-only information, tiny targets under 40px |

## Layout

### App shell (public)

- **No top bar.** A slim line at the top scrolls away with the page: the app name as a `type-label` link home, the "Simulated data" tag, and the light and dark switch on the right. There is no login button on public screens (decisions.md, D20).
- **Phones:** navigation is the bottom bar (`components/app-bottom-bar.tsx`), at most four items, each with an icon and a label.
- **Desktop:** Home and Suggestions as small `type-label` text links on the right of the same line, the current one underlined in brass. Not a bar. Home also links to wishes with its "Share Your Wish" button.
- **Footer:** a formal institutional block naming the Republic of the Philippines, Provincial Government of Cagayan, the initiative, and the Digital Innovation Challenge context. Use clear hierarchy and restrained wording. Data sources are credited in `data/` READMEs and beside the relevant figures.
- Content is centered at `max-w-6xl`, `px-gutter` on phones and `px-6` from `md`, sections `gap-section` apart.
- Capitol uses a fixed, non-collapsible labeled desktop sidebar and a mobile menu. One compact breadcrumb strip follows actual geography/page hierarchy. The content fills the remaining width.
- Compact spacing, readable type, hairline separators, no oversized greeting or decorative metric cards. New workspace dimensions live in app.css tokens.
- A short greeting row shows stored name, date, HH:mm:ss Philippine time, and a private birthday greeting when appropriate. The clock has no live-region announcements.
- Dashboard: MapLibre population map and selected-area details. Omit the requests/approvals placeholder until functional. Community Wishes never appears on the dashboard.
- Selected sidebar destinations use background and weight, without an accent bar. The greeting omits the role; retain it in the sidebar account area. No repeated helper paragraphs about expressed interest, unavailable workflows, or boundary limitations.
- One click selects an area locally, without a server visit or remounting the map. Geographic breadcrumbs also update locally. View Barangays explicitly drills down. Town/barangay selects provide equivalent access; URL filters preserve navigation. Sources and missing figures remain explicit.
- Community Wishes is separate, accessible only to Admin and Super Admin. Activity Logs is Super Admin only. Profile is available to each signed-in role.
- Future business publication uses labeled stages 1 Prepare, 2 Review, 3 Publish. No preview approval controls before that workflow is implemented.

### Home

1. **The hero:** the river ink surface (`bg-brand`) holding the town map, as large as the screen allows (`lg:h-[44rem]`), with compact equal vertical padding and a side column on the right: the town select and the shared icon style control, followed by population, revenue, expenditure, and their sources. On phones the column sits under the map. The page title stays in the document for screen readers only.
2. **About the Data:** the selected Cagayan town’s barangay map (`components/barangay-atlas.tsx`), shaded by census population with a tooltip per barangay, a click to keep a barangay's figure under the map, and one PSA source link. Beside it, a definition list of what is real and what is simulated.
3. **How Businesses Are Protected:** three numbered points on `bg-muted`.
4. **What You Can Do:** one large card for wishes with the title "What Business Do You Wish for Your Town?" and the primary "Share Your Wish" button beside compact muted cards for features not open yet.

### Suggestions

The page header, then one shared form canvas with town, business type, specific business, reason, and the halftone town map. Choosing a town on the map or the list fills the other.

Business Type is visible by default. The inline button "Not on the List? Specify a Business" reveals the Specific Business field; either field or both may be submitted. Existing company wishes reveal the field when edited. Selection changes preserve the draft and scroll position, with only the count updating in the background.

### Town map (Home hero)

`components/town-atlas.tsx`. Its wrapper carries the `dark` class, so the map, text, and select use the dark tokens on the ink surface in both modes (the color tokens are mapped in `@theme inline` for this).

- **Map** (`components/province-map.tsx`): same-size halftone dots, shaded by population (metrics.md, M18), with water and borders.
  - **Zoom** (`zoomable`): plus, minus, and reset buttons top right, Ctrl or Cmd with the wheel, or a trackpad pinch, from 1 to 6 times. Drag to move when zoomed. Plain scrolling still scrolls the page.
  - Hover or focus: the town lifts slightly, the others dim, and a tooltip shows the name and population.
- **Click** (or Enter): the town turns brass and the panel beside the map shows the town's population, revenue, expenditure, years, and source. The town goes in the URL as `?town=`.
- **Style control:** Dotted and Solid share the population scale, geometry, selection, and tooltips. One icon-only control sits beside the main town selector without adding another toolbar row; it also controls About the Data. No additional legend or zoom instruction is shown.
- **Town select** (`Select`): "All of Cagayan" and the 29 towns. The map is never the only way to pick a town.
- **Details panel:** the kind as a label, the name as the title, then Population, Revenue, and Expenditure in mono. Sources appear once per group. There is no details dialog. A missing figure reads "Not available".
- Only business-relevant figures are shown: population, revenue, expenditure. Other town facts stay in the data file for later.

### Figure row

- `components/figure-row.tsx`: one `Card` with figures split by hairlines. The figure (`type-figure`) on top, the label (`type-label`, muted) under it. Two across on phones, up to four from `lg`.
- A row that holds sales figures uses the guarded figure component, so a hidden cell reads "Hidden to protect individual businesses", never `0`.

### Results screen (list and map)

Used by the business map (P1) and listing (P2), and by the Capitol directory (C13) with its own columns.

```
| Title                      [Share] |  Map panel           |
| Subtitle                           |  (sticky, full       |
| [Barangay v] [Type v]  [Filters]   |   height, in a card) |
| [ Search............ ] [Clear][Go] |                      |
| [Sort A][Sort B]      [List][Grid] |                      |
| item                               |   pins and shading   |
| [ Show More ]                      |                      |
```

- **From `lg`:** the list takes about 55 percent and scrolls. The map stays in place (`sticky top-6`).
- **Below `lg`:** one at a time. A floating "Show Map" or "Show List" button switches. The choice lives in the URL.
- **Filter row:** select triggers with a leading icon and a chevron. Rare filters go behind "More Filters" in a `Sheet`. Applied filters show in their trigger.
- **Sort and view:** `ToggleGroup`. **The list is one `Card`** with `divide-y`.
- **More results:** a full width "Show More" outline button that loads the next server page.

### List item

- A 4 by 3 tile in `bg-muted` with the business type's lucide icon. No photos, no stock images.
- Eyebrow (`type-label`), business name (`type-item`), one line of description, then icon and text pairs separated by space only.
- Hovering the row highlights its pin, and the pin highlights its row. The whole item is one link with a visible focus ring.
- **No sales on public screens,** not a figure, not a band.

### Map panel (business map, F6)

- A `Card` with our barangay shapes over the OpenFreeMap `positron` basemap, falling back to a plain `--muted` background offline (decisions.md, D5). No Google Maps.
- Controls float inside: zoom top right, layer switch top left, legend bottom left.
- Pins are small bordered tags (`type-pin`) with a count or a name. The selected pin inverts to `bg-primary`.
- Pins never show sales. Bands appear only as barangay shading with a legend (privacy-rules.md, P7).

## Components

- Build from `resources/js/components/ui/` (shadcn). Add missing ones with `npx shadcn@latest add <name>`. Do not hand-roll a card, badge, dialog, select, sheet, table, menu, or tooltip. If the CLI adds packages (`cn`, `radix-ui`) or rewrites imports, undo that: imports use `@/lib/utils` and the `@radix-ui/*` packages already installed.
- Change a primitive once instead of overriding it per page.
- Shared building blocks in `resources/js/components/`:

| Component | Use |
| :- | :- |
| `page-header.tsx` | The one-name title and an optional subtitle |
| `figure-row.tsx` | Headline figures in one card |
| `definition-list.tsx` | Term and description rows, for notes and limits |
| `province-map.tsx`, `lazy-province-map.tsx` | The halftone SVG map of the towns or of Tuguegarao's barangays, and the lazy loader pages use |
| `town-atlas.tsx` | The Home hero map, town/style controls, and three public figures with sources |
| `privacy/simulated-label.tsx` | The "Simulated data" tag, rendered by the layout only |
| `app-bottom-bar.tsx`, `appearance-toggle.tsx` | The shell |

- **One primary button per screen or area.** Everything else is outline or ghost.
- A feature not built yet is a muted card with a "Not Open Yet" badge.
- The toast (`components/ui/sonner.tsx`) shows flashed messages, above the phone bottom bar.

## States

Every view that shows data handles all five. Exact words come from `privacy-rules.md`, "Words on screen".

| State | Shows |
| :- | :- |
| Loading | A `Skeleton` the shape of the content |
| Empty | What is missing and the next step: "No businesses of this type here yet." |
| Not available | "Not available" in muted text. Never `0`, never a dash |
| Hidden | "Hidden to protect individual businesses", with the reason on hover |
| Error | A plain message with a way back. No technical details |

## Forms

- Every input has a visible label. Placeholders are examples, not labels.
- Build fields from shadcn's `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`. A form-wide error sits in an `Alert` above the submit button.
- During a cooldown or any wait, show the visitor's status and the next date instead of a disabled form.
- The submit button is disabled while submitting and shows a spinner. Success redirects and shows a toast.

## Navigation and auth

- **The URL is the state.** Filters, tabs, the chosen town, and pages live in the URL, so refresh, back, and shared links show the same screen.
- **Breadcrumbs** follow the route: Province > Tuguegarao City > Ugac Norte.
- **Guests who open a Capitol page** get a plain 404 (decisions.md, D20). Logged-in users who open the login page go to the Capitol home. Logout returns to the public home.
- **Public pages never require login.** Admin data never appears on them, not even hidden.
- **Errors:** 403 says "You do not have access to this page." 404 says the page does not exist and links home.

## Accessibility

- Contrast at WCAG AA (4.5 to 1 for text) in both modes.
- Everything works with a keyboard. Focus rings stay visible (`ring` token). Map places are focusable buttons with their name as the label.
- Icon-only buttons have an `aria-label`. Links that open a new tab say so to screen readers.
- Touch targets at least 40 by 40 pixels on public screens.
- Every chart and map has a non-visual way to the same answer: the select, the panel, or a table.

## Before you call a screen done

- [ ] Answers its question in the first screenful, and the next section peeks in
- [ ] Title Case headings and buttons, sentence case text, proper nouns right
- [ ] No em dashes, middots, separators in titles, gradients, or raw colors
- [ ] Sans for words, mono for numbers. `type-*` roles only. 2px corners
- [ ] Dots only for data, with a legend
- [ ] Loading, empty, not available, hidden, and error states
- [ ] Simulated label from the layout on screens with business data
- [ ] Works at 375px and on a laptop, in light and dark mode
- [ ] Keyboard, focus, and reduced motion

## Cagayan Economic Performance

Approved 26-10-25. The new public destination uses the existing slim desktop links and mobile bottom navigation, with Economic Performance on desktop and Economy on phones. The full page title is Cagayan Economic Performance. It answers how the selected town's government finances changed and which businesses are wished for.

Town precedes Topic; only the selected topic's controls and visualization appear. Tuguegarao City is the default. Other towns remain selectable and show Not available with concise source-gathering context. Finance Period and View, or Wishes For and View, sit within the same data surface. Filters and views live in the URL. No barangay controls, statistic strips, population or business-count placeholders.

Finance uses matching left/right peso axes and annual X-axis labels, quiet CartesianGrid, labeled solid/dashed series, exact-value tooltips and a table alternative. Missing points remain gaps. Community Wishes uses distinct Business Types/Specific Businesses modes and cloud/bars/table views. Preserve whole phrases, cap cloud density, keep stable placement and horizontal words, expose counts to keyboard and pointer users, and retain table access when placement fails. Cloud text size encodes counts; palette colors have no category or ranking meaning. No automatic motion is required.

Keep source/demo context with each visualization. Public wish labels are curated and contain no raw resident text. Browser-only visualizations load lazily after mounting; loading, empty, unavailable, hidden where applicable, and retryable error states remain explicit. At phone width, chart tables scroll inside their own surface without making the whole page overflow.

### October 25 Economy Layout Correction

The public page is now named Cagayan Economy, with Economy in navigation. This correction supersedes the preceding one-topic-at-a-time layout: Government Finances appears first, alongside a compact town-picker map on desktop, and Community Wishes follows below. Phones stack the finance surface, map and wishes. One Town dropdown serves both data sections and the map. The map has no fiscal shading or additional statistics.

Keep the page in one compact wrapper to avoid the public shell's large inter-section gaps. Cards use compact padding and 12px content gaps; the finance chart is shorter with solid, high-contrast Cartesian grid lines. View changes use icon-only toggle groups with accessible labels, pressed states, keyboard support and hover/focus tooltips. Keep Period and Wishes For as labeled selects. A Share Your Wish action belongs with Community Wishes, not on the map. Both sections retain complete tables and independent view selections.


### October 25 Home and Combined Wishes Correction

Explicit user correction supersedes earlier table, separate wish-mode, caption and Home placeholder examples. Home presents two working action cards after the geographic hero: What Businesses Would You Like in Your Town, and How Is Your Town Performing Economically. Use primary Share Your Wish and outline Explore the Economy actions, preserving a selected valid town. Remove What You Can Do, Business Map/guide placeholders and How Businesses Are Protected; retain the existing Home maps and About the Data.

Economy shows finance charts only, and one combined Community Wishes ranking with cloud/bars icons. No table controls, kind filter, default phrase-size instruction, visible All Time/as-of caption, finance disclaimer or expressed-interest disclaimer. Source attribution stays concise; snapshot provenance/date is available through the source info tooltip. Policy/metric definitions remain in documentation. Keep full financial observations in a screen-reader list and keyboard-accessible exact-value tooltips.

Ranked bars are a bounded, scrollable ordered list. Put the full wrapping label and exact count above each horizontal bar, so label length never consumes the plotting area. Retain backend order; bar widths are visual scaling only. Cloud items and omitted phrases expose the same exact town/count tooltip on focus, hover and activation. Display omitted phrases as actual count chips rather than a dangling fallback paragraph. Tooltip locations describe the dataset town; do not invent cross-town leadership or measured demand.


### Compact Home Action Cards

26-10-25 follow-up: remove icons from the two Home action cards. Use 16px vertical/horizontal padding, 12px content gaps, no shadow and no extra description. The Economy heading is Explore Your Town's Economy. Preserve the wish heading, working town-aware links and phone stacking. This supersedes the preceding question-style Economy heading and roomy icon-card treatment.
