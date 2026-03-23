---
name: typescript-project-setup
description: "TypeScript project configuration: tsconfig setup, compiler options, project references, and import conventions. Use when creating or editing tsconfig files, configuring project references, setting compiler options, troubleshooting module resolution, or fixing import path issues. Not for type-level programming (generics, utility types) — see typescript-magician."
---

# TypeScript Project Setup

## Build Pipeline

- Compile TypeScript with `tsc` (project build). No `tsx`, `bun`, `ts-node`, `jiti`, or similar runtime transpilers.
- Run compiled output with `node` (target `dist/`).
- For dev loop: `tsc --watch` + `node --watch dist/index.js` (or a file watcher on JS output).
- Use `outDir` in TypeScript config and wire `package.json` scripts to `tsc` then `node`.
- Entry points reference JS output only (no `.ts` in runtime).

## Base Config

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.build.json"
    }
  ]
}
```

`tsconfig.build.json`:

```json
{
  /* based on https://patricktree.me/tidbits/sensible-tsconfig-defaults */

  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2018",

    /* Modules */
    "module": "node16",
    "noUncheckedSideEffectImports": true,
    "types": [],

    /* Emit */
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    /* Interop Constraints */
    "erasableSyntaxOnly": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    /* Type Checking */
    "allowUnreachableCode": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "strict": true,

    /* Projects */
    "composite": true,
    "incremental": true,

    /* Completeness */
    "skipLibCheck": true
  },
  "exclude": ["**/node_modules"]
}
```

- for Node.js projects, add `"node"` to `compilerOptions.types`

## Additional tsconfig files (e.g. E2E tests)

When a project has files outside `src/` that import from `src/` (e.g. E2E tests in `tests/`, a `playwright.config.ts`), create a separate tsconfig that **references** `tsconfig.build.json` instead of duplicating `src` in its `include`. This way TypeScript resolves imports into `src/` through the project reference rather than re-including the source files.

Example `tsconfig.e2e.json`:

```jsonc
{
  "compilerOptions": {
    // same base options as tsconfig.build.json, but:
    "noEmit": true,
    "composite": true,
  },
  "include": ["tests", "playwright.config.ts"],
  "exclude": ["**/node_modules"],
  "references": [{ "path": "./tsconfig.build.json" }],
}
```

Add it to the root `tsconfig.json` references:

```jsonc
{
  "files": [],
  "references": [
    { "path": "./tsconfig.build.json" },
    { "path": "./tsconfig.e2e.json" },
  ],
}
```

## Key rules

- **Explicit file extensions required.** Import specifiers must include `.ts`/`.tsx` (or `.js`/`.jsx`) so TypeScript resolves them through the imports map without `tsconfig paths`.

  ```ts
  // ✅ correct
  import { cn } from "#pkg/lib/utils.ts";
  import { Button } from "#pkg/components/ui/button.tsx";

  // ❌ wrong — TypeScript can't resolve extensionless paths through #imports
  import { cn } from "#pkg/lib/utils";
  ```

- **No `tsconfig paths` needed.** TypeScript (`moduleResolution: "bundler"` or `"node16"`) resolves `#imports` from `package.json` natively when extensions are present.
