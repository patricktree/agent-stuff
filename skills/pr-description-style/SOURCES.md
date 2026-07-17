# PR Description Style Sources

## Source Inventory

| Source | Trust | Contribution | Constraints |
| --- | --- | --- | --- |
| Direct user instructions that added and corrected this style | Authoritative | Requires prose without hard wrapping, top-positioned `Closes #<number>` linkage when applicable, and a `Written by @patricktree's agent (…)` footer adapted to the current agent and model | Use known runtime identity details; do not guess unavailable values |
| Existing `SKILL.md` and local repository conventions | High | Defines reviewer-focused structure, tone, and validation reporting | Preserve pre-existing user edits |
| [pnpm PR #13063](https://github.com/pnpm/pnpm/pull/13063) | Example | Shows the requested visible attribution and placement before generated content | Treat as an example, not a universal repository convention |

## Decisions

- **Adopted:** keep each prose paragraph on one physical line and reserve line breaks for intentional Markdown structure.
- **Adopted:** put `Closes #<number>` on the first non-comment line when a PR fully resolves a known issue, unless a repository template requires different placement.
- **Adopted:** append the attribution once as the final agent-authored visible content.
- **Adopted:** adapt the parenthetical identity to the current agent and model.
- **Adopted:** omit unavailable identity details rather than guessing them.
- **Adopted:** allow repository automation to place generated comments or content after the footer.
- **Adopted:** permit an explicit per-PR user override.

## Coverage And Gaps

- Substantive PR structure: covered by `SKILL.md`.
- Mechanical PR structure: covered by the `## Summary` exception.
- Prose wrapping and closing issue-link placement: covered by `SKILL.md`.
- Attribution placement and deduplication: covered by `SKILL.md`.
- Open gaps: none.

Further source collection is low-yield because this is a direct personal style preference with a concrete accepted example.
