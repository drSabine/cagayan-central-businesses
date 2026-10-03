---
name: demo-check
description: Prove the ten-step demo walkthrough works end to end before recording the video and before the booth.
disable-model-invocation: true
---

# Demo check

The video and the booth both follow the ten-step "Demo walkthrough" in `docs/product/mvp-scope.md`. This check proves each step works on a freshly reset database, the way a clean laptop would run it. Run it every Friday and before recording.

## Steps

1. **Reset**: `composer db:reset`. It runs a fresh migrate, the seeder with its fixed seed, and `metrics:refresh`. If it fails, stop: nothing after this is meaningful.
2. **Build the assets**: `npm run build`. The booth laptop may run without Vite.
3. **Doctor**: `composer doctor`. Every check must pass.
4. **Read the walkthrough** in `docs/product/mvp-scope.md` and the seeder requirements in `docs/engineering/data-model.md`.
5. **For each of the ten steps**, check two things:
   - **The route responds.** Find it with `php artisan route:list --except-vendor`. Call it as the right user: Capitol steps as the demo administrator (`DEMO_ADMIN_EMAIL` in `.env`), public steps logged out. Use a Pest test, or `composer dev` and the browser. Expect 200, not 404, 500, or a redirect to login.
   - **The data the step needs exists.** For example:
     - Step 1: headline numbers and the "Simulated data" label
     - Step 2: Tuguegarao shaded by sales, rankings with movers
     - Step 3: a dominance panel with a leading type
     - Step 5: a barangay whose sales are hidden by the small-group rule
     - Step 6: an outlook range with backtest error, and at least one early warning flag
     - Step 7: wishes beside peer comparison, a full record with owner contact (and a new view log row), a PDF brief
     - Step 8: public sales as bands only, a listing with no owner fields
     - Step 9: submitting a wish increases the count
     - Step 10: a checklist for a coffee shop with verified sources, and greyed-out towns
     Use `php artisan tinker --execute '...'` or a read-only query for the data checks.
6. **Report pass or fail per step**, in a table: step, route, result, and for each failure the reason and which feature or seeder requirement is missing (by id, for example C9 or seeder item 6).

## Done when

All ten steps have a pass or fail with a reason, on a database reset in this run. A step that cannot be checked yet because its feature is not built counts as fail, with the feature id named.
