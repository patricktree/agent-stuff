# Setup Examples

## Expected Version Alignment

Inputs Node.js `^24.21.0` and pnpm `12.11.2` render into the root `package.json`:

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "^24.21.0",
      "onFail": "download"
    }
  },
  "engines": {
    "pnpm": "12.11.2"
  },
  "packageManager": "pnpm@12.11.2"
}
```

## Existing-Repository Variant

The repository already has domain files and `.gitignore` entries but none of the managed setup files.

- Record the existing Git status.
- Let plan mode report the files and missing ignore patterns.
- Apply; domain files stay as they are.
- Confirm the final status contains all pre-existing changes unchanged.

If a managed file already differs, plan mode reports a conflict. Ask whether the user wants to reconcile that file manually, then rerun plan mode.
