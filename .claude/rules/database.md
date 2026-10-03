---
paths:
  - "database/**"
  - "app/Models/**/*.php"
  - "app/Enums/**/*.php"
---

# Database rules

The schema of record and the reasons: `docs/engineering/database.md`. Use the `/db-change` skill for schema changes.

- **Never edit a migration merged to `staging`.** Teammates have already run it. Check with `git log origin/staging -- <file>`. Add a new migration.
- **The schema and `database.md` change together**, with the model, enum, factory, and seeder, in one pull request.
- **Let the database enforce rules:** not null by default, `constrained()` foreign keys (restrict on delete unless the child cannot exist alone), unique constraints for business rules, `enum()` columns (a CHECK constraint on PostgreSQL).
- **Types:** PSGC codes `string(10)`. Money `decimal(16, 2)` cast `'decimal:2'`. Years `smallInteger`. Geometry SRID 4326 with `spatialIndex()`. Wrap loaded shapes in `ST_Multi`.
- **Index** every foreign key and every column in a frequent `where`, `join`, or `order by`. Not every column.
- **Models:** `#[Fillable]` and `#[Hidden]` attributes. Never-displayed fields (the sales column) go in `#[Hidden]`. `role` is never fillable. Relationships have return types. Insert-only models set `const UPDATED_AT = null;`.
- **Enums:** backed string enums, TitleCase cases, small helper methods (`isActive()`).
- **Factories** have states for the cases tests need (`->closed()`, `->inBarangay($b)`), with realistic defaults.
- **Seeders** use the fixed seed and meet every "Seeder requirement" in `database.md`. The demo admin password comes from `.env`.
- **Metric SQL** lives in `database/sql/metrics/`, one file per summary table, and takes thresholds as bindings.
- After a schema change: `composer db:reset`, then `composer ci:check`.
