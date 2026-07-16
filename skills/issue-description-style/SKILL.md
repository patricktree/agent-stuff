---
name: issue-description-style
description: Captures preferred GitHub issue description structure, evidence, acceptance criteria, and agent attribution. Use when creating, editing, or proposing GitHub issues, issue bodies, bug reports, feature requests, or maintenance-task descriptions.
---

# Issue Description Style

Apply this style when drafting, editing, or submitting issue descriptions.

## First rule

1. Mirror any repository-specific issue form or template first.
2. Use this skill to fill gaps when no stronger local convention exists.
3. Describe the problem before prescribing implementation.
4. Include only claims supported by observed behavior, repository evidence, or user-provided context.
5. Keep the issue actionable and concise.

## Choose the structure

| Issue type | Required sections |
| --- | --- |
| Bug | `## Problem`, `## Reproduction`, `## Expected behavior`, `## Actual behavior`, and `## Environment` when relevant |
| Feature | `## Problem`, `## Proposed outcome`, and `## Acceptance criteria` |
| Maintenance | `## Summary`, `## Motivation`, and `## Acceptance criteria` |

Add `## Context` only for evidence, constraints, alternatives, screenshots, logs, or links that materially help implementation or triage.

Read `references/examples.md` when choosing among issue types or correcting a vague draft.

## Content rules

- Write a specific title that names the affected behavior and desired outcome.
- Separate observed facts from assumptions.
- Use minimal reproduction steps for bugs; remove incidental setup.
- Describe expected and actual behavior in observable terms.
- Make acceptance criteria testable without dictating internals unnecessarily.
- Include logs, screenshots, versions, and links only when they improve diagnosis.
- Redact secrets, credentials, personal data, and unrelated private details.
- Do not invent severity, impact, reproduction results, or validation.
- Mark unknown information explicitly instead of guessing.

## Attribution footer

End every agent-authored issue description with this visible footer format:

```md
---

Written by @patricktree's agent ({agent}, {model}).
```

Replace `{agent}` and `{model}` with the current runtime's public agent/tool name and model name; never emit the placeholders. Do not guess unavailable identity details. If both are unavailable, use `Written by @patricktree's agent.`; if only one is available, include only that value in parentheses.

Add the footer once; do not duplicate an existing equivalent footer. Keep it as the final agent-authored content. Repository automation may append hidden comments or generated content after it. Omit it only when the user explicitly requests that for the specific issue.

## Tone

- Be direct, neutral, specific, and concise.
- Use precise nouns from the affected product or codebase.
- Avoid blame, marketing language, speculation presented as fact, and vague requests such as “improve this” or “fix issues.”
