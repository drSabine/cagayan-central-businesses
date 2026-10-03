---
name: commit
description: Make one clean, scoped Conventional Commit of the current changes after running the checks. Never pushes.
argument-hint: "[optional hint about what changed]"
disable-model-invocation: true
allowed-tools: Bash(git status*) Bash(git diff*) Bash(git log*) Bash(git branch*) Bash(git add *) Bash(git commit *) Bash(composer ci:check)
---

# Commit

Make exactly one commit that a teammate can read in the log and understand. Hint from the person, if any: $ARGUMENTS

The commit format comes from `docs/team/team-rules.md`, "Commits". `main` is protected and squash-merged, so every commit lives on a branch.

## Steps

1. **Check the branch.** Run `git branch --show-current`. If it is `main`, stop. Offer a branch name in the form `type/short-description` (for example `feat/c3-barangay-profile`) and create it only when the person agrees.
2. **Read what changed.** Run `git status` and `git diff` (and `git diff --staged`). If the changes are more than one logical change, for example a migration plus an unrelated page fix, propose how to split them into separate commits and wait for an answer.
3. **Run the gate.** Run `composer ci:check`, unless only documentation (`*.md`) changed. If it fails, stop and show the failure. Do not commit around a red check: `main` must stay demo ready and CI runs the same command.
4. **Stage named files only.** Use `git add <path> <path>`, never `git add .` or `git add -A`. Never stage `.env` or any `.env.*` except `.env.example`, `public/build/`, `node_modules/`, `vendor/`, database dumps, or real business records.
5. **Write the message.**
   - Subject: `type(scope): subject`, imperative, lower case after the colon, 72 characters or fewer, no period. Example: `feat(capitol): add barangay profile page`.
   - Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `data`.
   - Scopes: `capitol`, `public`, `metrics`, `privacy`, `data`, `map`, `guide`, `infra`.
   - Body only when the reason is not obvious from the subject. Then say why, not what. Mention the feature or metric id (C3, M10) when there is one.
6. **No trailers of any kind.** No `Co-Authored-By` line for an AI, no "Generated with" line, no session link. The project turned attribution off in `.claude/settings.json`, and `.githooks/commit-msg` strips such lines as a backstop, but the message must not contain them in the first place.
7. **Commit** with `git commit -m "<subject>"` (add `-m "<body>"` for a body). Show the result of `git log --oneline -1`.
8. **Never push.** Pushing and the pull request are `/open-pr`.

## Done when

One commit exists on a non-`main` branch, `composer ci:check` passed before it (or only docs changed), and `git log -1` shows a subject in the format above with no trailers.
