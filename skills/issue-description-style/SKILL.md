---
name: issue-description-style
description: Writes GitHub issue descriptions in Patrick's preferred structure, with reproduction evidence, testable acceptance criteria, and an agent-attribution footer. Use when creating, editing, or drafting a GitHub issue, whether a bug report, feature request, or maintenance task.
---

# Issue Description Style

The repository's own issue forms and contribution guidance (`.github/ISSUE_TEMPLATE/`, `CONTRIBUTING.md`) take precedence; use this skill to fill the gaps they leave. Describe the problem before any implementation, and state only what observed behavior, repository evidence, or the user supports, marking the rest explicitly as unknown or assumed.

## Structure

| Issue type | Sections |
| --- | --- |
| Bug | `## Problem`, `## Reproduction`, `## Expected behavior`, `## Actual behavior`, and `## Environment` when relevant |
| Feature | `## Problem`, `## Proposed outcome`, and `## Acceptance criteria` |
| Maintenance | `## Summary`, `## Motivation`, and `## Acceptance criteria` |

Add `## Context` only for evidence, constraints, alternatives, screenshots, logs, or links that materially help implementation or triage.

Read `references/examples.md` when choosing among issue types or repairing a vague draft.

## Content rules

- Keep each prose paragraph on one physical line; use line breaks only for Markdown structure such as headings, blank lines, lists, blockquotes, tables, and fenced code.
- Title the issue with the affected behavior and the desired outcome.
- Reduce bug reproductions to the minimal steps; drop incidental setup.
- Write acceptance criteria as observable, testable outcomes rather than prescribed internals.
- State severity, impact, reproduction results, and validation only when observed or provided by the user.
- Redact secrets, credentials, personal data, and unrelated private details.

## Attribution footer

End every agent-authored issue description with this visible footer format:

```md
---

Written by @patricktree's agent ({agent}, {model}).
```

Replace `{agent}` and `{model}` with the current runtime's public agent/tool name and model name; never emit the placeholders. Do not guess unavailable identity details. If both are unavailable, use `Written by @patricktree's agent.`; if only one is available, include only that value in parentheses.

Add the footer once; do not duplicate an existing equivalent footer. Keep it as the final agent-authored content. Repository automation may append hidden comments or generated content after it. Omit it only when the user explicitly requests that for the specific issue.
