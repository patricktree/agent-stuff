---
name: markdownlint-fix
description: Auto-fix Markdown files via markdownlint-cli2. Use when you write markdown files, before handoff.
---

# Markdownlint Fix

## Quick flow

1. Identify target Markdown file path(s) changed this turn.
2. Run formatter with this skill's config:
   - `pnpm dlx markdownlint-cli2 --config /Users/pkerschbaum/.pi/agent/skills/markdownlint-fix/.markdownlint-cli2.jsonc --fix <file>`
3. Fix issues if reported.

## Notes

- Always run after writing or editing any `.md` file (including specs, docs, README, AGENTS).
- If multiple files, run once per file or pass all paths in one command.
