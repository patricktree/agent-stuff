---
name: code-style
description: Personal code style for naming, file layout, comments, error handling, TypeScript, React, tests, and package.json scripts. Use when writing or editing persistent code files or package.json. Not needed for throwaway code (e.g. code evaluated via bash).
---

# Code Style

Mirror the conventions of nearby files first; use this skill to fill gaps and break ties where the local pattern is unclear.

## Core philosophy

- Write **boring** code: straightforward, explicit, and readable over clever, terse, or abstract; boring technology too.
- **Fail fast** on invalid states and broken assumptions (see [Error handling](#error-handling)).
- Keep control flow shallow and functions tight and cohesive, with clear names and tight invariants.
- Keep errors and important state transitions observable.

## Naming

- Use descriptive names; name intermediate values specifically when they carry meaning.
- Name booleans as predicates: `is...`, `has...`, `can...`, `should...`.
- Use uppercase names for constants; group related constants or helpers in an object when that matches the surrounding code.

Examples:

- `shouldReadStdin`, not `stdinMode`
- `fetchFaviconURLs`, not `fetchIcons`
- `idOfLastHeadingAboveTheFold`, not `lastId`

## File layout

- Order files predictably:
  1. imports
  2. exported types that define the module's public contract
  3. constants and exported symbols
  4. internals (e.g. helper functions)
- Colocate non-exported types, and small helpers or wrappers, with the function, component, or module that uses them.
- Extract shared primitives such as `Anchor`, `Button`, or `Image` when they standardize framework usage.
- Import directly from the defining module. Add a barrel file (`index.ts`, `index.tsx`) only when the codebase already uses barrels consistently or a package-level public API genuinely benefits from one.

### Statement spacing

Separate logical blocks of statements with one blank line inside functions and other blocks, keeping tightly related statements together, so the spacing reveals the structure.

```typescript
const params = parseInput(input);
const { sourceUrl } = params;

if (params.conversionId !== instanceId)
  throw new Error("Conversion identity mismatch");

const owner = params.owner;
const artifactPrefix = createConversionArtifactPrefix(instanceId, owner);

const bucket = createArtifactBucket(owner, artifactPrefix);

return runConversion(sourceUrl, bucket);
```

## Comments

Comments explain why: browser quirks, framework constraints, invariants, tradeoffs, why a guard or CSS workaround exists, why a helper must stay structured a certain way. Prefer clearer code over a comment that restates it. Add a source link when code is adapted from a spec, docs, or an article.

### Action at a distance

Comment every **action at a distance**: a line whose reason lives in code elsewhere, such as a declaration that exists only to serve a descendant, a sibling, or another module. Put the comment on that line and name the other site and what it relies on, so the line reads as load-bearing rather than unused.

```css
.card {
  /* containing block for the absolutely positioned `.badge` */
  position: relative;
}
```

## Error handling

- Validate assumptions early, especially at boundaries.
- When invariants break or required data is missing, crash with an explicit, actionable error message; fallback behavior that hides corrupted state or programmer errors is a bug.
- Use `invariant(...)` or `assert(...)` for internal guarantees and type narrowing when that matches the repo, and exhaustive checks such as `assertUnreachable(...)` for impossible states.
- Continue after an error only when partial success is intentional (e.g. batch processing), and then log or collect each failure so it stays observable.

## TypeScript

- Use `type` by default; use `interface` only for declaration merging/augmentation or a TypeScript edge case that needs it.
- Use explicit prop types, return types, and exported result shapes where they improve clarity.
- Use `unknown` plus narrowing instead of `any`, and advanced type utilities only when they solve a real problem.
- Back important external data shapes with runtime validation.
- Import Node.js built-in modules as default namespace imports and call members through them: `import crypto from 'node:crypto';` with `crypto.createHash(...)`.

## React

- Extract context providers only when state is meaningfully shared.
- Colocate styled components and styles in the same file when they only serve that component.
- In RSC-enabled frameworks (like Next.js), add `'use client'` only where required.

## Tests

- Keep tests flat: top-level `test(...)` calls, with nested `describe(...)` only when grouping adds real clarity.
- Favor direct, readable tests with local setup; accept duplication when it keeps intent visible, and extract a helper such as `expectRejection(...)` only when it simplifies a repeated pattern without hiding intent.

## package.json

For package metadata, `exports`, `imports`, and entrypoints, use the `nodejs-package-json` skill. For scripts:

- Use conventional names: `build`, `dev`, `lint`, `lint:fix`, `test`, `test:watch`, `clean`, `clean:artifacts`.
- Compose existing scripts instead of duplicating commands, e.g. `"lint:fix": "pnpm run lint --fix"`.
- Prefix task-runner-specific scripts when the repo uses a task runner, e.g. `turbo:build`.
- Keep scripts clear rather than clever in shell.

## Reference material

For worked examples of these rules (a TypeScript helper, a React component, a test, package.json scripts, and an anti-pattern), read [`references/examples.md`](references/examples.md).
