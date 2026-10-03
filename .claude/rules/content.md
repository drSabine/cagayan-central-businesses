---
paths:
  - "resources/content/**"
---

# Checklist content rules

The start-a-business guide (feature P4) is content in versioned files under `resources/content/checklists/`, so every change is reviewed. Use the `/checklist-content` skill.

- **Every item has** `id`, `title`, `where`, `applies_when`, `order`, `source_url`, `verified_on`, `verified_by` (`docs/engineering/database.md`, "Content outside the database").
- **`source_url` is official:** a government office or agency page or document (DTI, BIR, SEC, CDA, the Tuguegarao City permit office, the barangay). Not a blog, news site, or forum.
- **`verified_on` and `verified_by` come from a team member** who checked the source on that date. Never fill them in yourself.
- **Never invent or infer** a requirement, fee, office, processing time, or document. Write only what the source says.
- An item without `source_url` and `verified_on` is never shown. A test enforces this.
- Flag any item whose `verified_on` is more than 60 days old.
- Item titles follow `docs/engineering/design.md`: sentence case, no separators.
