---
name: ui-builder
description: Use when building or restyling any screen, section, or component. Walks through the design system in docs/engineering/design.md (tokens, Title Case, sans and mono type, 2px corners, halftone dots for data, the five states, phone first) so new UI matches the rest of the app, then hands off to /design-check.
argument-hint: "<screen or component, e.g. barangay profile page>"
---

# UI builder

What to build: $ARGUMENTS

## Steps

1. **Read the system.** `docs/engineering/design.md` in full, then `docs/engineering/frontend.md` for structure and `privacy-rules.md`, "Words on screen", for fixed phrases. If the screen shows business data, read `privacy-rules.md` in full.
2. **Say the screen's question** in one sentence, and what answers it in the first screenful. Write it in the plan.
3. **Reuse before writing.** Look in `resources/js/components/ui` (shadcn), `resources/js/components`, `resources/js/lib` (`format.ts`, `halftone.ts`), and `resources/js/hooks`. Use `FigureRow`, `DefinitionList`, `TownAtlas`, `ProvinceMap` before making anything new. A missing shadcn piece: `npx shadcn@latest add <name>`.
4. **Start from what exists.** If the screen already has a layout, keep it and change only what was asked. Otherwise sketch the layout from the patterns in design.md, "Layout": what goes in the first screen, what peeks in below, what moves into a `Sheet` on phones.
   - Read design.md, "Working on Existing Screens", before proposing additions. Check the session's explicit removals and avoid repeating headings, placeholders, or controls in helper paragraphs.
5. **Build with tokens only.**
   - Colors: token classes. Hue only for data, brass only for a choice.
   - Type: `type-*` roles. Sans for words, `font-mono tabular-nums` for numbers, `type-label` for small labels.
   - Space: `gap-section`, `px-gutter`, and the gaps in design.md, "Space".
   - Shape: the `rounded-*` scale (2px). `rounded-full` only for dots and avatars.
   - Motion: the motion tokens, behind `motion-safe:`.
   - Data on a map: same-size halftone dots from `lib/halftone.ts`, shaded by value. Preserve Home's approved scope; do not add a legend or instructions there.
6. **Write the words.** Title Case for titles, headings, buttons, tabs, badges, legend titles. Sentence case for sentences. Proper nouns right. No em dashes, en dashes, middots, or separators in titles. The year and source once per group of figures.
7. **Handle every state:** loading, empty, not available, hidden, error. Never `0` for missing.
8. **Check it running.** `composer dev`, then the page at 375px and at desktop width, in light and dark mode. Tab through it with the keyboard. Turn on reduced motion.
9. **Run `/design-check`** on the changed files and fix every must-fix finding.
10. **Run the frontend checks before finishing:** run `npm run check:fix`, `npm run types:check`, and `npm run build`. Then run `npm run check` to confirm formatting and lint are clean. `npm run check` alone does not run TypeScript, so it cannot catch unresolved names or imports.

## Done when

The screen answers its question in the first screenful, `/design-check` reports nothing to fix, and it works on a phone and a laptop in both modes.
