---
name: patricktree-monorepo-setup
description: Sets up Patrick Kerschbaum's standard pnpm TypeScript monorepo foundation with the `.patricktree-stack` submodule, shared catalogs, Turborepo, oxfmt, oxlint, Knip, Husky, and VS Code settings. Use when asked to reproduce Patrick's "ground setup", default pnpm monorepo setup, or `.patricktree-stack` baseline in a Git repository.
---

# Patricktree Monorepo Setup

Create the standard foundation with the bundled non-interactive scaffold script.
Do not commit the result.

## Required Inputs

Obtain and confirm these values before planning. Ask one combined question for any
value the user did not provide.

| Input | Example | Rule |
| --- | --- | --- |
| Node.js version | `^24.18.0` | Use as `devEngines.runtime.version`. |
| pnpm version | `11.1.0` | Require an exact semantic version. |
| package scope | `pv-analysis` | Infer from the repository directory, then confirm. |

The script derives the Node.js major and aligns the catalog automatically:
`^24.18.0` produces `"@types/node": ^24`.

## Workflow

1. Confirm the target is the Git repository root and inspect `git status --short`.
   Preserve all pre-existing changes and never overwrite conflicting setup files.
2. Resolve `scripts/scaffold.mjs` against this skill directory.
3. Generate a machine-checkable plan:

   ```sh
   node <resolved-script-path> \
     --mode plan \
     --target <repository-root> \
     --node-version '^24.18.0' \
     --pnpm-version '11.1.0' \
     --scope 'pv-analysis'
   ```

4. Inspect the JSON output. Continue only when `valid` is `true`, `conflicts` is
   empty, and every action is expected. Resolve conflicts with the user rather
   than using force or deleting files.
5. Re-run the same command with `--mode apply`. The script adds or initializes
   `.patricktree-stack`, writes deterministic setup files, preserves existing
   `.gitignore` entries, and prints a JSON result.
   The generated workspace opts into only the `.patricktree-stack` projects used
   by the baseline (currently `tooling/config-oxfmt`). Add further submodule
   project paths to `pnpm-workspace.yaml` only when the consuming repository uses
   them; do not enumerate the whole submodule.
   The baseline also runs online Zizmor validation through uvx from the
   pre-commit hook. It expects authenticated gh and installed uvx commands;
   Knip is configured to ignore uvx, while gh is detected from the package
   script. The shared catalog contains only baseline dependencies; add catalog
   entries required by any additional opt-in submodule projects.
6. Enable Corepack once, install, and verify the selected pnpm version:

   ```sh
   corepack enable
   pnpm --version
   pnpm install
   ```

7. Run the validation loop. Fix failures and repeat the failed check before
   proceeding:

   ```sh
   pnpm run fix
   pnpm run validate
   pnpm run zizmor
   pnpm run format:check
   git diff --check
   git status --short
   git submodule status
   ```

8. Report generated files, versions, submodule revision, validation results, and
   pre-existing changes that remain untouched.

## Script Contract

- `--mode plan` makes no changes and returns the proposed actions as JSON.
- `--mode apply` validates the same plan before changing files.
- Existing generated files are accepted only when their contents match exactly.
- Existing `.gitignore` content is preserved; only missing baseline patterns are
  appended.
- Conflicts produce structured JSON on standard output and exit code `2`.
- Invalid arguments or command failures produce structured JSON on standard
  error and exit code `1`.
- If the script is unavailable or fails, stop and report the failure. Do not
  recreate the setup ad hoc because that bypasses template and version alignment.
- If `git submodule add` fails partway through, inspect the worktree and report
  the partial state; do not run destructive Git cleanup without explicit consent.

Read [examples](references/examples.md) when checking invocation variants,
conflict behavior, or version-alignment examples.
