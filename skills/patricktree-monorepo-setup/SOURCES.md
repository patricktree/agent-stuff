# Sources And Decisions

## Classification

- Class: `workflow-process`.
- Primary execution shape: `script-backed-workflow`.
- Secondary mechanics: asset templates, plan-validate-execute, validation loop.
- Simpler-shape rejection: inline guidance cannot reliably reproduce many files,
  derive versions, detect collisions, and preserve `.gitignore` content.
- Portability: provider-neutral Markdown and Node.js; no provider-specific mechanics.

## Source Inventory

| Source | Trust | Contribution | Constraints |
| --- | --- | --- | --- |
| `~/workspace/pv-analysis` at setup commit `c3b3a5f` | High, observed | Accepted ground-setup output and validation behavior | Local path is provenance only, never runtime guidance. |
| `~/workspace/content-relay` root setup and history | High, maintained | Baseline scripts, catalogs, tooling, submodule conventions | Exclude product-specific catalog and Knip entries. |
| `~/workspace/oeko-app` root setup | High, maintained | Confirmed shared baseline independently | Exclude product-specific entries. |
| `.patricktree-stack` package manifests at `a9f2bb3` | High, primary | Required workspace projects and catalog dependencies | Consumer must register explicit package paths. |
| Pi `docs/skills.md` | High, official | Skill discovery, structure, relative bundled files | None. |
| Local `skill-writer` workflow references | High, local authority | Script contract, SPEC, examples, registration, validation | None. |

## Decisions

| Decision | Status | Evidence |
| --- | --- | --- |
| Ask for Node.js and pnpm versions before planning | Adopted | User requirement; versions affect generated root metadata. |
| Derive `@types/node` from the first and only supported Node major | Adopted | User requirement; `^24.18.0` maps to `^24`. |
| Require exact pnpm semantic version | Adopted | `packageManager` must be deterministic. |
| Plan before apply and reject differing managed files | Adopted | Setup spans many files and Git submodule state. |
| Preserve and append to existing `.gitignore` | Adopted | Existing repositories may contain domain-specific ignores. |
| Include product-specific dependencies such as Hono | Rejected | They are not required by the ground setup or shared stack. |
| Add Playwright output ignores | Rejected | Explicit user feedback identified this as overkill. |
| Automatically commit generated files | Rejected | Repository guardrails and setup contract prohibit commits. |

## Coverage Matrix

| Dimension | Coverage |
| --- | --- |
| Preconditions | Git-root check, required versions, scope validation, collision plan. |
| Ordered flow | Collect, plan, inspect, apply, install, validate, report. |
| Failure handling | Structured exits, no force, partial-submodule reporting. |
| Safety boundaries | No overwrite, no commit, preserve unrelated changes. |
| Happy path | `references/examples.md` and known-good repository plan. |
| Edge behavior | Existing files, existing submodule, invalid versions, dirty repository. |
| Negative behavior | Force/overwrite and mismatched Node types documented as anti-patterns. |
| Repair behavior | Resolve conflicts explicitly, then rerun plan. |
| Version variance | Node range parser and exact pnpm validation. |

## Trigger Evaluation

Should trigger:

- "Apply my ground setup in this repository."
- "Set up my default pnpm monorepo with `.patricktree-stack`."
- "Reproduce the Patricktree TypeScript monorepo baseline."

Should not trigger:

- "How do pnpm catalogs work?"
- "Add a package to this existing workspace."
- "Create a generic Turborepo starter without Patrick's stack."

The final description names Patrick's setup and `.patricktree-stack` to avoid
matching generic pnpm or Turborepo setup requests.

## Gaps

- Future baseline changes require manual asset synchronization and regression tests.

## Retrieval Stop

The source set includes three observed consumers, the shared package manifests,
setup history, local conventions, and official skill documentation. Additional
retrieval would mostly repeat the established baseline; remaining gaps are
execution validations rather than missing design evidence.
