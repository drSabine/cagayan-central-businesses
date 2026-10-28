---
title: "Business Registry Records"
created: "26-10-28"
updated: "26-10-28"
status: deferred
branch: "Not started"
base: staging
predecessor: "../archive/26-10-28-category-hierarchy.md"
---

# Business Registry Records

## Objective

In the user's words: put the registered businesses in the Capitol, with the range of their renewal, the BIR registration, address, owner, type, images, PDFs, computation and expiration. This is a later plan. It is written now so the Category Hierarchy plan scales toward it. Nothing here is built or authorized yet.

## Scope and Acceptance

Proposed, to be confirmed when this plan starts:

- [ ] Business records can be prepared by Staff for their assigned towns, reviewed and published by Admin or Super Admin (roadmap: 1 Prepare, 2 Review, 3 Publish).
- [ ] A business has one or more permit periods with valid from, valid until (the renewal range), a status and a source. Expiry and renewal windows are computed in SQL and defined in `metrics.md` through `/metric-builder`.
- [ ] Documents (permit, BIR registration, DTI, SEC or CDA, sanitary, fire safety, photo, other) are uploaded to a private disk, hashed, size and type limited from config, and served only through an authorized, throttled route.
- [ ] Address, owner and contact are Admin-class fields. Opening a full record writes one `record_view_logs` row first (P9).
- [ ] The public directory shows public-class fields only.
- [ ] Privacy review across P1 to P14, with sentinel tests for every new Admin field and document.

## Deferred or Excluded

- Processing permit applications, fees or issuing and renewing permits. Boundary decided on "26-10-28": the registry stores permit validity and documents as published records. Applications stay with the city's own system. `mvp-scope.md` gets a dated clarification when this plan starts.
- Computation (fees or taxes due): needs an explicit decision and a source before any design.
- Unregistered businesses and sales of any single business on screen stay out of scope.

## Decisions and Sources

Open questions for the user when this plan starts:

- What exactly is the "BIR seal"? Anything about BIR registration needs an official source and a verification date from a team member before it is written (CLAUDE.md). The BIR registration requirements are already cited in `mvp-scope.md`.
- Which document kinds are required, and who may see each one (Admin only, Staff of the assigned town)?
- Real source of the records: the Tuguegarao permit office and City Treasurer request, an import file, or manual entry (`mvp-scope.md`, "Path to real data").
- Retention, file size limits and an allowed file type list.

Design sketch, prepared by the Category Hierarchy plan (not migrations yet):

- `business_permits`: business, permit number, issued on, valid from, valid until, status enum, source.
- `business_documents`: business, kind enum, title, private path, mime, size, `sha256`, issued on, expires on, uploader, visibility class.
- `businesses`: a street address line (the barangay and point already exist). `owner_name` and `contact_number` stay Admin-class.
- `record_view_logs`: already specified in `database.md`, not yet created.
- Route name `capitol.businesses.show` is reserved. The directory built by the Category Hierarchy plan links to it.

## Change History

| Date | Change | Reason / Reference |
| :- | :- | :- |
| "26-10-28" | Deferred plan written | The user asked that the future registry shape this plan's design |

## Verification and Handoff

Not started. [Category Hierarchy and Business Directory](../archive/26-10-28-category-hierarchy.md) records what it prepared for this one.
