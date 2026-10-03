---
name: db-change
description: Change the database schema with a new migration, and update the model, enums, factory, seeder, and data-model.md in the same change.
argument-hint: "[description of the schema change]"
disable-model-invocation: true
---

# Database change

The change to make: $ARGUMENTS

`docs/engineering/data-model.md` is the schema of record. The migration and that document change together, in one pull request, or the next session builds on a wrong picture.

## Read first

1. `docs/engineering/data-model.md`: "Conventions", "Visibility classes", the tables involved, and "Seeder requirements".
2. `docs/engineering/privacy-rules.md`, "Field classes", if the change touches `businesses`, `business_years`, `wishes`, or `record_view_logs`.
3. `database/migrations/`: what already exists. The PostGIS migration is `2026_10_03_000000_enable_postgis_extension.php`.
4. `.claude/rules/backend.md`.

## Steps

1. **Restate the change** as a list of tables and columns with types. If it differs from `data-model.md`, say exactly how, and ask before going ahead: a schema that drifts from the doc is how privacy fields leak.
2. **Write a new migration** with `php artisan make:migration <name> --no-interaction`. Never edit a migration that has been merged to `main`; check with `git log main -- database/migrations/<file>`. One migration may create several related tables.
3. **Follow the conventions:**
   - PSGC codes `string(10)`. Money `decimal(16, 2)`. Years `smallInteger`. Enums as `string` columns.
   - Geometry: `$table->geometry('boundary', subtype: 'multipolygon', srid: 4326)` (or `point`), plus `$table->spatialIndex('boundary')`. Use SRID 4326 always.
   - Foreign keys with `constrained()`. Unique constraints as listed in the doc, for example `unique(['business_id', 'year'])`.
   - Timestamps on every table unless the doc says otherwise. No soft deletes.
4. **Update everything that depends on the table, together:**
   - the model in `app/Models/`, with `#[Fillable]`, `#[Hidden]` (the sales column and every never-displayed field go here), and `casts()` for enums, decimals as strings, and dates
   - one backed enum per enum column in `app/Enums/`
   - the factory in `database/factories/`
   - the seeder in `database/seeders/`, if the table is seeded
5. **Update `docs/engineering/data-model.md`** in the same change, so the doc and the migration match.
6. **Prove it**, in order:
   1. `composer db:reset` (fresh migrate, seed, and metrics refresh)
   2. `php artisan metrics:refresh`
   3. `composer ci:check`
7. **Say which summary tables are affected** (`stats_area_year`, `stats_type_cohort`, `stats_outlook`), and which metrics may need a `/metric-builder` follow-up.

## Done when

A new migration exists, the model, enums, factory, and seeder match it, `data-model.md` matches it, `composer db:reset` and `composer ci:check` pass, and the person knows which summary tables are affected.
