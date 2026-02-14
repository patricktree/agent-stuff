# AGENTS.MD

## Agent Protocol

- Contact: Patrick Kerschbaum (website <https://patricktree.me>, email <patrick.kerschbaum@gmail.com>, X `@patricktree_`, GitHub `patricktree`, Bluesky `patricktree.me`).
- Workspace: `~/workspace`

## Guardrails

- Use `trash` for deletes.

## Startup Checklist

- If file `.nvmrc` exists, run `source ~/.nvm/nvm.sh && nvm install` once/session.
- Before running `pnpm` commands run `corepack enable` once/session.

## Build / Test

- Run full validation (lint/typecheck/tests/docs/format) when you think you are finished.
- Keep it observable (logs, panes, tails, MCP/browser tools).
- Prefer end-to-end verify; if blocked, say what’s missing.

## Git

- Commit Messages: Conventional Commits (`feat|fix|refactor|build|ci|chore|docs|style|perf|test`).
- Safe by default: `git status/diff/log`. Before commit or amend, ask. Push only when user asks.
- `git checkout` ok for PR review / explicit request.
- Branch changes require user consent.
- Destructive ops forbidden unless explicit (`reset --hard`, `clean`, `restore`, `rm`, …).
- Remotes under `~/workspace`.
- Don’t delete/rename unexpected stuff; stop + ask.
- Avoid manual `git stash`; if Git auto-stashes during pull/rebase, that’s fine (hint, not hard guardrail).
- Review the last 30 commit messages before constructing a commit message.
- If user types a command (“pull and push”), that’s consent for that command.
- Big review: `git --no-pager diff --color=never`.
- Multi-agent: check `git status/diff` before edits; ship small commits.

## Coding Style Notes

- Use defensive programming ("fail fast") and type safety (TypeScript).
- Avoid complex patterns; prefer straightforward code.
- Follow existing code patterns; consistency is more important than cleverness.
- Use comments to explain "why" not "what"; code should be self-explanatory about "what".

## Language/Stack Notes

- TypeScript: use repo package manager (no swaps w/o approval); follow existing patterns.

## Tools

### pnpm

- does not require `--` before CLI options or forwarded arguments; pass them directly.

### trash

- Move files to Trash: `trash …` (system command).

### gh

- GitHub CLI for PRs/CI/releases. Given issue/PR URL (or `/pull/5`): use `gh`, not web search.
- Examples: `gh issue view <url> --comments -R owner/repo`, `gh pr view <url> --comments --files -R owner/repo`.

### tmux

- Use only when you need persistence/interaction (debugger/server).
