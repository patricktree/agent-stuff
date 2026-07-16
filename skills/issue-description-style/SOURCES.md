# Issue Description Style Sources

## Source Inventory

| Source | Trust | Contribution | Constraints |
| --- | --- | --- | --- |
| Direct user instructions in the task creating and clarifying this skill | Authoritative | Requires an issue-description skill and a `Written by @patricktree's agent (…)` footer adapted to the current agent and model | Use known runtime identity details; do not guess unavailable values |
| Existing `pr-description-style` skill | High local prior art | Supplies template-first behavior, concise tone, validation honesty, footer placement, and deduplication | Adapt for issue outcomes rather than code-change review |
| [pnpm PR #13063](https://github.com/pnpm/pnpm/pull/13063) | Example | Shows the requested visible attribution before generated content | Use only as a footer example |

## Classification And Shape

- Class: generic writing-style guidance.
- Required dimensions: issue-type selection, evidence quality, actionable outcomes, privacy, and attribution.
- Primary execution shape: inline guidance.
- Secondary shape: one optional example reference.
- Simpler-shape rationale: inline guidance handles the workflow; the example leaf is retained because transformed examples are useful only when selecting or repairing structure.
- Portability: provider-agnostic Markdown guidance with no provider-specific mechanics.

## Decisions

- **Adopted:** route bug, feature, and maintenance issues to distinct minimal structures.
- **Adopted:** put observed behavior before implementation suggestions.
- **Adopted:** require testable acceptance criteria and prohibit invented evidence.
- **Adopted:** append the attribution once as final agent-authored visible content and adapt it to the current agent and model without guessing unavailable details.
- **Rejected:** require one large universal issue template; it adds empty sections and noise.
- **Deferred:** label, severity, assignee, and milestone policy because repositories differ.

## Coverage Matrix

| Dimension | Status | Location |
| --- | --- | --- |
| Happy path | Covered | Feature example |
| Edge and robust behavior | Covered | Bug example, privacy and unknown-data rules |
| Negative behavior and repair | Covered | Anti-pattern and correction example |
| Issue-type variance | Covered | Structure table |
| Attribution and deduplication | Covered | Attribution footer rules |

## Gaps And Stopping Rationale

No high-impact gaps remain. Further retrieval is low-yield because this skill captures a personal style preference and relies on each repository's local issue template for platform-specific variance.
