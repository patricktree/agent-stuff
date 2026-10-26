---
name: patricktree-monorepo-setup
description: Sets up Patrick Kerschbaum's standard pnpm TypeScript monorepo foundation (`.patricktree-stack` submodule, catalogs, Turborepo, oxfmt, oxlint, Knip, Husky, VS Code settings) via a bundled scaffold script. Use when asked to reproduce Patrick's "ground setup", default pnpm monorepo setup, or `.patricktree-stack` baseline in a Git repository.
---

# Patricktree Monorepo Setup

Create the standard foundation with the bundled non-interactive scaffold script, and leave the result uncommitted.

## Required Inputs

Obtain and confirm these values before planning. Ask one combined question for any value the user did not provide.

| Input | Example | Rule |
| --- | --- | --- |
| Node.js version | `^24.21.0` | Semver range; becomes `devEngines.runtime.version`. |
| pnpm version | `12.11.2` | Exact semantic version; becomes `packageManager` and `engines.pnpm`. |
| package scope | `pv-analysis` | Infer from the repository directory, then confirm. |

## Workflow

1. Confirm the target is the Git repository root and record `git status --short`. Every pre-existing change must survive untouched.
2. Resolve `scripts/scaffold.mjs` against this skill directory and generate a plan:

   ```sh
   node <resolved-script-path> \
     --mode plan \
     --target <repository-root> \
     --node-version '^24.21.0' \
     --pnpm-version '12.11.2' \
     --scope 'pv-analysis'
   ```

3. Inspect the JSON output. Continue only when `valid` is `true`, `conflicts` is empty, and every action is expected. Resolve conflicts with the user, then rerun plan mode; the script has no force option by design.
4. Re-run the same command with `--mode apply`. It adds or initializes `.patricktree-stack`, writes the setup files, appends missing `.gitignore` patterns, and prints a JSON result.
5. Install with the pinned pnpm (see the `pnpm` skill for Corepack and availability checks), then confirm `pnpm --version` matches the requested version.
6. Run the validation loop. Fix each failure and repeat the failed check until every command passes:

   ```sh
   pnpm run fix
   git add -A
   pnpm run validate
   git diff --check
   git status --short
   git submodule status
   ```

7. Report generated files, versions, submodule revision, validation results, and the pre-existing changes that remain untouched.

## Baseline Notes

- The workspace opts into only the `.patricktree-stack` projects the baseline uses: `config-oxfmt`, `mermaid-check`, `submodule-check`, and the `config-oxlint`, `config-turbo-typescript`, `config-typescript`, and `config-vitest` projects those two build with. The catalog holds exactly what they reference. When the repository starts using another submodule project, add that path to `pnpm-workspace.yaml` and the catalog entries it needs; keep the rest of the submodule out.
- `validate` runs `validate:fast` (submodule pointer check, formatting, Markdown and Mermaid docs check, build, lint, test, Knip), which is also the pre-commit hook, then `validate:extended`. `submodule:check` inspects staged changes, so stage the generated files before validating.
- `validate:extended` runs `pnpm run zizmor`, which validates GitHub workflows online through `uvx` and needs an authenticated `gh`. Knip ignores `uvx`; `gh` is detected from the package script.

## Script Contract

- `--mode plan` makes no changes and returns the proposed actions as JSON.
- `--mode apply` validates the same plan before changing files.
- Existing generated files are accepted only when their contents match exactly; existing `.gitignore` content is preserved.
- Conflicts produce structured JSON on standard output and exit code `2`.
- Invalid arguments or command failures produce structured JSON on standard error and exit code `1`.
- If the script is unavailable or fails, stop and report the failure. The script is the single source of template and version alignment, so the setup is never recreated by hand.
- If `git submodule add` fails partway through, inspect the worktree and report the partial state; destructive Git cleanup needs explicit consent.

Read [examples](references/examples.md) when checking expected output, existing-repository behavior, or rejected Node.js ranges.
