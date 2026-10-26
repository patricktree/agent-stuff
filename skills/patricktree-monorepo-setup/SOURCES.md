# Sources And Decisions

## Classification

- Class: `workflow-process`.
- Primary execution shape: `script-backed-workflow`.
- Secondary mechanics: asset templates, plan-validate-execute, validation loop.
- Simpler-shape rejection: inline guidance cannot reliably reproduce many files, derive versions, detect collisions, and preserve `.gitignore` content.
- Portability: provider-neutral Markdown and Node.js; no provider-specific mechanics.

## Source Inventory

| Source | Trust | Contribution | Constraints |
| --- | --- | --- | --- |
| `~/workspace/cup` root setup at `b57da60c` | High, maintained | Newest consumer: `engines.pnpm`, fast/extended validation split, submodule and docs checks, `agentGuidance`, catalog versions for opted-in stack projects | Exclude product-specific scripts, catalogs, Knip workspaces, ignores, and build allowances. |
| `~/workspace/pv-analysis` at setup commit `c3b3a5f` | High, observed | Accepted ground-setup output and validation behavior | Local path is provenance only, never runtime guidance. |
| `~/workspace/content-relay` root setup and history | High, maintained | Baseline scripts, catalogs, tooling, submodule conventions | Exclude product-specific catalog and Knip entries. |
| `~/workspace/oeko-app` root setup | High, maintained | Confirmed shared baseline independently | Exclude product-specific entries. |
| `.patricktree-stack` at `6764f8d` package manifests (originally `a9f2bb3`) | High, primary | Required workspace projects and catalog dependencies | Consumer must register explicit package paths. |
| Pi `docs/skills.md` | High, official | Skill discovery, structure, relative bundled files | None. |
| Local `skill-writer` workflow references | High, local authority | Script contract, SPEC, examples, registration, validation | None. |

## Decisions

| Decision | Status | Evidence |
| --- | --- | --- |
| Ask for Node.js and pnpm versions before planning | Adopted | User requirement; versions affect generated root metadata. |
| Derive `@types/node` from the first and only supported Node major | Superseded | `cup` pins the latest `@types/node` (`^26`) on Node.js `^24`; the catalog now pins it statically like other tools, and any Node.js semver range is accepted. |
| Adopt `cup`'s generic root additions | Adopted | `engines.pnpm`, `validate:fast` in pre-commit with Zizmor moved to `validate:extended`, `submodule-check`, markdownlint plus `mermaid-check` docs check, Turborepo `agentGuidance: false`, postinstall `cd` to the repository root. User decision on 2026-10-26. |
| Opt in to the stack projects `mermaid-check` and `submodule-check` build with | Adopted | Their manifests require `config-oxlint`, `config-turbo-typescript`, `config-typescript`, `config-vitest`, and catalog entries for `@types/node`, `@typescript/native`, `typescript`, `vite`, and `vitest` (values from `cup`). |
| Require exact pnpm semantic version | Adopted | `packageManager` must be deterministic. |
| Plan before apply and reject differing managed files | Adopted | Setup spans many files and Git submodule state. |
| Preserve and append to existing `.gitignore` | Adopted | Existing repositories may contain domain-specific ignores. |
| Include product-specific dependencies such as Hono | Rejected | They are not required by the ground setup or shared stack. |
| Add Playwright output ignores | Rejected | Explicit user feedback identified this as overkill. |
| Automatically commit generated files | Rejected | Repository guardrails and setup contract prohibit commits. |
| Refresh pinned tool versions to npm latest on 2026-10-26 | Adopted | oxfmt `^0.74.0`, oxlint `^1.89.0`, oxlint-tsgolint `^7.0.2005`, knip `^6.43.0`, turbo `^2.11.10`, del-cli `^8.0.1` (major; Node.js `>=22`), `@emnapi/*` `^1.11.3`, eslint-plugin-react-you-might-not-need-an-effect `^1.0.2` (with matching `packageExtensions` key), zizmor `1.31.1`; added with the `cup` adoption: markdownlint-cli2 `^0.24.0`, markdownlint-rule-relative-links `^5.1.4`, vite `^8.3.5`. Smoke apply with Node.js `^24.21.0` and pnpm `12.11.2` in a fresh Git repository passed install, `fix`, full `validate` (including Zizmor), `format:check`, and `git diff --check`. |

## Version Maintenance

Tool versions are pinned in `assets/package.json.tpl` and `assets/pnpm-workspace.yaml.tpl` and drift from the reference repositories. When refreshing them:

- Read current versions with `npm view <package> version` (zizmor from PyPI).
- Keep the `packageExtensions` key for eslint-plugin-react-you-might-not-need-an-effect equal to the installed version.
- Check engine requirements of major bumps against the supported Node.js range.
- Run `node --test scripts/scaffold.test.mjs`, then apply into a fresh Git repository and run `pnpm install`, `pnpm run fix`, `git add -A`, `pnpm run validate`, and `pnpm run format:check`.
- Vitest stays on `^4` like `cup` until the stack's `config-vitest` moves to Vitest 5.

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

The final description names Patrick's setup and `.patricktree-stack` to avoid matching generic pnpm or Turborepo setup requests.

## Gaps

- Future baseline changes require manual asset synchronization and regression tests.

## Retrieval Stop

The source set includes three observed consumers, the shared package manifests, setup history, local conventions, and official skill documentation. Additional retrieval would mostly repeat the established baseline; remaining gaps are execution validations rather than missing design evidence.
