---
paths:
  - "resources/js/**/*.{ts,tsx}"
---

# Front end rules

- **Typed props for every page.** Declare a `Props` type that matches the PHP data object field for field. Shared shapes go in `resources/js/types/`. A page never receives a field it does not declare.
- **Use what the starter kit has first**: components in `resources/js/components/ui/` (shadcn style, Radix), layouts in `resources/js/layouts/`, hooks in `resources/js/hooks/`. Add a library only if `docs/engineering/decisions.md` names it (MapLibre through react-map-gl, Recharts, TanStack Table), and record its version there.
- **File names are kebab-case**, like the starter kit: `barangay-profile.tsx`. Pages go in `resources/js/pages/capitol/` or `resources/js/pages/public/`. Shared pieces go in `resources/js/components/map/`, `charts/`, and `privacy/`.
- **Every data view handles four states**: loading, empty, not available, hidden. "Not available" and "hidden" are never shown as `0` or as a blank. Use the exact words in `docs/engineering/privacy-rules.md`, "Words on screen".
- **A guarded sales figure** arrives as `{ state: 'shown', value }` or `{ state: 'hidden', reason }`. Render the hidden message for `hidden`. Never work out a figure from other figures in the browser.
- **No metric arithmetic in the browser.** No sums, averages, rates, ranks, or shares in React. Format only: rounding and separators as listed in `docs/engineering/metrics.md`, "Display rounding".
- **Map layers get their data from props** (GeoJSON from PostGIS through the controller). No third party tiles or data fetched at runtime: the booth demo runs offline.
- **The "Simulated data" label comes from the shared layout**, driven by the `cagayan.simulated` config value. Do not add it page by page.
- **Links and forms use Wayfinder**: import from `@/routes` or `@/actions`. Never hard-code a URL.
- Public pages show only public fields. If a public page seems to need an admin field, the design is wrong: stop and ask.
- Run `npm run check:fix` and `npm run types:check` after editing, then `composer ci:check` before committing.
