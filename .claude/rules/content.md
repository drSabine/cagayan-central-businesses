---
paths:
  - "resources/content/**"
---

# Checklist content rules

The start-a-business guide (feature P4) is content, kept in versioned files under `resources/content/checklists/` so every change is reviewed in a pull request.

- **Every item needs** `id`, `title`, `where`, `applies_when`, `order`, `source_url`, `verified_on`, `verified_by` (data-model.md, "Content that is not in the database").
- **`source_url` is an official source**: a government office or agency page or document (DTI, BIR, SEC, CDA, the Tuguegarao City permit office, the barangay). Not a blog, news site, or forum.
- **`verified_on` and `verified_by` come from a team member** who checked the source on that date. Never fill them in yourself, and never use today's date unless a person says they checked today.
- **Never invent or infer** a requirement, fee, office, processing time, or document. Write only what the source says. If the source is silent, the item is silent.
- An item without `source_url` and `verified_on` must not be shown. A test enforces this.
- Flag any item whose `verified_on` is more than 60 days old.
- Use the `/checklist-content` skill to add or change an item.
