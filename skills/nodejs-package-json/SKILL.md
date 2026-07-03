---
name: nodejs-package-json
description: "Node.js package.json conventions for TypeScript/ESM packages. Use when designing or editing package metadata, scripts, exports, imports, files, or Node package entrypoints. Not for pnpm workspace configuration or tsconfig setup."
---

# Node.js package.json

> **PREREQUISITE:** Load the `pnpm` skill for package-manager and workspace configuration. Load the `typescript-project-setup` skill for TypeScript build and tsconfig guidance.

## package.json Base

```json
{
  "name": "<package-name>",
  "private": true,
  "type": "module",
  "imports": {
    "#pkg/*": "./dist/*"
  },
  "exports": {
    ".": null,
    "./*": null
  },
  "files": ["dist/**", "!dist/**/*.d.ts.map"],
  "scripts": {
    "build": "tsc --build ./tsconfig.json",
    "dev": "tsc --build ./tsconfig.json --watch",
    "format": "prettier --write --ignore-unknown .",
    "lint": "eslint --max-warnings 0 .",
    "lint:file": "eslint --max-warnings 0",
    "lint:file:fix": "eslint --max-warnings 0 --fix",
    "lint:fix": "eslint --max-warnings 0 . --fix"
  }
}
```

- change `package.json#exports` if the package exports things
  - e.g. `{ ".": "./dist/index.js", "./*": null }`
- use the `package.json#imports` instead of `tsconfig.json#compilerOptions.paths` or bundler-specific aliases (e.g. Vite `resolve.alias`)

## .gitignore

Create `.gitignore`:

```.gitignore
**/node_modules
**/dist
**/*.tsbuildinfo
```
