# AGENTS.MD

## Agent Protocol

- Contact: Patrick Kerschbaum (website <https://patricktree.me>, email <patrick.kerschbaum@gmail.com>, X `@patricktree_`, GitHub `patricktree`, Bluesky `patricktree.me`).
- Workspace: `~/workspace`

## Skills & Prompt Templates

Before editing any skill (`SKILL.md`) or prompt template, read `~/workspace/agent-stuff/README.md`. Skills and prompt templates are centrally managed — the files you see in `~/.claude/`, `~/.pi/`, `~/.github/`, or `~/.agents/` are **synced copies or symlinks**, not the source of truth. Edits must be made in the canonical source repos (`~/workspace/agent-stuff/` or a device-specific repo) and then synced via `sync-with-agents.sh`.

## Guardrails

- Never run `sleep` with a value greater than 120 (2 min).

## Startup Checklist

- If file `.nvmrc` exists, run `source ~/.nvm/nvm.sh && nvm install` once/session.
- Before running `pnpm` commands run `corepack enable` once/session.

## Build / Test

- Run full validation (format → build → typecheck → lint → tests) when you think you are finished.
- Keep it observable (logs, panes, tails, MCP/browser tools).
- Prefer end-to-end verify; if blocked, say what's missing.

## Git

- **Never commit, amend, or push unless the user explicitly asks.**
- Append this trailer to **every** commit message:
  `Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>`
- Remotes under `~/workspace`.
- Use the `commit` skill for commit message formatting.
- Use the `safe-git-practices` skill for branching, pushing, pulling, and destructive operations.

## Coding Style Notes

- Use defensive programming ("fail fast") and type safety (TypeScript).
- Avoid complex patterns; prefer straightforward code.
- Follow existing code patterns; consistency is more important than cleverness.
- Use comments to explain "why" not "what"; code should be self-explanatory about "what".

## Language/Stack Notes

- TypeScript: use repo package manager (no swaps w/o approval); follow existing patterns.

## Tools

### node / python

- Prefer `node` (Node.js) over `python3` (Python) when directly executing small scripts or one-off code.

### pnpm

- does not require `--` before CLI options or forwarded arguments; pass them directly.

### gh

- GitHub CLI for PRs/CI/releases. Given issue/PR URL (or `/pull/5`): use `gh`, not web search.
- Examples: `gh issue view <url> --comments -R owner/repo`, `gh pr view <url> --comments --files -R owner/repo`.

### tmux

- Use only when you need persistence/interaction (debugger/server).
- Never background long-running processes (e.g. dev servers) with `&` inside a `bash` tool call — the tool waits for all child processes, so it will hang indefinitely. Use tmux instead.

### markit

- To fetch a website's content, use the `markit` skill.
