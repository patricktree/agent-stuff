# Patricktree Monorepo Setup Specification

## Intent

Provide a safe, deterministic way to reproduce Patrick Kerschbaum's standard
pnpm TypeScript monorepo foundation across Git repositories.

## Scope

In scope:

- Interactive collection of Node.js, pnpm, and package-scope inputs.
- Automatic `@types/node` major alignment.
- `.patricktree-stack` registration and initialization.
- Root pnpm, Turborepo, TypeScript-tooling, oxfmt, oxlint, Knip, Husky, and VS Code configuration.
- Plan-before-apply safety and full post-install validation.

Out of scope:

- Creating product applications or libraries.
- Choosing product dependencies.
- Committing, branching, or pushing.
- Overwriting conflicting setup files.
- Updating `.patricktree-stack` itself.

## Users And Trigger Context

- Primary users: Patrick Kerschbaum and coding agents preparing his repositories.
- Common requests: "ground setup", "default pnpm monorepo setup", "set up my Patricktree stack".
- Should not trigger for generic pnpm questions, adding one package to an existing monorepo, or monorepos that do not use Patrick's shared stack.

## Runtime Contract

- Required first actions: inspect Git state; obtain and confirm Node.js version,
  exact pnpm version, and package scope; run plan mode.
- Required outputs: structured plan/apply results and a validation summary.
- Non-negotiable constraints: derive `@types/node` from the Node major; never
  force overwrites; never commit; preserve unrelated changes.
- Expected bundled files loaded at runtime: `SKILL.md`; `references/examples.md`
  only for examples or troubleshooting; assets are consumed by the script.

## Source And Evidence Model

Authoritative sources:

- Current `content-relay`, `oeko-app`, and `pv-analysis` root setup files.
- Current `.patricktree-stack` package manifests and shared configuration.
- Agent Skills and local `agent-stuff` conventions.

Useful improvement sources:

- Successful setup runs and validation output.
- Conflicts, partial submodule failures, and version parsing failures.
- Setup-related commits in reference repositories.

Data that must not be stored:

- Secrets or credentials.
- Private repository contents unrelated to setup.

## Reference Architecture

- `SKILL.md` contains the required runtime workflow and script contract.
- `references/examples.md` contains transformed invocation examples.
- `scripts/scaffold.mjs` plans and applies the setup.
- `scripts/scaffold.test.mjs` covers parsing, rendering, and plan safety.
- `assets/` contains stable root-file templates and the `.gitignore` fragment.
- `SOURCES.md` records provenance, decisions, coverage, and gaps.

## Validation

- Lightweight validation: Node syntax check, script tests, help output, skill
  structure validation, Markdown linting.
- Deeper validation: plan against a known-good repository; apply in a temporary
  Git repository when network access is available; install, fix, validate, and
  formatting checks in a generated repository.
- Holdout examples: composite Node range, existing conflicting `package.json`,
  existing unrelated `.gitmodules`, and partially initialized submodule.
- Acceptance gates: plan is non-mutating; conflicts stop before mutation; pnpm
  and Node versions render exactly; `@types/node` matches the Node major.

## Known Limitations

- Applying a new submodule requires Git network access.
- Tool versions other than Node.js, pnpm, and `@types/node` remain pinned in the
  bundled templates and require periodic maintenance.
- Existing semantically equivalent setup files with different formatting are
  treated as conflicts.

## Maintenance Notes

- Update `SKILL.md` when workflow, safety boundaries, or validation gates change.
- Update assets and `SOURCES.md` when the reference repositories change their baseline.
- Add evidence examples only after a real setup outcome exposes a reusable edge case.
