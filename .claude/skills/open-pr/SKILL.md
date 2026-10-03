---
name: open-pr
description: Push the current branch and open a pull request with the template filled in, so a teammate can review it in ten minutes.
argument-hint: "[feature or metric id, e.g. C3 or M10]"
disable-model-invocation: true
allowed-tools: Bash(git status*) Bash(git diff*) Bash(git log*) Bash(git branch*) Bash(git push -u origin *) Bash(gh pr create *) Bash(gh pr view *) Bash(composer ci:check)
---

# Open a pull request

Feature or metric id from the person, if given: $ARGUMENTS

Rules for pull requests are in `docs/team/team-rules.md`, "Pull requests". The template is `.github/pull_request_template.md`.

## Steps

1. **Check the branch.** `git branch --show-current` must not be `main`. If there are uncommitted changes, stop and suggest `/commit` first.
2. **Check the size.** `git diff --stat origin/main...HEAD`. Aim for under 400 changed lines, not counting lock files and generated files. If it is much larger, say so and suggest how to split it before continuing.
3. **Run the gate.** `composer ci:check` must pass. CI runs the same command and the pull request cannot merge while it is red.
4. **Push.** `git push -u origin <branch>`. Never force push.
5. **Title.** One Conventional Commit line, `type(scope): subject`, 72 characters or fewer. Squash merge turns the title into the commit on `main`, so it must stand alone. CI checks this format.
6. **Body.** Read `.github/pull_request_template.md` and fill every section from the actual diff and commits:
   - what changed and why, with the feature or metric id
   - how to check it by hand: exact URL, login, clicks, and what the person should see. This is not optional.
   - screenshots needed for anything visual: say which, and ask the person to attach them
   - the checklist, ticked only where it is true. For the privacy items, walk the review checklist at the end of `docs/engineering/privacy-rules.md` and answer each question.
7. **No generated-by footer** and no AI attribution anywhere in the body.
8. **Create it** with `gh pr create --base main --title "<title>" --body-file <file>`. Write the body to a temporary file first so line breaks survive PowerShell. Print the link from the output.
9. If the feature finished, remind the person that `docs/team/roadmap.md` should show it as Done in this pull request.

## Done when

The branch is pushed, a pull request exists against `main` with a Conventional Commit title and a fully filled template, and its link is shown.
