---
name: pr-description-style
description: Captures preferred pull request description structure and writing style, including Conventional Commits-style detail bullets. Use when creating, editing, or proposing PR descriptions, GitHub PR bodies, merge request descriptions, or review summaries for code changes.
---

# PR Description Style

Apply this style when drafting, editing, or updating pull request descriptions.

## First rule

1. Mirror any repository-specific PR template first.
2. Use this skill to fill gaps and improve clarity when no stronger local convention exists.
3. Write for reviewers: explain why the change matters, what changed, and how it was validated.
4. Prefer concise, high-signal descriptions over exhaustive implementation logs.

## Default structure

Prefer this structure for substantive changes:

```md
## Problem

Explain the current behavior or gap, and why it matters.

Use bullets for separate impacts such as cost, GDPR/privacy, reliability,
security, UX, maintainability, or operational risk.

## Solution

Explain the intended behavior after the change.

Keep this outcome-focused. Mention important policy choices, thresholds,
retention windows, or tradeoffs.

## Details

- feat(scope): add concrete behavior or capability
- fix(scope): correct bug, regression, or failure path
- test(scope): cover important scenario or edge case
- test(migration-cli): make `pnpm test` run all Vitest projects and add a dedicated `test:unit` script

List concrete code/config/docs changes as Conventional Commits-style bullets.

## Validation

Created/Updated tests for:

- Behavior or scenario covered by a new/changed test.
- Edge case, regression, or failure path covered by a new/changed test.

Ran:

- `command that was run`
- `another command that was run`

---

Written by @patricktree's agent ({agent}, {model}).
```

For tiny mechanical PRs, `## Summary` is acceptable instead of `## Problem` and
`## Solution` when there is no meaningful problem framing.

## Problem section

- Start from the existing behavior or system state.
- Explain why the current behavior is insufficient.
- Name concrete risks such as cost, GDPR/privacy, reliability, security, UX, maintainability, or operational impact.
- Avoid implementation details unless they are necessary to understand the problem.

## Solution section

- Describe the target behavior after the change.
- Explain important policy choices, thresholds, retention windows, or tradeoffs.
- Keep it readable for non-authors and future operators.
- Avoid over-explaining obvious implementation mechanics.

## Details section

- Use Conventional Commits-style bullets: "type(scope): concise summary".
- Prefer these types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, and `style`.
- Use a scope when it clarifies the touched domain, package, module, or workflow; omit it when it would be forced.
- Use `!` for breaking changes, and add a short `BREAKING CHANGE:` note when reviewer context is needed.
- Mention primary files, modules, resources, or workflows changed when useful.
- Separate behavior changes from validation fixes, cleanup, or documentation changes.
- Keep bullets parallel, concrete, and reviewable.

## Validation section

- List tests created or updated, grouped under `Created/Updated tests for:` when any tests changed.
- Describe test coverage by behavior/scenario, not only file names or test names.
- List commands actually run under `Ran:`.
- Use backticks for commands.
- Include important manual checks when relevant.
- Do not claim validation that was not performed.
- State blockers explicitly when validation could not be run.

## Attribution footer

- End every agent-authored PR description with this visible footer format:

  ```md
  ---

  Written by @patricktree's agent ({agent}, {model}).
  ```

- Replace `{agent}` and `{model}` with the current runtime's public agent/tool name and model name; never emit the placeholders.
- Do not guess unavailable identity details. If both are unavailable, use `Written by @patricktree's agent.`; if only one is available, include only that value in parentheses.
- Add the footer once; do not duplicate an existing equivalent footer.
- Keep it as the final agent-authored content. Repository automation may append hidden comments or generated content after it.
- Omit it only when the user explicitly requests that for the specific PR.

## Tone

- Be clear, direct, specific, and concise.
- Prefer “Add lifecycle rules…” over “This PR adds…”.
- Use precise nouns from the codebase or domain.
- Avoid marketing language.
- Avoid vague bullets such as “misc cleanup”, “fix stuff”, or “various improvements”.
