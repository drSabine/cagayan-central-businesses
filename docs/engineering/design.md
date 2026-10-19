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
- **No decoration for its own sake:** no glows, glass effects, blobs, or background patterns. Depth comes from surfaces and soft shadows, and liveliness from short motion.
- **Color comes from tokens.** Use `bg-primary`, `text-muted-foreground`, `bg-map-3`, `text-status-closed`. Never raw hex values or palette classes like `bg-blue-500` in components.
- **Color is never the only signal.** Pair it with a label, an icon, or a pattern, so colorblind users and printed briefs still work.
- **Numbers in tables are right-aligned** and use `tabular-nums`.
- **Spacing and radius** follow "Shape and spacing" below. Do not invent new values per page.
- **Icons:** lucide only (already installed). One icon style, never colored.
- **Light and dark mode** both work. Check both before calling a screen done.

## Design tokens

Tokens are CSS variables in `resources/css/app.css`, mapped to Tailwind classes in its `@theme` block. shadcn's tokens cover the base UI. Ours cover the product:

| Token | Tailwind class | Use |
| :- | :- | :- |
| `--brand`, `--brand-foreground` | `bg-brand`, `text-brand-foreground` | River ink surface: the Home hero and the login panel. Dark in both modes |
| `--highlight` | `bg-highlight`, `fill-highlight` | Brass markers only: a connected or chosen town |
| `--map-1` to `--map-5` | `bg-map-1` to `bg-map-5`, `fill-map-*` | Choropleth scale, low to high |
| `--map-none` | `bg-map-none` | Towns not yet connected, areas with no data |
| `--status-new` | `bg-status-new`, `text-status-new` | New registrations |
| `--status-renewed` | `*-status-renewed` | Renewed |
| `--status-not-renewed` | `*-status-not-renewed` | Did not renew |
| `--status-closed` | `*-status-closed` | Closed |
| `--chart-1` to `--chart-5` | `*-chart-*` | Other categories in charts (shadcn) |

shadcn's `--background` is the near-white page and `--card` is the white card. `--primary` is river ink in light mode and a light blue in dark mode. `--radius` is 10 pixels.

The values are a starting point. The front end owner may tune them, keeping contrast at WCAG AA in both modes.

## Look and feel

Formal and businesslike, built around what the visitor came to do. Cagayan is the inspiration, not the decoration: the ink blue of the Cagayan River for the brand surface, a muted brass taken from the province's gold for small markers, and the real map of its 29 towns as the main image. The seal's own colors are not used.

### Color

- **Surfaces.** The page is `bg-background`. Cards, inputs, and menus are `bg-card` with a light border and the shadcn `Card` shadow. The brand surface (`bg-brand`) is only for the Home hero and the login panel.
- **One primary button per screen or area.** "Suggest a business" and "Export CSV" are primary. "Cancel", "Share", and "Edit suggestion" are outline buttons.
- **Brass for markers only.** A connected or chosen town. Never text, buttons, links, or data.
- **Other color is kept for data.** Only the map scale (`map-*`), statuses (`status-*`), and charts (`chart-*`) carry hue. A colored shape always means something.

### Type

- **Two families.** Source Serif 4 (`font-serif`) for page titles: the formal voice. Instrument Sans (`font-sans`) for everything else. The Vite fonts plugin serves both from our own build, so the booth demo works offline.
- **Weights:** regular for body. Medium for names, labels, and buttons. Semibold for titles, section headings, and figures.

| Role | Classes | Example |
| :- | :- | :- |
| Page title | `type-title`: serif, `text-3xl`, `text-4xl` from `lg`, semibold | Suggest a business for your town |
| Section heading | `type-heading`: `text-xl`, `text-2xl` from `lg`, semibold | What you can do |
| Page subtitle | `type-subtitle`: `text-base`, `text-lg` from `md`, muted | No account, name, or contact is collected. |
| Headline figure | `type-figure`: `text-3xl`, `text-4xl` from `lg`, semibold, `tabular-nums` | 1,204 |
| Lead text | `type-lead`: `text-base` | How businesses are protected, point by point |
| Item name | `type-item`: `text-base font-medium` | Business map |
| Body and controls | `type-body`: `text-sm` | Search, filter labels |
| Meta and figure label | `type-meta`: `text-sm text-muted-foreground` | Towns connected |
| Map pin and small badge | `type-pin`: `text-xs font-medium` | 38 |

The `type-*` utilities are defined once in `app.css`. Pages use them instead of raw size and weight classes, so a role changes in one place. They are named `type-*`, not `text-*`, so `cn()` never mistakes them for a text color.

A page title may lead with the count, because the count is the answer. It is still one phrase with no separators. `<Head title>` gets only the page name ("Explore").

### Shape and spacing

- **Radius 10 pixels** (`--radius`) with the shadcn scale: `rounded-md` on controls, `rounded-xl` on cards, `rounded-2xl` on large surfaces such as the hero. `rounded-full` for avatars, dots, and round icon buttons.
- **Cards, not ruled boxes.** Panels are the shadcn `Card`. Headline figures are a `FigureRow`.
- Controls are `h-10` (40 pixels), which also meets the touch target rule.
- Page gutter `px-4` on phones and `px-6` from `md`. Rows of controls use `gap-3`. Cards in a group use `gap-4`. Sections on a page use `gap-16`, and `gap-24` from `lg`.
- **Icons:** lucide at size 5 in panels and the header, size 4 inside controls and card titles.

### Motion

- Color, shadow, and position transitions of 200 ms, easing out.
- On Home, the map's shapes fade in one after another and the figure row rises on load (`motion-safe:animate-rise`). Sections below rise as they scroll into view (`reveal`, CSS only).
- Everything that moves sits behind `motion-safe:` or a reduced-motion check. No bounce and no loops.

### Dark mode

The same structure in deep blue grey: a dark page, slightly lighter cards, light text, and a lighter brass. The brand surface stays dark ink.

## Layout

### App shell (public)

- **Header:** sticky, on `bg-background` with a bottom border. On the left, the app name with "Simulated data" under it. No logo mark. From `lg`, the main navigation as a shadcn `NavigationMenu` of text links. On the right, the light and dark switch. There is no login button on public screens (decisions.md, D20).
- **Phones:** navigation moves to the bottom bar (`components/app-bottom-bar.tsx`) with at most four items, each with an icon and a short label.
- **Footer:** one line under every public page: "Prepared for the Provincial Government of Cagayan Digital Innovation Challenge." Data sources are credited in `data/boundaries/README.md`, not on screen.
- Content is centered at `max-w-6xl`.
- The Capitol shell is decided with the Capitol layout (roadmap F7). The shadcn `Sidebar` is available for it.

### Figure row

The main pattern for headline figures on both sides.

- `components/figure-row.tsx`: one shadcn `Card` holding the figures, split by hairlines that follow the cells as they wrap. The figure on top (`type-figure`), the label under it (`type-meta`). Two across on phones, up to four from `lg` (`lg:grid-cols-4`).
- A chart, map, or table for those figures sits under the row in its own `Card`.
- A row that holds sales figures uses the guarded figure component, so a hidden cell reads "Hidden to protect individual businesses", never `0`.
- **Tags:** a row of outlined `Badge`s for business types, peers, or applied filters. They can be links or toggles.

### Results screen (list and map)

Used by Explore map (P1) and Business listing (P2), and by the Capitol directory (C13) with its own columns.

```
| Title                      [Share] |  Map panel           |
| Subtitle                           |  (sticky, full       |
| [Barangay v] [Type v]  [Filters]   |   height, in a card) |
| [ Search............ ] [Clear][Go] |                      |
| [Sort A][Sort B]      [List][Grid] |                      |
| item                               |   pins and shading   |
| item                               |                      |
| [ Show more ]                      |                      |
```

- **From `lg`:** the list takes about 55 percent and scrolls. The map takes the rest and stays in place (`sticky top-16`).
- **Below `lg`:** one at a time. A floating "Show map" or "Show list" button switches. The choice lives in the URL (`?view=map`).
- **Header row:** title and subtitle on the left, outline actions on the right. "Share" copies the current URL, which already holds every filter.
- **Filter row:** select triggers with a leading icon and a chevron (Barangay, Business type). Rare filters go behind "More filters", which opens a `Sheet`. Applied filters show in their trigger, so the row says what is applied.
- **Search row:** a full width input with a search icon, then "Clear" (outline) and "Search" (primary).
- **Sort and view:** `ToggleGroup` segmented controls.
- **The list is one `Card`** with `divide-y`, one item per row.
- **More results:** a full width "Show more" outline button at the end of the list. It loads the next server page and appends it. Never load everything at once.

### List item

```
[ type tile ]  Eyebrow: business type in barangay
[  4 by 3   ]  Business name
[           ]  Brief description, one line
[           ]  (icon) Barangay   (icon) Since 2014   (icon) Type group
```

- **Thumbnail:** a 4 by 3 tile in `bg-muted` with the business type's lucide icon centered. We have no photos and never use stock images that pretend to show the business.
- **Meta row:** icon and text pairs separated by space only (`gap-4`). Never a middot or a pipe.
- On hover the row gets `bg-accent`, and its map pin highlights. Hovering a pin highlights its row back.
- The whole item is one link to the business page, with a visible focus ring.
- **The right column stays empty on public screens.** We never show a single business's sales anywhere. On the Capitol directory the right column may hold the status badge.

### Map panel

- A `Card`. Our own barangay shapes over the quiet OpenFreeMap `positron` basemap. Without internet it falls back to a plain `--muted` background and the shapes still draw (decisions.md, D5, and `frontend.md`, "The map"). No Google Maps.
- **Controls float inside the panel:** zoom in and out as a stacked pair top right, the layer switch as a segmented control top left, the legend as a small card bottom left.
- **Pins are small tags:** `bg-card`, bordered, `type-pin`, showing a count of businesses ("38") or a business name at close zoom. A group of nearby pins shows the count of the group. The selected or hovered pin inverts to `bg-primary text-primary-foreground`.
- **Pins never show sales.** Not a figure, not a band. Bands appear only as barangay shading with a legend, on public screens (privacy-rules.md, P7).

### Province map

- `components/province-map.tsx` draws the 29 towns of Cagayan or the 49 barangays of Tuguegarao City as SVG from `data/boundaries`. Pages use `LazyProvinceMap`, which shows a skeleton while it loads.
- Shapes follow the parent's text color. Connected or chosen places fill brass. Hovering names a place in a shadcn `Tooltip`.
- It is an illustration and a picker, never the only control, and it never shows business data. Where business data is shown, the MapLibre map (F6) is used instead.

## Components

- Build from `resources/js/components/ui/` (shadcn). Add missing ones with `npx shadcn@latest add <name>`. Do not hand-roll a card, badge, dialog, select, table, menu, or tooltip. The CLI may add packages (`cn`, `radix-ui`) and point imports at them. Undo that: imports use `@/lib/utils` and the `@radix-ui/*` packages already installed.
- The primitives follow this file: controls are `h-10`, and inputs and outline buttons sit on `bg-card`. Change a primitive once instead of overriding it per page.
- Shared building blocks in `resources/js/components/`:
  - `page-header.tsx`: the one-name title and an optional subtitle.
  - `figure-row.tsx`: headline figures in one card.
  - `definition-list.tsx`: term and description rows, for notes, limits, and status.
  - `province-map.tsx` and `lazy-province-map.tsx`: the SVG province or city map, and the lazy loader pages use.
  - `components/ui/table.tsx` (shadcn): any table of figures.
  - `app-bottom-bar.tsx`, `appearance-toggle.tsx`: the shell.
- **Public pages lead with the task.** The first screen says what the visitor can do and holds one primary button. Hierarchy comes from the type scale and card size: what is open now is the biggest thing. A feature not built yet is a quiet muted card with a "Not open yet" badge. Plain labels ("Suggest a business", not metaphors).
- **Home page:** the brand hero is the province map alone, with a "Connected" and "Not yet connected" key under it. The page title stays in the document for screen readers only. Then a figure row over the hero's bottom edge, "About the data" with the Tuguegarao barangay map beside a definition list of limits, "How businesses are protected" as three numbered points, and "What you can do" last, as one large open card beside smaller muted cards.
- **The "Simulated data" label** is small muted text under the app name in the header, on every public page. Home explains it under "About the data".
- The toast (`components/ui/sonner.tsx`) shows flashed messages, above the phone bottom bar.
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
- During a cooldown or any wait, show the visitor's status and the next date instead of a disabled form.
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
- [ ] Tokens only, no raw colors. Built from shadcn primitives. Brass only on markers
- [ ] Loading, empty, not available, hidden, and error states
- [ ] Simulated label on screens with business data
- [ ] Works on a phone (public) or a laptop (Capitol), in light and dark mode
- [ ] Keyboard and screen reader basics
