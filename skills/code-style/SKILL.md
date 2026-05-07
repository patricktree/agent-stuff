---
name: code-style
description: Captures a personal TypeScript, React, testing, file layout, naming, comments, error handling, defensive-programming, and package.json code style. Use when writing or editing code files, implementing features, refactoring modules, adding tests, or updating package.json so persistent code stays consistent with this personal style. Not needed for throwaway code evaluated via bash.
---

# Code Style

Apply this personal code style when writing or editing persistent code files.

## First rule

1. Inspect nearby files and mirror local conventions first.
2. Use this skill to fill gaps and break ties when the local pattern is unclear.
3. Prefer consistency with the existing codebase over introducing a new pattern from this skill.
4. Do not apply this skill to throwaway one-off code evaluated in bash unless the user wants to turn it into a real file.

## Core philosophy

- Prefer straightforward, explicit code over clever abstractions.
- Prefer readable code over terse code.
- Prefer boring, explicit code and boring technology when possible.
- Optimize for maintainability over cleverness.
- Fail fast on invalid states and broken assumptions.
- Keep control flow shallow when possible.
- Keep functions tight and cohesive, with clear names and tight invariants.
- Preserve observability: errors and important state transitions should be easy to understand.
- Avoid speculative abstraction: inline obvious one-use code; extract only for reuse, domain meaning, or to simplify dense logic.
- Add abstraction only when it has clear reuse value or models a real domain concept.

## Naming

- Prefer descriptive names over short names.
- Name booleans as predicates such as `is...`, `has...`, `can...`, or `should...`.
- Name functions after what they do, not how they do it.
- Use specific names for intermediate values when they carry meaning.
- Use uppercase names for constants.
- Use grouped objects for related constants or helper namespaces when that matches the surrounding code.

Examples:

- `shouldReadStdin`, not `stdinMode`
- `fetchFaviconURLs`, not `fetchIcons`
- `idOfLastHeadingAboveTheFold`, not `lastId`

## File layout

- Keep one primary concern per file.
- Order files predictably:
  1. imports
  2. constants and local types
  3. exported types, functions, or components
  4. internal helper functions
  5. styled components or presentation-only helpers
- Colocate small helpers or wrappers when they are tightly coupled to one component or module.
- Extract shared primitives such as `Anchor`, `Button`, or `Image` when they standardize framework usage.
- Do not introduce barrel files such as `index.ts` or `index.tsx` by default.
- Prefer direct imports from the defining module unless the local codebase already uses barrels consistently or a package-level public API genuinely benefits from one.

## Comments

- Write comments to explain why, not what.
- Comment browser quirks, framework constraints, invariants, tradeoffs, and non-obvious decisions.
- Prefer clearer code over explanatory comments.
- Add source links when code is adapted from specs, docs, or articles.

Good comment topics:

- why a guard exists
- why a CSS workaround is necessary
- why a helper must stay structured a certain way
- where a tricky algorithm came from

Avoid:

- comments that restate the next line of code
- generic section comments that add no information

## Defensive programming and error handling

- Validate assumptions early, especially at boundaries.
- Prefer crashing fast over trying to keep the program alive at all costs when invariants break or required data is missing.
- Throw with explicit, actionable error messages when required data or invariants are missing.
- Use `invariant(...)` for internal guarantees when that matches the repo.
- Use exhaustive checks such as `assertUnreachable(...)` for impossible states.
- Do not silently swallow invalid input.
- Do not add defensive fallback behavior that hides corrupted state, broken assumptions, or programmer errors.
- Continue after an error only when partial success is intentional, such as batch-style processing.
- When continuing on partial failure, preserve observability with clear logging or structured error handling.

## TypeScript

- Prefer `type` by default.
- Use `interface` only when it is the better tool for augmentation or a TypeScript edge case.
- Prefer explicit prop types, return types, and exported result shapes where they improve clarity.
- Use `as const`, derived types, and `satisfies` when they improve correctness.
- Avoid `any`; prefer proper typing or `unknown` plus narrowing.
- Use advanced type utilities only when they solve a real problem.
- Favor runtime-backed types for important external data shapes.

## React

- Use function components.
- Keep components focused and single-purpose.
- Extract context providers only when state is meaningfully shared.
- Prefer explicit prop types and state names.
- Name non-trivial effects and helpers clearly.
- Colocate styled components in the same file when they only serve that component.
- For RSC-enabled frameworks (like Next.js), add `'use client'` only where required.

## Tests

- Test behavior, not implementation details.
- Prefer direct, readable tests over heavily abstracted test helpers.
- Prefer flat test structure by default; do not introduce nested `describe(...)` blocks unless there is a strong readability reason.
- Allow duplication to occur in tests when it improves readability and intent.
- Keep setup local unless repeated enough to justify extraction.
- Add helpers such as `expectRejection(...)` only when they simplify repeated patterns without hiding intent.

## Avoid

- vague names
- deep nesting when a guard clause would do
- comments that only narrate the code
- clever abstractions without strong payoff
- broad configurable components with unclear boundaries
- unnecessary type gymnastics
- magical test helpers
- nested `describe(...)` trees by default
- new barrel files without a clear package API boundary or an existing local convention

## package.json

- Use explicit, conventional script names.
- Reuse existing scripts when possible instead of duplicating commands.
- Prefer compositions such as `"lint:fix": "pnpm run lint --fix"` when the package manager and script interface support it.
- If task-runner-specific scripts exist, follow the local convention such as `turbo:build`.
- Keep package metadata complete and consistent.
- Prefer script clarity over shell cleverness.

Typical script names:

- `build`
- `dev`
- `lint`
- `lint:fix`
- `test`
- `test:watch`
- `clean`
- `clean:artifacts`

## Reference material

- Use `references/examples.md` for concrete examples.
