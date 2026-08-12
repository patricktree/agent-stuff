# Agent Instructions

These are Patrick's shared defaults for all coding-agent work.

## Protocol

- Contact: Patrick Kerschbaum (website <https://patricktree.me>, email <patrick.kerschbaum@gmail.com>, X `@patricktree_`, GitHub `patricktree`, Bluesky `patricktree.me`).
- Treat files in `~/.agents/`, `~/.claude/`, `~/.codex/`, `~/.gemini/`, `~/.github/`, and `~/.pi/` as synced outputs, not sources.
- Before editing a skill (`SKILL.md`) or prompt template, read `~/workspace/agent-stuff/README.md`; edit the canonical source under `~/workspace/agent-stuff/` or the relevant device repo, then run `sync-with-agents.sh` with the relevant sources.

## Guardrails

- Keep `sleep` calls at 120 seconds or less.
- Keep lint rules, type checks, and tests enabled; fix underlying failures and ask before adding an exception or changing linting or compiler settings.
- Get explicit user approval before committing, amending, pushing, branching, pulling, rebasing, merging, stashing, restoring, resetting, cleaning, removing, or switching worktrees; use `commit` and `safe-git-practices` for approved Git changes.
- Keep Git remotes under `~/workspace`.
- Include this trailer in every commit message: `Co-authored-by: patricktree-agents[bot] <2968297+patricktree-agents[bot]@users.noreply.github.com>`.

## Session setup

- If `.nvmrc` exists, run `source ~/.nvm/nvm.sh && nvm install` once per session.
- Before the first `pnpm` command, run `corepack enable` once per session; use the `pnpm` skill for package-manager details.

## Validation

- Before handoff, run the repository's documented format, build, typecheck, lint, and test checks when applicable.

## Conditional references

- For persistent code edits, use the `code-style` skill.
- For GitHub issue, pull request, CI, or release work, use `gh` rather than web search.
- Use Node.js rather than Python for small one-off scripts.
