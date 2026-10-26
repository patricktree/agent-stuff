---
name: nodejs-package-json
description: "Node.js package.json conventions for TypeScript/ESM packages. Use when designing or editing package metadata, build scripts, exports, files, or Node package entrypoints. Not for pnpm workspace configuration or tsconfig setup."
---

# Node.js package.json

Load the `pnpm` skill for package-manager fields (`packageManager`, `engines.pnpm`) and workspace configuration, the `typescript-project-setup` skill for tsconfig and import-specifier rules, and the `patricktree-monorepo-setup` skill for formatting and linting scripts.

## package.json Base

```json
{
  "name": "<package-name>",
  "private": true,
  "type": "module",
  "exports": {
    ".": null,
    "./*": null
  },
  "files": ["dist/**", "!dist/**/*.d.ts.map"],
  "scripts": {
    "build": "tsc --build ./tsconfig.json",
    "dev": "tsc --build ./tsconfig.json --watch"
  }
}
```

- `exports` set to `null` blocks every entrypoint, so other packages cannot deep-import internals. Open only what the package exposes, e.g. `{ ".": "./dist/index.js", "./*": null }`.

## .gitignore

Create `.gitignore`:

```gitignore
**/node_modules
**/dist
**/*.tsbuildinfo
```
