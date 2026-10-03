# Design

How screens should look, read, and behave. Read this before building or changing any page. For code structure, see `frontend.md`.

## Principles

1. **Start from the user's question.** A planner asks "where are businesses closing?" A resident asks "how many coffee shops are near me?" Every screen answers one question, and the answer is the first thing on it.
2. **Practical over pretty.** Clear numbers, plain labels, obvious next steps. Nothing decorative.
3. **Fast to read.** Short labels, aligned numbers, one idea per card.
4. **Honest.** Simulated data says so. Hidden figures say why. Counts of wishes say they are not measured demand.
5. **Two audiences, two densities.** Capitol screens are dense and built for laptops. Public screens are simple and built for phones first.

## Writing rules

These apply to every word in the UI: titles, headings, labels, buttons, toasts, empty states, and exports.

- **No em dashes or en dashes** (— or –). Use a period, or rewrite the sentence.
- **No middots** (·).
- **No separators in titles and headings.** Not commas, not dashes, not middots, not pipes. A title is one name: "Barangay profile", not "Barangay profile, Ugac Norte" or "Ugac Norte · Profile". Show context with breadcrumbs or a line of smaller text under the title.
- **Sentence case.** "Business directory", not "Business Directory".
- **Plain words.** "Did not renew", not "Non-compliant". "Below peer average", never "underperforming".
- **Short buttons that say what happens.** "Export CSV", "Submit wish", not "OK" or "Click here".
- **No exclamation marks and no emoji** in the interface.
- **Numbers:** separators for thousands (12,450), pesos as "PHP 1.2M" on charts and full figures in tables, percent with one decimal (4.5%).
- **Fixed phrases** come from `privacy-rules.md`, "Words on screen". Use them word for word.

Page titles: pass only the page name to `<Head title="Barangay profile" />`. The app adds its own name to the browser tab.

## Visual rules

- **No gradients.** Not on backgrounds, buttons, text, borders, charts, or the map. Flat fills only.
- **No decoration for its own sake:** no glows, glass effects, blobs, or background patterns.
- **Color comes from tokens.** Use `bg-primary`, `text-muted-foreground`, `bg-map-3`, `text-status-closed`. Never raw hex values or palette classes like `bg-blue-500` in components.
- **Color is never the only signal.** Pair it with a label, an icon, or a pattern, so colorblind users and printed briefs still work.
- **Numbers in tables are right-aligned** and use `tabular-nums`.
- **Spacing and radius** follow "Shape and spacing" below. Corners are square. Do not invent new values per page.
- **Icons:** lucide only (already installed). One icon style, never colored.
- **Light and dark mode** both work. Check both before calling a screen done.

## Design tokens

Tokens are CSS variables in `resources/css/app.css`, mapped to Tailwind classes in its `@theme` block. shadcn's tokens cover the base UI. Ours cover the product:

| Token | Tailwind class | Use |
| :- | :- | :- |
| `--map-1` to `--map-5` | `bg-map-1` to `bg-map-5`, `fill-map-*` | Choropleth scale, low to high |
| `--map-none` | `bg-map-none` | Towns not yet connected, areas with no data |
| `--status-new` | `bg-status-new`, `text-status-new` | New registrations |
| `--status-renewed` | `*-status-renewed` | Renewed |
| `--status-not-renewed` | `*-status-not-renewed` | Did not renew |
| `--status-closed` | `*-status-closed` | Closed |
| `--chart-1` to `--chart-5` | `*-chart-*` | Other categories in charts (shadcn) |
| `--highlight` | `text-highlight`, `bg-highlight` | Section labels and the current item marker only |

shadcn's `--background` is the beige page and `--card` is the off-white panel. `--radius` is `0`.

The values are a starting point. The front end owner may tune them, keeping contrast at WCAG AA in both modes.

## Look and feel

One theme for the whole app: warm paper. A beige page, off-white panels, thin dark rules, square corners, and plenty of empty space inside each panel. It reads like a printed planning sheet, which suits a government tool and prints well as a brief. The public side uses it with a listings layout (a list beside a live map). The Capitol side uses it with ruled grids of figures, tables, and the choropleth.

### Color

- **Two surfaces.** The page is `bg-background` (beige). Panels, cards, tables, and inputs are `bg-card` (off-white). Nothing is pure white.
- **Ink and paper.** Text, borders, and the primary button are near black (`text-foreground`, `border-border`, `bg-primary`). Secondary text is warm grey (`text-muted-foreground`).
- **One accent, for labels only.** `text-highlight` (burnt orange) is for section eyebrow labels ("Business activity") and the marker of the current item. Never on buttons, links, charts, or the map, so it is never mistaken for data.
- **Other color is kept for data.** Only the map scale (`map-*`), statuses (`status-*`), and charts (`chart-*`) carry hue. A colored shape always means something.
- **One primary button per area.** "Search" and "Export CSV" are primary. "Clear", "Share", and "More filters" are outline buttons.
- **Rules over shadows.** Structure comes from 1 pixel `border-border` lines. Rows inside a table use the lighter `divide-border/20`. Shadows (`shadow-xs`) only on things that float: map pins, map controls, popovers, and menus.

### Type

- **One family:** Instrument Sans (`font-sans`). The Vite fonts plugin downloads it at build time and serves it from our own build, so the booth demo works offline.
- **Three weights:** regular for body, titles, and big figures. Medium for names, labels, and buttons. Semibold only for the page title.

| Role | Classes | Example |
| :- | :- | :- |
| Page title | `type-title`: `text-2xl font-semibold tracking-tight` (`text-3xl` from `lg`) | 1,204 businesses in Tuguegarao City |
| Page subtitle | `type-subtitle`: `text-base text-muted-foreground` | Registered businesses only |
| Section label | `type-label`: `text-sm font-medium text-highlight` | Business activity |
| Headline figure | `type-figure`: `text-3xl tabular-nums` | 1,204 |
| Figure label and lead text | `type-lead`: `text-base` | Active businesses |
| Panel title and item name | `type-panel-title` (`text-lg`) or `type-item` (`text-base font-medium`) | Active businesses |
| Body and controls | `type-body`: `text-sm` | Search, filter labels |
| Eyebrow, meta, and figure caption | `type-meta`: `text-sm text-muted-foreground` | Up 4.5% from last year |
| Map pin and small badge | `type-pin`: `text-xs font-medium` | 38 |

The `type-*` utilities are defined once in `app.css`. Pages use them instead of raw size and weight classes, so a role changes in one place. They are named `type-*`, not `text-*`, so `cn()` never mistakes them for a text color.

A page title may lead with the count, because the count is the answer. It is still one phrase with no separators. `<Head title>` gets only the page name ("Explore").

### Shape and spacing

- **Square corners everywhere.** `--radius` is `0`, so every shadcn component is square. Do not add `rounded-*` classes, except `rounded-full` for avatars, status dots, and the spinner.
- **Ruled grids, not floating cards.** Panels that belong together share their borders and touch, with no gap between them (see "Ruled grid" below). Separate groups are separated by space on the beige page.
- **Room inside panels.** Panels use `p-5`, and a figure panel is tall enough that its icon sits at the top and its figure and caption sit at the bottom.
- Controls are `h-10` (40 pixels), which also meets the touch target rule.
- Page gutter `px-4` on phones and `px-6` from `md`. Rows of controls use `gap-3`. Groups of panels use `gap-8`.
- **Icons:** lucide at size 5 in panels and the rail, size 4 inside controls. `text-foreground`, never colored.
- **Motion is short and quiet:** color and background transitions of 150 ms, and a smooth fly to on the map. No bounce, no entrance animations.

### Dark mode

The same idea in charcoal: a dark warm page, a slightly lighter panel, light grey rules and text, and a lighter orange for `highlight`. Square corners and rules stay the same.

## Layout

### App shell

- **Desktop and laptop (`lg` and up):** a fixed icon rail on the left, about 64 pixels wide, on `bg-card` with a `border-r`. Logo at the top, then one icon per section, then the light and dark switch (or the user menu on the Capitol side) at the bottom. There is no login button on public screens (decisions.md, D20). Every icon has a tooltip and an `aria-label`. The active section gets `bg-accent` and a 2 pixel `bg-highlight` bar on its left edge. Built as `components/app-rail.tsx` from a list of nav items, so both sides share it. It is a plain fixed rail, not the shadcn `Sidebar`, which expands and has a keyboard toggle the rail does not need.
- **Phones:** the rail becomes a bottom bar (`components/app-bottom-bar.tsx`) with at most four items, each with an icon and a short label. The light and dark switch moves to the top bar.
- The "Simulated data" label sits in the shell, visible on every screen with business records.
- The content area is the beige page. Panels sit on it.

### Ruled grid (Capitol dashboards)

The main pattern for headline figures, profiles, and comparisons. A row of panels drawn as one bordered block divided by single rules, like a table without a header.

```
+--------------+--------------+--------------+--------------+
| (icon)       | (icon)       | (icon)       | (icon)       |
|              |              |              |              |
| 1,204        | 86           | 1,071        | 47           |
| Active       | New this     | Renewed      | Did not      |
| businesses   | year         |              | renew        |
+--------------+--------------+--------------+--------------+
| Wide panel: chart, map, or table across the full row      |
+-----------------------------------------------------------+
```

- **Build:** one container with `border` and `bg-card`, children in a CSS grid separated by `divide-x` and `divide-y` (or a `border-t` on a row). Never a gap between cells, never a border doubled where two cells meet.
- **Figure cell:** lucide icon top left, then empty space, then the figure (`text-3xl tabular-nums`), the label (`text-base`), and a caption (`text-sm text-muted-foreground`) such as the change from last year. Minimum height about 12rem from `lg`, so cells line up.
- **Columns:** up to five cells across on a laptop, two on a tablet, one on a phone. Cells reflow and the rules follow.
- **A full width cell** under a row holds the chart, map, or table for that row of figures.
- **Section label:** above a grid, a `text-highlight` label ("Business activity") and an optional line of muted text. No other heading decoration.
- **Tags:** a row of square outlined tags (`Badge variant="outline"`, `h-10 px-4 text-base`) for business types, peers, or applied filters. They can be links or toggles.
- A grid that holds sales figures uses the guarded figure component, so a hidden cell reads "Hidden to protect individual businesses", never `0`.

### Results screen (list and map)

Used by Explore map (P1) and Business listing (P2), and by the Capitol directory (C13) with its own columns.

```
| rail | Title                      [Share] |  Map panel           |
|      | Subtitle                           |  (sticky, full       |
|      | [Barangay v] [Type v]  [Filters]   |   height, bordered)  |
|      | [ Search............ ] [Clear][Go] |                      |
|      | [Sort A][Sort B]      [List][Grid] |                      |
|      | item                               |   pins and shading   |
|      | item                               |                      |
|      | [ Show more ]                      |                      |
```

- **From `lg`:** the list takes about 55 percent and scrolls. The map takes the rest and stays in place (`sticky top-0 h-screen`).
- **Below `lg`:** one at a time. A floating "Show map" or "Show list" button switches. The choice lives in the URL (`?view=map`).
- **Header row:** title and subtitle on the left, outline actions on the right. "Share" copies the current URL, which already holds every filter.
- **Filter row:** select triggers styled as outline buttons with a leading icon and a chevron (Barangay, Business type). Rare filters go behind "More filters", which opens a `Sheet`. Applied filters show in their trigger, so the row says what is applied.
- **Search row:** a full width input with a search icon, then "Clear" (outline) and "Search" (primary).
- **Sort and view:** `ToggleGroup` segmented controls inside one border. The active item is `bg-primary text-primary-foreground`.
- **The list is one ruled block:** a `bg-card` panel with `divide-y`, one item per row.
- **More results:** a full width "Show more" outline button at the end of the list. It loads the next server page and appends it. Never load everything at once.

### List item

```
[ type tile ]  Eyebrow: business type in barangay
[  4 by 3   ]  Business name
[           ]  Brief description, one line
[           ]  (icon) Barangay   (icon) Since 2014   (icon) Type group
```

- **Thumbnail:** a 4 by 3 tile in `bg-muted` with a `border` and the business type's lucide icon centered. We have no photos and never use stock images that pretend to show the business.
- **Meta row:** icon and text pairs separated by space only (`gap-4`). Never a middot or a pipe.
- On hover the row gets `bg-accent`, and its map pin highlights. Hovering a pin highlights its row back.
- The whole item is one link to the business page, with a visible focus ring.
- **The right column stays empty on public screens.** The first reference puts a price there. We never show a single business's sales anywhere. On the Capitol directory the right column may hold the status badge.

### Map panel

- A bordered panel. Our own barangay shapes over the quiet OpenFreeMap `positron` basemap. Without internet it falls back to a plain `--muted` background and the shapes still draw (decisions.md, D5, and `frontend.md`, "The map"). No Google Maps.
- **Controls float inside the panel:** zoom in and out as a stacked pair top right, the layer switch as a segmented control top left, the legend as a small panel bottom left. All use `bg-card`, `border`, and `shadow-xs`.
- **Pins are square tags:** `bg-card`, bordered, `text-xs font-medium`, showing a count of businesses ("38") or a business name at close zoom. A group of nearby pins shows the count of the group. The selected or hovered pin inverts to `bg-primary text-primary-foreground`.
- **Pins never show sales.** Not a figure, not a band. Bands appear only as barangay shading with a legend, on public screens (privacy-rules.md, P7).

### What we take from the references and what we leave

The public side follows a property listings screen. The dashboards follow a ruled grid of feature panels.

| Reference | Ours |
| :- | :- |
| Icon rail, list beside map, filter row, segmented sort and view | Keep |
| Beige page, off-white panels, dark rules, square corners | Keep, for the whole app |
| Panels that share borders, icon top and text bottom | Keep, as the ruled grid |
| Orange section label | Keep, as `highlight`, for labels only |
| Square outlined tags | Keep |
| Dot grid background | Removed. No background patterns. Use a flat `bg-muted` panel |
| Connector line with a plus node between blocks | Removed. Decoration |
| Price on each listing and on map pins | Removed. Pins show counts. No per business sales anywhere |
| Photos | Type icon tile |
| Star ratings and review counts | Removed. We have no ratings |
| "Guest favorite" laurel badge | Removed. Decoration |
| Host avatar and name | Removed. Owner details are admin only |
| Country flag in the location chip | Removed. No emoji, and a lucide `MapPin` instead |
| "Save search" | Removed. Not in scope. "Share" covers it |
| Google basemap | OpenFreeMap `positron` under our own shapes, with an offline fallback |
| Title Case tags ("Action Restrictions") | Sentence case ("Food service") |

## Components

- Build from `resources/js/components/ui/` (shadcn). Add missing ones with `npx shadcn@latest add <name>`. Do not hand-roll a dialog, select, table, or tooltip. The CLI may add packages (`cn`, `radix-ui`) and point imports at them. Undo that: imports use `@/lib/utils` and the `@radix-ui/*` packages already installed.
- The primitives already follow this file: controls are `h-10`, inputs, selects, and outline buttons sit on `bg-card`, and nothing has a shadow. Change a primitive once instead of overriding it per page.
- Shared building blocks in `resources/js/components/`:
  - `page-header.tsx`: section label, one-name title, subtitle, and actions on the right.
  - `section-heading.tsx`: the orange label and a muted line above a grid.
  - `ruled-grid.tsx`: `RuledGrid` (1 to 5 columns), `RuledCell`, and `FigureCell` (icon top, figure, label, caption bottom).
  - `app-rail.tsx`, `app-bottom-bar.tsx`, `appearance-toggle.tsx`: the shell.
- **Home page:** the header with one primary action, then "What you can do here" as a 3 cell ruled grid (a feature not built yet shows an outline "In preparation" badge and no link), then "About the data" figures, then "How we protect businesses", then the sources. No hero image, no illustration.
- The toast (`components/ui/sonner.tsx`) shows flashed messages. Layouts, headings, and breadcrumbs come with the design system.
- A screen that shows business data includes the "Simulated data" label from the shared layout. Never add it page by page.

## Screen patterns

- **Overview first, detail on demand.** Headline numbers, then the map or chart, then the table.
- **Every chart and map has a table version** a click away, for screen readers, for printing, and for anyone who reads tables faster.
- **Filters** sit at the top in one row (year, type, size, status), stay in the URL, and show what is applied.
- **Tables** sort by clicking a header, paginate on the server, and keep a sticky header on long lists.
- **Empty states** say what is missing and the next action: "No businesses of this type here yet."
- **Hidden figures** show "Hidden to protect individual businesses" with a short reason on hover. Never a dash, never a zero.

## Forms

- Every input has a visible label. Placeholders are examples, not labels.
- Build fields from shadcn's `Field`, `FieldLabel`, `FieldDescription`, and `FieldError` (`components/ui/field.tsx`). Errors appear under the field in `FieldError`, in plain words, and say how to fix them. A form-wide error, such as a cooldown, sits in an `Alert` above the submit button.
- The submit button is disabled while submitting and shows a spinner.
- Success: redirect and show a toast. Do not leave the user on a filled form wondering if it worked.

## Navigation and auth

The user should always know where they are and how to get back.

- **The URL is the state.** Filters, tabs, and pages live in the URL, so refresh, back, and shared links show the same screen.
- **Breadcrumbs** follow the route: Province > Tuguegarao City > Ugac Norte.
- **Guests who open a Capitol page** get a plain 404. A redirect would reveal the login path, which lives only in `.env` and is never linked (decisions.md, D20).
- **Logged-in users who open the login page** go to the Capitol home.
- **Public pages never require login.** Admin data never appears on them, not even hidden.
- **After a form:** redirect to the page that shows the result.
- **Errors:** 403 says "You do not have access to this page." 404 says the page does not exist and links home. Neither shows technical details.
- **Logout** returns to the public home page.

## Accessibility

- Contrast at WCAG AA (4.5 to 1 for text).
- Everything works with a keyboard. Focus rings stay visible (shadcn's `ring` token).
- Icon-only buttons have an `aria-label`.
- Touch targets at least 40 by 40 pixels on public screens.
- The map is never the only way to reach a barangay. A list or search does the same job.

## Before you call a screen done

- [ ] Answers its question in the first screenful
- [ ] No em dashes, middots, or separators in titles. No gradients.
- [ ] Tokens only, no raw colors. Square corners, rules instead of shadows, orange only on labels
- [ ] Loading, empty, not available, hidden, and error states
- [ ] Simulated label on screens with business data
- [ ] Works on a phone (public) or a laptop (Capitol), in light and dark mode
- [ ] Keyboard and screen reader basics
