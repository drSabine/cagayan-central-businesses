# Team Rules

Three people, one month, one repository. These rules keep `main` working and keep each person unblocked.

## Who owns what

Fill in the names and GitHub usernames during kickoff. The owner decides on their area and reviews changes to it. Everyone can still work anywhere.

1. **Map and front end.** Name: ________ GitHub: ________
   Pages, components, the map, charts, the public side's look and feel.
2. **Back end, database, and metrics.** Name: ________ GitHub: ________
   Schema, metric SQL, the privacy guard, login, exports, CI and deploy.
3. **Data and content.** Name: ________ GitHub: ________
   Boundaries, population, the seeder, the start a business checklist and its sources.

Two files need two reviewers because a mistake in them reaches every screen: `docs/engineering/metrics.md` and `docs/engineering/privacy-rules.md`. The same goes for `app/Services/Privacy/`.

## Branches

- `main` is always demo ready. Nobody pushes to it directly.
- Branch from `main`, named `type/short-description`, for example `feat/c3-barangay-profile` or `fix/wish-count-refresh`.
- A branch lives one to two days. If it is getting longer, split the work.
- Update your branch from `main` before opening a pull request.

## Commits

- Conventional Commits: `type(scope): subject`.
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `data`.
- Scopes: `capitol`, `public`, `metrics`, `privacy`, `data`, `map`, `guide`, `infra`.
- Subject in the imperative, 72 characters or fewer: `feat(capitol): add barangay profile page`.
- One logical change per commit.
- No attribution trailers and no generated-by text.
- Use `/commit` in Claude Code. It runs the checks and writes the message in this format.

## Pull requests

- Small. Aim for under 400 changed lines, not counting lock files and generated files.
- One feature id or one metric id per pull request where possible.
- The title is a Conventional Commit line. It becomes the commit on `main`.
- Fill in the template. "How to check it by hand" is not optional.
- One approval from the area's owner. Two for the files named above.
- CI must be green.
- Squash merge. Delete the branch after.
- Review within one working day. A pull request waiting longer than that gets raised in the daily check-in.

## Definition of done

A feature is done when all of these hold:

1. It meets the acceptance checks written in its issue.
2. It has tests, including the privacy cases if it touches business data.
3. `composer ci:check` passes.
4. It handles loading, empty, not available, and hidden states.
5. It shows the "Simulated data" label.
6. Its wording on screen matches the phrases in `docs/engineering/privacy-rules.md`.
7. Someone other than the author clicked through it.
8. Its status is updated in `docs/team/roadmap.md`.

## Working with Claude Code

- One task per session. Start a new session for a new task, so old context does not leak into new work.
- Start from a skill: `/feature-builder C3`, `/metric-builder M10`, `/db-change add wishes table`. The skill reads the right docs first.
- Read the plan before approving it. Changing a plan is cheap. Changing merged code is not.
- When Claude Code gets something wrong twice, add the correction to `CLAUDE.md` or to the matching file in `.claude/rules/`, in the same pull request. That is how the repository gets better at this over time.
- Keep `CLAUDE.md` under 150 lines. Move detail into rules, skills, or docs.
- Decisions go in `docs/engineering/decisions.md`, not in chat.

## Daily rhythm

- A ten-minute check-in each day: what I finished, what I am doing, what blocks me.
- Friday: run `/demo-check`, look at the roadmap, cut scope if needed.
- A blocker that lasts more than half a day goes to the group chat right away.

## Things that are not allowed

- Pushing to `main`, or force pushing any shared branch.
- Editing a migration that has been merged.
- Committing `.env` files, database dumps, or real business records.
- Changing a metric definition or a privacy rule without the two-reviewer pull request.
- Adding a checklist requirement without an official source and a verification date.
- Building anything on the "Out of scope for the MVP" list in the product document.
