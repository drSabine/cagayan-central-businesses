---
name: design-check
description: Use before committing a change to pages, components, layouts, CSS, or UI text. Checks the diff against docs/engineering/design.md (writing rules, no gradients, tokens, states, routes and auth behavior) and reports findings with file and line.
argument-hint: "[optional file list]"
---

# Design check

Scope given by the person, if any: $ARGUMENTS. Otherwise the changed files under `resources/js/` and `resources/css/` in `git diff origin/staging...HEAD` and `git diff`.

## Steps

1. **Read `docs/engineering/design.md`** in full, and `privacy-rules.md`, "Words on screen".
2. **Search the changed files** for each of these. Report every hit with file and line:
   - em dash `—`, en dash `–`, or middot `·` in any UI string
   - a title, heading, `<Head title>`, breadcrumb label, or tab label joining parts with a comma, dash, middot, or pipe
   - `gradient` in a class (`bg-gradient-*`, `from-*`, `via-*`, `to-*`) or in CSS (`linear-gradient`, `radial-gradient`)
   - raw colors: hex values, `rgb(`, or palette classes like `bg-blue-500`, `text-red-600` instead of tokens
   - Title Case labels where sentence case is the rule, exclamation marks, or emoji in UI text
   - a hard-coded URL instead of a Wayfinder import, or `<a href>` for in-app navigation
   - a data view missing one of its states: loading, empty, not available, hidden, error
   - "not available" or "hidden" rendered as `0`, a dash, or blank
   - a page with business data that does not use the shared layout with the "Simulated data" label
   - icon-only buttons without `aria-label`, inputs without a visible label
   - a component that only wraps one element or passes props through, or a new file for markup used once
3. **Check behavior by reading the routes and pages:** filters and tabs in the URL, redirect and toast after a write, guests sent to login on Capitol pages, public pages without admin fields.
4. **Report** findings grouped as must fix (breaks a written rule) and should fix (polish). With no findings, say which checks ran.
5. **Fix only when asked.**

## Done when

Every check above has run on the changed files and each finding has a file and line.
