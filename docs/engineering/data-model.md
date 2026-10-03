# Data Model

The schema for the MVP. Field names follow the city's business permit application so real records can replace simulated ones without a rebuild.

Change the schema only through a migration plus an edit to this file in the same pull request.

## Conventions

- **Geometry:** PostGIS `geometry` columns, SRID 4326 (plain longitude and latitude). For any area or distance, cast to `geography`.
- **Codes:** PSGC codes are strings of 10 digits, never integers, because they can start with zero.
- **Money:** `decimal(16, 2)` in the database. In PHP, handle as strings or with a decimal library, never as floats.
- **Years:** `smallint`.
- **Enums:** a string column in the database, a backed enum in PHP.
- **Timestamps:** every table has `created_at` and `updated_at` unless noted.
- **Deletes:** no soft deletes in the MVP.

## Visibility classes

Every field on a business belongs to exactly one class. The class decides which data object may carry it. See `privacy-rules.md`.

- **Public:** anyone may see it.
- **Admin:** logged-in Capitol administrators only.
- **Never displayed:** stored and used in calculations, never shown for a single business to anyone.

## Tables

### municipalities

The cities and municipalities of Cagayan. All of them appear on the province map. Only connected ones have data.

- `id`
- `psgc_code` string(10), unique
- `name` string
- `kind` enum: `city`, `municipality`
- `is_connected` boolean, default false. True for Tuguegarao City only in the MVP. Others are drawn grey and labeled "not yet connected".
- `boundary` geometry(MultiPolygon, 4326), nullable until loaded, spatial index

### barangays

- `id`
- `municipality_id` foreign key
- `psgc_code` string(10), unique
- `name` string
- `urban_rural` enum: `urban`, `rural`. From the PSA listing. This is the peer group.
- `population` integer. From the 2024 census.
- `population_year` smallint
- `boundary` geometry(MultiPolygon, 4326), spatial index

Tuguegarao City's PSGC code is `0201529000`. It has 49 barangays.

The shapes for both tables are in `data/boundaries/`. A seeder loads them by `psgc_code`. Wrap each geometry with `ST_Multi`, since some features are plain polygons.

### business_types

The list a resident picks from and the level every breakdown uses. Friendly names on top, PSIC grouping underneath.

- `id`
- `code` string, unique, a short slug such as `pharmacy`
- `name` string, such as "Pharmacy"
- `psic_section` char(1), the PSIC section letter
- `psic_section_name` string
- `sort_order` smallint

Aim for 25 to 35 types that a resident would recognize: sari-sari store, grocery, pharmacy, hardware store, coffee shop, restaurant, bakery, salon or barbershop, repair shop, boarding house, bank or lending, clinic, tutorial center, and so on. Check each type's PSIC section against the PSA classification before seeding.

### businesses

One row per registered business.

Public fields:

- `id`
- `business_name` string
- `business_type_id` foreign key
- `description` string(280), a brief description
- `year_established` smallint, the year first registered
- `barangay_id` foreign key
- `location` geometry(Point, 4326), spatial index. Must fall inside the barangay's boundary.

Admin fields:

- `owner_name` string
- `contact_number` string
- `ownership_type` enum: `sole_proprietorship`, `partnership`, `corporation`, `cooperative`
- `size_category` enum: `micro`, `small`, `medium`
- `employee_count` integer

System fields:

- `is_simulated` boolean, default true
- `source` string, nullable. Where the record came from once real data arrives.

### business_years

One row per business per year. This table is the history that every trend, survival rate, and outlook reads.

- `id`
- `business_id` foreign key
- `year` smallint
- `status` enum: `new`, `renewed`, `not_renewed`, `closed`
- `declared_gross_sales` decimal(16, 2), nullable. **Never displayed.** Present only when the status is `new` or `renewed`.
- unique on (`business_id`, `year`)

Status rules. The seeder must follow them and a test must check them:

1. A business established in or after the first data year has its first row in `year_established`, with status `new`. A business established before the first data year has its first row in the first data year, with status `renewed`.
2. Each later row is `renewed`, `not_renewed`, or `closed`.
3. After `not_renewed` or `closed`, the business has no further rows.
4. **Active in a year** means the status that year is `new` or `renewed`.
5. Every business active in one year has a row the next year, unless that next year is beyond the latest data year.

Two checks follow from these rules, for every year after the first data year, and are worth a test each:

- Active this year = active last year, plus new, minus not renewed, minus closed.
- Renewed + not renewed + closed this year = active last year.

### wishes

What residents say their town lacks. No name and no contact are collected.

- `id`
- `municipality_id` foreign key
- `business_type_id` foreign key
- `reason` string(280), nullable. Shown to administrators only.
- `dedupe_hash` string(64). A one-way hash of a server secret, the date, the network address, the town, and the type. It blocks repeat submissions on the same day without storing the address.
- `created_at`

### record_view_logs

Written every time an administrator opens a full business record. Insert only. No updates, no deletes.

- `id`
- `user_id` foreign key
- `business_id` foreign key
- `viewed_at` timestamp

### users

From the starter kit, plus:

- `role` enum: `capitol_admin`. One value in the MVP.

## Summary tables

Rebuilt by `php artisan metrics:refresh`. Never edited by hand and never written by request code. Prefix them `stats_` so they are easy to spot.

### stats_area_year

The base grain. Every count and sales figure on screen rolls up from here.

- `barangay_id`
- `business_type_id`
- `size_category`
- `year`
- `active_count`, `new_count`, `renewed_count`, `not_renewed_count`, `closed_count`
- `declared_sales_total` decimal(18, 2)
- `declared_sales_max_single` decimal(16, 2). The largest single business's sales in this cell. Needed for the dominance rule. When cells are rolled up, take the maximum.
- unique on (`barangay_id`, `business_type_id`, `size_category`, `year`)

### stats_type_cohort

Survival by business type, city wide.

- `municipality_id`
- `business_type_id`
- `cohort_year`
- `cohort_size`
- `survived_1y`, nullable when the following year has no data yet
- `survived_2y`, nullable when the second year has no data yet

### stats_outlook

One row per barangay per target year, including past target years used for the backtest.

- `barangay_id`
- `target_year`
- `businesses_low`, `businesses_mid`, `businesses_high`
- `sales_low`, `sales_mid`, `sales_high`
- `is_backtest` boolean. True when the target year already has real figures to compare against.

Backtest error is computed from this table and shown beside every projection.

## Content that is not in the database

The start a business checklist is content, not data. It lives in versioned files under `resources/content/checklists/` so every change is reviewed in a pull request.

Each checklist item has:

- `id`, a stable slug
- `title`
- `where`, the office or site that issues it
- `applies_when`, the answers to the four questions that make this item apply
- `order`, its position in the sequence
- `source_url`, the official source
- `verified_on`, the date a team member last checked the source
- `verified_by`, who checked

An item without `source_url` and `verified_on` must not be shown. A test enforces this.

## Seeder requirements

The simulated dataset has to make the demo walkthrough work every time. With the fixed seed, it must contain:

1. All 49 barangays with real names, real urban or rural class, and real 2024 population.
2. All Cagayan municipalities as shapes, with only Tuguegarao connected.
3. Seven years of history, 2020 through 2026.
4. More businesses in dense urban barangays than in rural ones, so the map is not flat.
5. At least one barangay with fewer than 5 active businesses, to show the small-group rule.
6. At least one barangay where one business exceeds the dominance threshold, to show the dominance rule.
7. At least one barangay and one business type with non-renewals rising two years in a row, to show an early warning.
8. At least one barangay clearly below its peer median.
9. Every business point inside its barangay's boundary.
10. Wishes for several business types, with at least one type that is wished for often and rarely registered.
11. One administrator account for the demo, with the password taken from `.env`, not written in code.

Write a test for items 5 through 9 so a change to the seeder cannot silently break the demo.
