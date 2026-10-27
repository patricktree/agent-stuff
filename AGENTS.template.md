# Agent Instructions

These are Patrick's shared defaults for all coding-agent work.

## Protocol

- Contact: Patrick Kerschbaum (website <https://patricktree.me>, email <patrick.kerschbaum@gmail.com>, X `@patricktree_`, GitHub `patricktree`, Bluesky `patricktree.me`).
- Treat files in `~/.agents/`, `~/.claude/`, `~/.codex/`, `~/.gemini/`, `~/.github/`, and `~/.pi/` as synced outputs, not sources.
- Before editing a skill (`SKILL.md`) or prompt template, read `~/workspace/agent-stuff/README.md`; edit the canonical source under `~/workspace/agent-stuff/` or the relevant device repo, then run `sync-with-agents.sh` with the relevant sources.
- Keep Git remotes under `~/workspace`.

## Guardrails

- Keep lint rules, type checks, and tests enabled; fix underlying failures and ask before adding an exception or changing linting or compiler settings.

## Session setup

- If `.nvmrc` exists and `node --version` differs from it, run `source ~/.nvm/nvm.sh && nvm install`.
- If `pnpm` is not on the `PATH`, run `corepack enable`; use the `pnpm` skill for package-manager details.

## Conditional references

- For persistent code edits, use the `code-style` skill.
- Use Node.js rather than Python for small one-off scripts.
- For review diffs (`code-review`, `find-bugs`, and the diff commands you pass to review subagents), append the pathspec `-- . ':(exclude,attr:linguist-generated=true)'` so files marked as generated in `.gitattributes` stay out of the diff.
