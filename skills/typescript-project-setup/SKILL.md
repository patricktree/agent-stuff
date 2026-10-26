---
name: typescript-project-setup
description: "TypeScript project configuration: tsconfig setup, compiler options, project references, build models (compile to dist or Node.js type stripping with declaration-only builds), and import conventions. Use when creating or editing tsconfig files, configuring project references, setting compiler options, setting up a TypeScript build, or fixing module resolution and import specifiers. Not for type-level programming (generics, utility types) — see typescript-magician."
---

# TypeScript Project Setup

## Installation

Everything in this skill applies to both TypeScript 6 and TypeScript 7 (the native `tsc`, published as the same `typescript` package). New projects install TypeScript 7:

```bash
pnpm add -D typescript@^7.0.0
```

Stay on `typescript@^6.0.0` when the project already pins TypeScript 6, or when a tool in the project does not yet support TypeScript 7.

## Build model

Two build models, equally valid. Each has a reference file holding its emit options, package.json wiring, and import specifier rule; read the one in use before configuring a package.

- **Compile-to-`dist/`** ([`COMPILE-TO-DIST.md`](COMPILE-TO-DIST.md)): `tsc` emits JS and declarations into `dist/`, and Node.js runs the JS. Import specifiers end in `.js`.
- **Type stripping** ([`TYPE-STRIPPING.md`](TYPE-STRIPPING.md)): Node.js runs `.ts` source directly, and `tsc` emits only declarations into `dist/types/`. Import specifiers end in `.ts`/`.tsx`. Node.js refuses to strip types under `node_modules`, so this model only fits packages that are never installed from npm (workspace packages and apps).

In an existing project, follow the model it already uses: `node … .ts` scripts, `allowImportingTsExtensions`, or the `typescript-execution-via-type-stripping` preset signal type stripping; `exports`/`imports` targets in `dist/` signal compile-to-`dist/`. For a new project, ask the user which model to use.

Both models build with `tsc --build ./tsconfig.json`. The root `tsconfig.json` is a solution config (`"files": []`), so plain `tsc` without `--build` compiles nothing.

## Base config

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

`tsconfig.build.json` starts from these shared options; the model's reference file adds its emit options:

```json
{
  /* based on https://patricktree.me/tidbits/sensible-tsconfig-defaults ("TS 6.0/7.0 Node.js" tab) */

  "compilerOptions": {
    /* Type Checking */
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,

    /* Modules */
    "module": "Node20",
    "moduleResolution": "Node16",
    "rootDir": "./src",
    "types": ["node"],

    /* Interop Constraints */
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,

    /* Language and Environment */
    "target": "ES2022",

    /* Completeness */
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/node_modules"]
}
```

### Defaults since TS 6.0

- `types` defaults to `[]` since TS 6.0 (no implicit `@types` inclusion), so Node.js projects list `"node"` in `compilerOptions.types`.
- `rootDir` defaults to the tsconfig directory since TS 6.0, so project configs set `"rootDir": "./src"` to keep the output mirroring the source layout.

## Additional tsconfig files (e.g. tests)

When a project has files outside `src/` that import from `src/` (e.g. tests in `test/`, E2E tests, a `playwright.config.ts`), create a separate tsconfig that **references** `tsconfig.build.json` instead of duplicating `src` in its `include`. This way TypeScript resolves imports into `src/` through the project reference rather than re-including the source files.

A referenced project must be composite, so `tsconfig.build.json` sets `"composite": true` (which implies `incremental` and `declaration`); otherwise `tsc --build` fails with TS6306.

Example `tsconfig.e2e.json`:

```jsonc
{
  "compilerOptions": {
    // same base options as tsconfig.build.json, but:
    "noEmit": true,
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

- **Explicit file extensions.** Every relative and `#imports` specifier names a file extension; which one depends on the build model.
- **`package.json#imports` instead of `tsconfig paths`.** TypeScript (`moduleResolution: "node16"` or `"bundler"`) resolves `#imports` natively, and Node.js honors them at runtime without extra tooling.
