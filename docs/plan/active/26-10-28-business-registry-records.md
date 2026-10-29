---
title: "Business Registry Records"
created: "26-10-28"
updated: "26-10-29"
status: in-progress
branch: "feat/business-registry"
base: staging
predecessor: "../archive/26-10-28-category-hierarchy.md"
---

# Business Registry Records

## Objective

In the user's words: put the registered businesses in the Capitol, with the range of their renewal, the BIR registration, address, owner, type, images, PDFs, computation and expiration. On 26-10-29 the user added a seeded presentation set with obvious business trends and a colored simulated indicator, a profile-style record ("like LinkedIn, but formal"), a form with a map pin, and a public view that engages residents and owners.

## Scope and Acceptance

Agreed 26-10-29 (D40, D41):

- [x] Staff add and edit records for their assigned towns, with Save Draft or Submit for Review. Admin and Super Admin approve, or return for resubmission with a required reason. Editing an approved record sends it back for review.
- [x] Form: business, business contact (public), owner, DTI SEC or CDA registration, TIN and RDO, business permit, documents; Town, Barangay, street address and a MapLibre pin, checked inside the barangay with PostGIS. No geocoder.
- [x] Permits per year (`business_permits`) and M32 Permit Status in SQL.
- [x] Documents on the private disk with SHA-256, type and size limits from config, served through an authorized, throttled route to Admins and Staff of the town.
- [x] Full record view writes one `record_view_logs` row first (P9). TIN masked.
- [x] BIR Registered badge: our own badge when an approved record has a COR on file.
- [x] Public directory and profile: approved records only (P15), public fields plus business contact, storefront pins only, local filters.
- [x] Presentation seeder: food near schools and online businesses grow every year, one barangay declines (requirement 7), records in every review state, permits and placeholder documents; amber Simulated data tag.
- [ ] Browser check at desktop and 375px, light and dark, and the Staff to Admin walkthrough.
- [ ] Privacy review across P1 to P15.

## Deferred or Excluded

- Processing permit applications, fees or issuing and renewing permits stays with the city. Computation of fees or taxes needs a decision and a source.
- Pending-change versioning: an edit to an approved record withdraws it from public view until it is approved again.
- Live BIR verification and the owner's government ID number. The BIR badge is not a tax compliance claim.
- Prefilling the wish form from a barangay, and a "Growing Here" panel from M28, proposed for the public view.

## Decisions and Sources

- D40 Business Registry and D41 Contact Number Formats in `decisions.md`; P15 and the field classes in `privacy-rules.md`; M32 in `metrics.md`; "Business Registry" in `design.md`.
- BIR: RR 15-2024 (COR at the place of business), RMC 38-2026 (Registration Seal Badge), RMC 113-2026 (online posting suspended on 26-10-26). Secondary sources are cited in `mvp-scope.md`; a team member still verifies the official texts.
- Document kinds follow the Tuguegarao new permit list in `mvp-scope.md`, section 4. RDO 013 is Tuguegarao.

## Change History

| Date | Change | Reason / Reference |
| :- | :- | :- |
| "26-10-28" | Deferred plan written | The user asked that the future registry shape this plan's design |
| "26-10-29" | Plan started and approved with the user's answers: public name, badges and business contact; Staff prepare and Admins review; pin first; own BIR badge; trend story; permit, DTI SEC CDA, TIN and RDO fields | User request for the seeded presentation set and the Registered Businesses UI |
| "26-10-29" | Slices 1 to 4 built: schema and seeder, Capitol record and review, form with pin and uploads, public directory and profile | This branch |

## Verification and Handoff

26-10-29: the seeder, directory, profile, form and public test files pass. The full PHP suite passed 324 of 325 before the type count fix; the taxonomy test then passed. PHPStan reports no errors. `npm run check`, `npm run types:check` and `npm run build` pass. The browser check and privacy review are still open.
