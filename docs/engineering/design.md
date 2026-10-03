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
- **Spacing and radius** follow the shadcn defaults already in `app.css`. Do not invent new ones per page.
- **Icons:** lucide only (already installed). One icon style.
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

The values are a starting point. The front end owner may tune them, keeping contrast at WCAG AA in both modes.

## Components

- Build from `resources/js/components/ui/` (shadcn). Add missing ones with `npx shadcn@latest add <name>`. Do not hand-roll a dialog, select, table, or tooltip.
- Use the existing app pieces: `heading.tsx`, `breadcrumbs.tsx`, `input-error.tsx`, the sidebar, the toast.
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
- Errors appear under the field (`InputError`), in plain words, and say how to fix them.
- The submit button is disabled while submitting and shows a spinner.
- Success: redirect and show a toast. Do not leave the user on a filled form wondering if it worked.

## Navigation and auth

The user should always know where they are and how to get back.

- **The URL is the state.** Filters, tabs, and pages live in the URL, so refresh, back, and shared links show the same screen.
- **Breadcrumbs** follow the route: Province > Tuguegarao City > Ugac Norte.
- **Guests who open a Capitol page** are sent to login, then returned to the page they asked for (Fortify does this with the intended URL).
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
- [ ] Tokens only, no raw colors
- [ ] Loading, empty, not available, hidden, and error states
- [ ] Simulated label on screens with business data
- [ ] Works on a phone (public) or a laptop (Capitol), in light and dark mode
- [ ] Keyboard and screen reader basics
