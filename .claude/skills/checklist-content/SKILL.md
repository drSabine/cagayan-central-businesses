---
name: checklist-content
description: Add or update one item in the start-a-business guide, from an official source the person supplies, with its verification date.
argument-hint: "[what the item is, e.g. barangay business clearance for a storefront]"
disable-model-invocation: true
---

# Checklist content

Item to add or change: $ARGUMENTS

The guide tells a real person what to bring to a government office. A wrong requirement costs them a wasted trip, and an invented one damages the project in front of the judges. So nothing goes in without an official source checked by a team member.

## Read first

1. `.claude/rules/content.md`.
2. `docs/engineering/data-model.md`, "Content that is not in the database": the fields every item has.
3. `docs/product/mvp-scope.md`, feature P4 and "Verification findings", section 4, for the sources the team already has.
4. The existing files in `resources/content/checklists/`, if any, to match their format and avoid duplicate ids.

## Steps

1. **Ask the person for**, and do not continue without:
   - the official source link (a government page or document)
   - the date they checked it
   - their name, for `verified_by`
   If they only have a document with no link, ask how it should be cited. Do not substitute a link you found yourself.
2. **Read the source** if it can be fetched. Write only what it says: the requirement, the office (`where`), and any condition. Never add a fee, processing time, office, or document from memory or from another town. If the source does not say something, leave it out.
3. **Fill every field**: `id` (stable slug, never reused), `title`, `where`, `applies_when` (in terms of the four questions: ownership, activity, premises, employees), `order`, `source_url`, `verified_on` (the date the person gave, `YYYY-MM-DD`), `verified_by`.
4. **Check the order**: the item's place in the sequence must make sense next to the others (for example the business name registration comes before the barangay clearance).
5. **List stale items**: every item in `resources/content/checklists/` whose `verified_on` is more than 60 days before today. Show them so the person can recheck them.
6. Run `composer ci:check`. The content test rejects any item without `source_url` and `verified_on`.

## Done when

The item has all eight fields, its text matches the source, the source and date came from the person, stale items are listed, and `composer ci:check` passes.
