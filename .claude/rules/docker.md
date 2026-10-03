---
paths:
  - "compose.yaml"
  - "docker/**"
---

# Docker is shared setup

`compose.yaml` and `docker/` run the database for every teammate's laptop, and CI uses the same image. A change here reaches everyone at once, so treat it as shared setup, not feature code.

- **Change it only when the task is about Docker.** Never as a side effect of a feature.
- **Per-laptop settings go in `.env`,** not here: port clashes (`DB_PORT`, `FORWARD_DB_PORT`), passwords, database names. `compose.yaml` already reads them from `.env`.
- **Keep CI in sync.** The `postgis/postgis` image tag in `compose.yaml` and in `.github/workflows/ci.yml` must match. Read the image notes before changing the major version (decision D3).
- **Make it its own pull request** on a `chore/` branch, reviewed by the backend developer. In the description's "After merging, teammates run" line, say exactly what to run, usually `composer db:up`.
- **Never delete data:** no `docker compose down -v`, `docker volume rm`, or `docker system prune`. They wipe the local database.
