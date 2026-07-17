# Setup Examples

## Happy Path

User request:

> Apply my ground setup here. Use Node.js `^24.18.0` and pnpm `11.1.0`.

Agent behavior:

1. Infer and confirm the package scope from the repository name.
2. Run `--mode plan` and inspect the JSON actions.
3. Run `--mode apply` with the same arguments.
4. Install and validate.

Expected alignment:

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "^24.18.0",
      "onFail": "download"
    }
  },
  "packageManager": "pnpm@11.1.0"
}
```

```yaml
catalog:
  "@types/node": ^24
```

## Robust Existing-Repository Variant

The repository already has domain files and `.gitignore` entries but none of the
managed setup files.

- Record the existing Git status.
- Let plan mode report the files and missing ignore patterns.
- Apply without deleting or rewriting domain files.
- Confirm the final status contains all pre-existing changes unchanged.

If a managed file already differs, stop on the conflict. Ask whether the user
wants to reconcile that file manually, then rerun plan mode. Never add a force
flag.

## Anti-Pattern And Correction

Anti-pattern:

- Guess Node.js and pnpm versions.
- Copy a reference repository wholesale.
- Leave `"@types/node": ^22` while using Node.js `^24.18.0`.
- Overwrite `.gitignore` and commit automatically.

Correction:

- Ask for both versions and confirm the inferred scope.
- Generate only the baseline assets through the bundled script.
- Derive `"@types/node": ^24` from Node.js `^24.18.0`.
- Preserve existing ignores, validate, and leave changes uncommitted.

## Rejected Composite Node Range

Input such as `>=22 <25` contains multiple supported majors and cannot map to one
`@types/node` major. Ask the user for a single-major range such as `^24.18.0`
instead of guessing.
