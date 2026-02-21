# Claude Code Instructions — decoded.finance

## Deployment Workflow

Follow these steps **in order** for every task. Do not consider a task complete until step 5 is confirmed.

1. Make all code changes on a new branch (e.g. `claude/<task-name>-<id>`)
2. Push all commits to that branch: `git push origin <branch>`
3. **Immediately open a PR** after pushing:
   ```
   gh pr create --base main --head <branch> --title "<task title>" --body "Auto-merge PR for <task description>."
   ```
4. Wait for the auto-merge GitHub Action to merge the PR into `main`
5. Confirm Cloudflare Pages production deployment is triggered before finishing

## Critical Rules

- **Never leave commits on a branch without an open PR.** If you push follow-up commits to a branch — even one that previously had a merged PR — you MUST open a new PR immediately for those new commits.
- **Do not rely on a human to open the PR for you.** You have `gh` CLI access — use it.
- **One PR per push session.** Every `git push` must be followed by a `gh pr create` if no open PR exists for that branch.
- **Check PR status before finishing.** Run `gh pr list` and confirm the PR is merged before reporting the task as done.

## Branch Naming

Use the format: `claude/<short-description>-<random-id>`

Example: `claude/ipo-tracker-upgrade-xK3mP`

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

## Project Stack

- **Framework**: Astro (static site)
- **Deployment**: Cloudflare Pages (auto-deploys on push to `main`)
- **Domain**: decoded.finance
- **Package manager**: npm
