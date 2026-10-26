# Vitest Project Setup Specification

## Intent

Maintain focused Vitest setup conventions for Node.js, TypeScript, Vite, and Patricktree monorepo projects.

## Scope

In scope:

- Keep recommendations current with the latest Vitest major and with `.patricktree-stack/tooling/config-vitest`.
- Keep trigger wording precise for Vitest dependencies, test scripts, Vite test config, shared config-vitest consumption, test or coverage include patterns, isolation settings, coverage thresholds, or tsconfig coverage of the Vitest config file.

Out of scope:

- ESLint, Prettier, pnpm, or general package metadata setup.

## Users And Trigger Context

- Primary users: coding agents configuring or reviewing JavaScript/TypeScript projects.
- Common user requests: add, edit, standardize, or review Vitest dependencies, test scripts, Vite or shared Vitest config, test or coverage include patterns, isolation settings, or coverage thresholds.
- Should not trigger for: unrelated project setup areas covered by sibling skills.

## Runtime Contract

- Required first actions: read `SKILL.md` and apply only the relevant guidance.
- Required outputs: code or configuration changes that preserve the skill's recommendations.
- Non-negotiable constraints: keep `vitest` and `@vitest/coverage-v8` on the same exact version; keep shared defaults in config-vitest rather than in consuming configs.
- Expected bundled files loaded at runtime: none.

## Source And Evidence Model

Authoritative sources:

- Vitest documentation and migration guide for the current major.
- `.patricktree-stack/tooling/config-vitest/vitest-base.js` for the shared monorepo defaults.

Useful improvement sources:

- positive examples: successful project setup runs using these recommendations.
- negative examples: false-positive skill triggers or over-broad context loading.
- commit logs/changelogs: future updates to the split skills.
- issue or PR feedback: reports that recommendations are stale or unclear.
- validation results: markdownlint and skill structural validation.

Data that must not be stored:

- secrets
- customer data
- private URLs or identifiers not needed for reproduction

## Reference Architecture

- `SKILL.md` contains: all runtime guidance for this focused setup area.
- `references/` contains: none.
- `references/evidence/` contains: none.
- `scripts/` contains: none.
- `assets/` contains: none.

## Validation

- Lightweight validation: run skill structural validation on the skill directory.
- Deeper validation: run markdownlint on changed Markdown files.
- Holdout examples: requests for sibling tooling should not load this skill.
- Acceptance gates: the pinned Vitest version and documentation links resolve to the current major.

## Known Limitations

- The pinned version in `SKILL.md` goes stale with each Vitest release; prefer workspace catalog entries where they exist.

## Maintenance Notes

- When to update `SKILL.md`: recommendation changes or trigger precision fixes.
- When to update `references/evidence/`: when preserving trigger examples or regression cases.
