---
paths:
  - "compose.yaml"
  - "docker/**"
---

# Docker files are locked

`compose.yaml` and everything in `docker/` belong to the repository owner. Nobody else changes them, and neither does Claude.

- Do not edit, rename, or delete these files, even to fix a problem. The pre-commit hook and CI refuse such changes.
- The database not starting, a port clash, or a wrong password is fixed in the person's own `.env` (`DB_PORT`, `FORWARD_DB_PORT`, `DB_PASSWORD`) or with `composer doctor`, never in `compose.yaml`.
- Allowed Docker commands: `composer db:up`, `docker compose ps`, `docker compose logs`, `docker compose stop`. Never `docker compose down -v`, `docker volume rm`, or `docker system prune`: they delete the database.
- If the Docker setup itself looks wrong, stop and tell the person to ask the repository owner.
