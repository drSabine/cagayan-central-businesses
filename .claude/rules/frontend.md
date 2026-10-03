---
paths:
  - "resources/js/**/*.{ts,tsx}"
  - "resources/css/**/*.css"
---

# Front end rules

Full guides: `docs/engineering/frontend.md` (structure and data) and `docs/engineering/design.md` (look and words).

## Structure

- **Data comes from props.** No API calls for page data, no Redux, Zustand, React Query, or Axios. Filters change the URL with `router.get(..., { preserveState: true })`.
- **Pages** in `resources/js/pages/`, folders following the route name (`capitol.barangays.show` is `pages/capitol/barangays/show.tsx`). Each page declares a `Props` type matching its PHP Data object.
- **Reuse first:** `components/ui/` (shadcn), then `components/`, `hooks/`, `lib/`. Missing shadcn piece: `npx shadcn@latest add <name>`.
- **Do not over-split.** Keep markup in the page until it repeats or the file passes about 200 lines. No one-line wrappers, no pass-through components, no `index.ts` re-exports.
- **No metric math in the browser.** Format only, with the helpers in `lib/`.
- **Links and forms use Wayfinder** (`@/routes`, `@/actions`). Never a hard-coded URL. `<Link>` for navigation.
- **Heavy libraries load lazily** (`React.lazy` for the map and charts) with a skeleton.
- **Map:** import from `react-map-gl/maplibre`, never the default import. Basemap is OpenFreeMap `positron` with the offline fallback in `frontend.md`, "The map". Map colors come from tokens through `mapColor()`.
- **Charts:** shadcn's `ChartContainer` (Recharts) with `--chart-*` tokens. Every chart has a table version.
- **PDF:** `@react-pdf/renderer`, templates in `resources/js/pdf/`, built only from the page's props, loaded with `import()` on click. Tailwind and shadcn do not work inside a PDF. Show the "Simulated data" label.
- **The server decides access.** Hiding something in React protects nothing. Public pages never receive admin fields.
- File names kebab-case. Components PascalCase. Hooks `use-*`.

## Look and words

- No em dashes, en dashes, or middots in UI text. Titles and headings have no separators (commas, dashes, middots, pipes).
- No gradients, glows, or decorative effects.
- Colors from tokens only (`bg-primary`, `bg-map-3`, `text-status-closed`). Never hex values or palette classes like `bg-blue-500`.
- Every data view: loading, empty, not available, hidden, error. Exact phrases from `docs/engineering/privacy-rules.md`, "Words on screen". Never show hidden or not available as `0`.
- The "Simulated data" label comes from the shared layout, never page by page.
- Sentence case. Numbers right-aligned with `tabular-nums`. Light and dark mode both work.

Run `npm run check:fix` after editing. The pre-commit hook runs the lint and TypeScript checks.
