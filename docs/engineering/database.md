# Database

The schema of record, and the rules for changing it. A good schema keeps the data correct on its own, makes the metrics simple SQL, and makes privacy enforceable. Read this before any migration, model, factory, or seeder.

Field names follow the city's business permit application, so real records can replace simulated ones without a rebuild.

Change the schema only with a new migration plus an edit to this file, in the same pull request. Use the `/db-change` skill.

## Engine

PostgreSQL 17 with PostGIS 3.5, in Docker (`compose.yaml`). Two databases: `cagayan_business` for development and `cagayan_business_test` for tests. Tests never use SQLite, because spatial queries and the metric SQL must be tested for real.

## Schema rules

### Let the database enforce the rules

- **Not null by default.** A column is nullable only when "unknown" is a real state, and this file says why.
- **Foreign keys on every reference**, with `constrained()`. Default `restrictOnDelete()`. Use `cascadeOnDelete()` only for rows that cannot exist without their parent (`business_years` under `businesses`).
- **Unique constraints mirror business rules.** One row per business per year is `unique(['business_id', 'year'])`, not a check in PHP.
- **Enum columns** use `$table->enum()`. On PostgreSQL that is a string column with a CHECK constraint, so bad values cannot get in from a seeder or raw SQL. The model casts it to a backed PHP enum in `app/Enums/`.
- **Insert-only tables** (`record_view_logs`) have no `updated_at` and are never updated or deleted by app code.

### Types

| Data | Column | PHP |
| :- | :- | :- |
| PSGC code | `string(10)`, never an integer (codes can start with zero) | `string` |
| Money | `decimal(16, 2)`, sums in `decimal(18, 2)` | `string` via `'decimal:2'` cast, never `float` |
| Year | `smallInteger` | `int` |
| Enum | `enum()` (string with CHECK) | backed enum |
| Area shape | `geometry('boundary', subtype: 'multipolygon', srid: 4326)` | string (WKB) or GeoJSON from SQL |
| Point | `geometry('location', subtype: 'point', srid: 4326)` | same |
| Timestamps | `timestamps()` on every table unless noted | `CarbonImmutable` |

- Geometry is always SRID 4326 (longitude, latitude). Cast to `geography` for any area or distance in meters.
- Loaded shapes are wrapped with `ST_Multi`, since some features are plain polygons.
- No soft deletes in the MVP.

### Indexes

An index exists for every foreign key, every column used in a frequent `where`, `join`, or `order by`, and every geometry column (GiST, via `spatialIndex()`). Add an index in the same migration as the query that needs it.

Do not index everything. Each index slows writes and takes space. At about 4,000 businesses, a plain btree is enough for name search. Add `pg_trgm` only if search gets slow.

### Migrations

- Create with `php artisan make:migration <name> --no-interaction`.
- **Never edit a migration that has been merged to `staging`.** Teammates have already run it. Add a new one.
- One migration may create several related tables.
- `down()` reverses `up()`. If it cannot (data would be lost), say so in a one-line comment.
- After a schema change: `composer db:reset`, then `composer ci:check`.

### Related files change together

A schema change also updates, in the same pull request:

1. the model (`#[Fillable]`, `#[Hidden]`, `casts()`, relationships)
2. the enum in `app/Enums/`
3. the factory, with states for the cases tests need
4. the seeder, if the table is seeded
5. this file

## Visibility classes

Every field on a business belongs to exactly one class. The class decides which Data object may carry it. See `privacy-rules.md`.

- **Public:** anyone may see it.
- **Admin:** logged-in Capitol administrators only.
- **Never displayed:** stored and used in calculations, never shown for a single business to anyone. Always in the model's `#[Hidden]`.

## Tables

### municipalities

The cities and municipalities of Cagayan. All appear on the province map. Only connected ones have business data.

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `psgc_code` | string(10) | unique |
| `name` | string | |
| `kind` | enum `city`, `municipality` | |
| `is_connected` | boolean, default false | True for Tuguegarao City only in the MVP. Others are drawn grey as "Not yet connected". |
| `boundary` | geometry(MultiPolygon, 4326), nullable | Nullable until loaded. Spatial index. |

`MunicipalitySeeder` reads codes, names, and kinds from `data/boundaries/cagayan-municipalities.geojson`. The shapes are loaded with roadmap F2.

### barangays

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `municipality_id` | foreign key | indexed |
| `psgc_code` | string(10) | unique |
| `name` | string | |
| `urban_rural` | enum `urban`, `rural` | From the PSA listing. This is the peer group. |
| `population` | integer | 2024 census |
| `population_year` | smallint | |
| `boundary` | geometry(MultiPolygon, 4326) | Spatial index |

Index `(municipality_id, urban_rural)` for peer groups. Tuguegarao City is PSGC `0201529000` with 49 barangays. Shapes are in `data/boundaries/` and load by `psgc_code`.

### business_types

The list a resident picks from and the level every breakdown uses. Friendly names on top, PSIC grouping underneath.

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `code` | string | unique, a slug such as `pharmacy` |
| `name` | string | "Pharmacy" |
| `psic_section` | char(1) | PSIC section letter |
| `psic_section_name` | string | |
| `sort_order` | smallint | |

Aim for 25 to 35 types a resident would recognize: sari-sari store, grocery, pharmacy, hardware store, coffee shop, restaurant, bakery, salon or barbershop, repair shop, boarding house, bank or lending, clinic, tutorial center. Check each PSIC section against the PSA classification before seeding.

`BusinessTypeSeeder` holds a starter list of 25. Its PSIC sections are not yet verified by the data member.

### businesses

One row per registered business.

| Column | Type | Class | Notes |
| :- | :- | :- | :- |
| `id` | id | Public | |
| `business_name` | string | Public | |
| `business_type_id` | foreign key | Public | indexed |
| `description` | string(280) | Public | |
| `year_established` | smallint | Public | Year first registered |
| `barangay_id` | foreign key | Public | indexed |
| `location` | geometry(Point, 4326) | Public | Spatial index. Must fall inside the barangay. |
| `owner_name` | string | Admin | |
| `contact_number` | string | Admin | |
| `ownership_type` | enum `sole_proprietorship`, `partnership`, `corporation`, `cooperative` | Admin | |
| `size_category` | enum `micro`, `small`, `medium` | Admin | |
| `employee_count` | integer | Admin | |
| `is_simulated` | boolean, default true | System | |
| `source` | string, nullable | System | Where the record came from once real data arrives |

### business_years

One row per business per year. Every trend, survival rate, and outlook reads this history.

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `business_id` | foreign key, cascade on delete | |
| `year` | smallint | |
| `status` | enum `new`, `renewed`, `not_renewed`, `closed` | |
| `declared_gross_sales` | decimal(16, 2), nullable | **Never displayed.** Present only when status is `new` or `renewed`. In `#[Hidden]`. Read only by `database/sql/metrics/`. |

Unique `(business_id, year)`. Index `(year, status)`.

Status rules. The seeder follows them and a test checks them:

1. A business established in or after the first data year has its first row in `year_established`, status `new`. A business established earlier has its first row in the first data year, status `renewed`.
2. Each later row is `renewed`, `not_renewed`, or `closed`.
3. After `not_renewed` or `closed`, there are no further rows.
4. **Active in a year** means status `new` or `renewed`.
5. Every business active in one year has a row the next year, unless that year is past the latest data year.

Two checks follow, for every year after the first, each worth a test:

- Active this year = active last year + new - not renewed - closed.
- Renewed + not renewed + closed this year = active last year.

### wishes

What residents say their town lacks. No name, no contact, no network address.

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `municipality_id` | foreign key | |
| `business_type_id` | foreign key | |
| `reason` | string(280), nullable | Shown to administrators only, and to the browser that wrote it |
| `submitter_hash` | string(64) | SHA-256 of the anonymous browser token in the `wish_submitter` cookie (decisions.md, D21). Never the token itself, never a network address. |
| `created_at`, `updated_at` | timestamps | `updated_at` changes on an edit |

Index `(municipality_id, business_type_id)` for counts, and `(submitter_hash, created_at)` for the cooldown. The cooldown and edit checks run under a cache lock per `submitter_hash`, so two quick requests cannot both pass.

### wish_edits

One row per edit of a wish, so the weekly edit limit can be counted. Insert only.

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `wish_id` | foreign key, cascade on delete | |
| `edited_at` | timestamp | no `created_at` or `updated_at` |

Index `(wish_id, edited_at)`.

### record_view_logs

Written every time an administrator opens a full business record. Insert only.

| Column | Type | Notes |
| :- | :- | :- |
| `id` | id | |
| `user_id` | foreign key | restrict on delete |
| `business_id` | foreign key | restrict on delete |
| `viewed_at` | timestamp | no `created_at` or `updated_at` |

Index `(business_id, viewed_at)`.

### users

Laravel's default `users` table (two-factor columns dropped, decisions.md O8), plus:

| Column | Type | Notes |
| :- | :- | :- |
| `role` | enum `capitol_admin`, nullable | One value in the MVP. Not fillable. Null means the account cannot sign in and reaches nothing on the Capitol side. |

## Summary tables

Rebuilt by `php artisan metrics:refresh` from the SQL in `database/sql/metrics/`. Never edited by hand and never written by request code. Prefixed `stats_`.

### stats_area_year

The base grain. Every count and sales figure on screen rolls up from here.

- `barangay_id`, `business_type_id`, `size_category`, `year`
- `active_count`, `new_count`, `renewed_count`, `not_renewed_count`, `closed_count`
- `declared_sales_total` decimal(18, 2)
- `declared_sales_max_single` decimal(16, 2). The largest single business's sales in the cell, for the dominance rule. When rolling up cells, take the maximum.
- unique `(barangay_id, business_type_id, size_category, year)`, index `(year, barangay_id)`

### stats_type_cohort

Survival by business type, city wide.

- `municipality_id`, `business_type_id`, `cohort_year`, `cohort_size`
- `survived_1y`, nullable when the following year has no data
- `survived_2y`, nullable when the second year has no data

### stats_outlook

One row per barangay per target year, including past target years for the backtest.

- `barangay_id`, `target_year`
- `businesses_low`, `businesses_mid`, `businesses_high`
- `sales_low`, `sales_mid`, `sales_high`
- `is_backtest` boolean. True when the target year already has real figures.

## Content outside the database

The start-a-business checklist is content, kept in versioned files under `resources/content/checklists/` so every change is reviewed. Each item has `id`, `title`, `where`, `applies_when`, `order`, `source_url`, `verified_on`, `verified_by`. An item without `source_url` and `verified_on` is never shown, and a test enforces it.

## Seeder requirements

The simulated dataset must make the demo walkthrough work every time. With the fixed seed it contains:

1. All 49 barangays with real names, urban or rural class, and 2024 population.
2. All Cagayan municipalities as shapes, with only Tuguegarao connected.
3. Seven years of history, 2020 through 2026.
4. More businesses in dense urban barangays than rural ones.
5. At least one barangay with fewer than 5 active businesses (small-group rule).
6. At least one barangay where one business exceeds the dominance threshold.
7. At least one barangay and one business type with non-renewals rising two years in a row (early warning).
8. At least one barangay clearly below its peer median.
9. Every business point inside its barangay's boundary.
10. Wishes for several types, with at least one type wished for often and rarely registered.
11. One administrator for the demo, with the password from `.env`, never in code.

Items 5 through 9 each have a test, so a seeder change cannot silently break the demo.
