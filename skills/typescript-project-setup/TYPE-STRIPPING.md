# Type-stripping model

One of the two build models in [`SKILL.md`](SKILL.md): Node.js runs the `.ts` source directly through [type stripping](https://nodejs.org/api/typescript.html#type-stripping), and `tsc` only type-checks and emits declarations for consumers. The reference implementation is `~/workspace/cup` (Node.js 24, TypeScript 7).

Fits workspace packages and apps that are never installed from npm, since Node.js refuses to strip types from files under `node_modules`.

## Constraints

- Source uses erasable syntax only (`erasableSyntaxOnly`), and type-only imports are marked (`verbatimModuleSyntax`).
- Import specifiers name the `.ts`/`.tsx` file, enabled by `allowImportingTsExtensions`. Extension rewriting stays off: emitted declarations keep the source specifiers, and the declaration manifest below resolves them.
- Scripts and bins run `node path/to/file.ts` with no build step.

## tsconfig

`tsconfig.json` stays the solution config referencing the build and the tests project. `tsconfig.build.json` emits declarations only:

```jsonc
{
  "compilerOptions": {
    // shared base options from SKILL.md, plus:
    "allowImportingTsExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist/types",
    "composite": true,
  },
  "include": ["src/**/*"],
  "exclude": ["**/node_modules", "**/*.test.ts"],
}
```

`tsconfig.tests.json` sets `allowImportingTsExtensions` and `"noEmit": true`, includes `test/**/*` and `**/*.test.ts`, and references `tsconfig.build.json`.

In a repo with the `.patricktree-stack` submodule, compose these from the presets in `.patricktree-stack/tooling/config-typescript/` via `"extends": [...]` instead of inlining options: `tsconfig.defaults.json`, one environment preset (`node24`, `web`, `cloudflare-workers`, ...), `composite-emit-declaration-only` or `vitest`, and `typescript-execution-via-type-stripping`.

## Package scopes

Source and declarations need separate `#imports` mappings, so each lives in its own package scope:

- Root `package.json`: `"imports": { "#src/*": "./src/*" }` for tests, scripts, and config outside `src/`; `exports` conditions point `types` at `./dist/types/*.d.ts` and `default` at `./src/*.ts`.
- `src/package.json` (checked in): `{ "type": "module", "imports": { "#src/*": "./*" } }`, the scope for source files.
- `dist/types/package.json` (generated): the same mappings rewritten from `.ts` to `.d.ts`, so consumers type-check against declarations instead of falling through to the dependency's source.

Generate the declaration manifest before `tsc --build`, also clearing stale declarations and `*.tsbuildinfo` so renamed or deleted source files leave no outputs behind. cup does this with `tooling/prepare-declaration-build`:

```json
"turbo:build": "prepare-declaration-build --declaration-output-dir ./dist/types --build-info-file ./dist/tsconfig.build.tsbuildinfo --source-package-json ./src/package.json && tsc --build ./tsconfig.json"
```

cup's `docs/declaration-builds.md` explains the design in full.
