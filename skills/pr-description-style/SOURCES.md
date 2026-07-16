# PR Description Style Sources

## Source Inventory

| Source | Trust | Contribution | Constraints |
| --- | --- | --- | --- |
| Direct user instructions in the task that added and clarified the footer | Authoritative | Requires a `Written by @patricktree's agent (…)` footer on agent-created PRs, adapted to the current agent and model | Use known runtime identity details; do not guess unavailable values |
| Existing `SKILL.md` and local repository conventions | High | Defines reviewer-focused structure, tone, and validation reporting | Preserve pre-existing user edits |
| [pnpm PR #13063](https://github.com/pnpm/pnpm/pull/13063) | Example | Shows the requested visible attribution and placement before generated content | Treat as an example, not a universal repository convention |

## Decisions

- **Adopted:** append the attribution once as the final agent-authored visible content.
- **Adopted:** adapt the parenthetical identity to the current agent and model.
- **Adopted:** omit unavailable identity details rather than guessing them.
- **Adopted:** allow repository automation to place generated comments or content after the footer.
- **Adopted:** permit an explicit per-PR user override.

## Coverage And Gaps

- Substantive PR structure: covered by `SKILL.md`.
- Mechanical PR structure: covered by the `## Summary` exception.
- Attribution placement and deduplication: covered by `SKILL.md`.
- Open gaps: none.

Further source collection is low-yield because this is a direct personal style preference with a concrete accepted example.
