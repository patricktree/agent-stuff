---
name: nodejs-project-best-practices
description: "Best practices for Node.js + TypeScript project setup, build, and runtime execution. Use when designing or editing Node/TS tooling, scripts, package.json, linting, formatting, build pipelines, or when asked for TypeScript execution guidance."
---

# Nodejs Project Best Practices

## Package Manager (pnpm)

- Use **pnpm** with Corepack.
- Use `pnpm dlx` instead of `npx` to run one-off packages (e.g. `pnpm dlx create-next-app`).
- Set `package.json#packageManager` and `package.json#engines.pnpm` to the latest pnpm version.

Find latest pnpm version via `npm view pnpm version`.

```json
{
  "packageManager": "pnpm@<latest-version>",
  "engines": {
    "pnpm": "<latest-version>"
  }
}
```

Corepack setup:

```bash
corepack enable
pnpm --version # must print the latest version
```

## TypeScript Build Pipeline

- Compile TypeScript with `tsc` (project build). No `tsx`, `bun`, `ts-node`, `jiti`, or similar runtime transpilers.
- Run compiled output with `node` (target `dist/`).
- For dev loop: `tsc --watch` + `node --watch dist/index.js` (or a file watcher on JS output).
- Keep `outDir` in `tsconfig.json` and wire `package.json` scripts to `tsc` then `node`.
- Entry points reference JS output only (no `.ts` in runtime).

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

## `pnpm-workspace.yaml` (pnpm settings)

```yaml
# enforce specific Node.js and pnpm version (https://pnpm.io/npmrc#engine-strict)
engineStrict: true

# handle peer dependencies in a strict way
autoInstallPeers: false
dedupePeerDependents: false
strictPeerDependencies: true
resolvePeersFromWorkspaceRoot: false

# https://pnpm.io/npmrc#update-notifier
updateNotifier: false

# workspace-concurrency=0 will use amount of cores of the host to run tasks concurrently (see https://pnpm.io/cli/recursive#--workspace-concurrency)
workspaceConcurrency: 0
```

## Prettier Setup

Install Prettier and the package.json plugin:

```bash
pnpm add -D prettier@^3.3.3 prettier-plugin-packagejson@^2.5.2
```

Create `prettier.config.cjs` with this exact config:

```js
module.exports = {
  trailingComma: "all",
  printWidth: 100,
  endOfLine: "auto",
  plugins: ["prettier-plugin-packagejson"],
};
```

## TypeScript

### Base Config

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

- for Node.js projects, add `"node"` to `tsconfig.json#compilerOptions.types`

### Key rules

- **Explicit file extensions required.** Import specifiers must include `.ts`/`.tsx` (or `.js`/`.jsx`) so TypeScript resolves them through the imports map without `tsconfig paths`.

  ```ts
  // ✅ correct
  import { cn } from "#pkg/lib/utils.ts";
  import { Button } from "#pkg/components/ui/button.tsx";

  // ❌ wrong — TypeScript can't resolve extensionless paths through #imports
  import { cn } from "#pkg/lib/utils";
  ```

- **No `tsconfig paths` needed.** TypeScript (`moduleResolution: "bundler"` or `"node16"`) resolves `#imports` from `package.json` natively when extensions are present.

## ESLint Setup

Install ESLint and all required plugins/configs:

```bash
pnpm add -D \
  eslint@^8.57.1 \
  @typescript-eslint/parser@^8.51.0 \
  @typescript-eslint/eslint-plugin@^8.51.0 \
  eslint-plugin-only-warn@^1.1.0 \
  eslint-plugin-n@^17.23.1 \
  eslint-plugin-regexp@^2.6.0 \
  eslint-plugin-jsdoc@^50.2.2 \
  eslint-plugin-import@^2.30.0 \
  eslint-plugin-unicorn@^55.0.0 \
  eslint-plugin-eslint-comments@^3.2.0
```

Create `.eslintrc.cjs` with this exact config:

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    projectService: true,
    sourceType: "module",
  },
  plugins: [
    /**
     * add "only-warn" plugin to change all errors to warnings.
     * ESLint is executed via Git hooks with --max-warnings 0 anyways. Transforming all errors to warnings
     * allows to distinguish ESLint warnings from other errors (e.g. TypeScript compile errors) in the
     * code editor (e.g. VS Code).
     */
    "only-warn",
    "@typescript-eslint/eslint-plugin",
    "n",
    "regexp",
    "jsdoc",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:regexp/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:n/recommended",
    "plugin:unicorn/recommended",
    "plugin:eslint-comments/recommended",
  ],
  ignorePatterns: [".eslintrc.cjs", "prettier.config.cjs", "dist/**/*"],
  rules: {
    curly: "error",
    "multiline-comment-style": ["error", "starred-block"],
    "no-console": "error",
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-empty-pattern": "off",
    "no-promise-executor-return": "error",
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "MemberExpression[object.name='it'][property.name='only'], MemberExpression[object.name='test'][property.name='only'], MemberExpression[object.name='apiTest'][property.name='only']",
        message:
          'Do not check in spec files with tests using ".only" - the other tests of that spec file would be skipped!',
      },
      {
        selector:
          "MemberExpression[object.name='it'][property.name='skip'], MemberExpression[object.name='test'][property.name='skip'], MemberExpression[object.name='apiTest'][property.name='skip']",
        message: "Do not check in dead tests. Either fix or delete them.",
      },
      {
        selector: "[property.name='toBe']",
        message:
          "Prefer `expect(...).toEqual()` over `expect(...).toBe()`. This does not make any difference " +
          "for primitive types, but in case of objects/arrays `toEqual()` will perform a deep comparison " +
          "(compared to `toBe()` which checks for referential equality).",
      },
    ],
    "no-undef": "off",
    "no-unneeded-ternary": "error",
    "no-useless-computed-key": "error",
    "object-shorthand": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-template": "error",
    "require-atomic-updates": "error",
    "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
    "import/newline-after-import": "error",
    "import/no-absolute-path": "error",
    "import/no-cycle": "error",
    "import/no-duplicates": "error",
    "import/no-dynamic-require": "error",
    "import/no-mutable-exports": "error",
    "import/no-self-import": "error",
    // disable "import/no-unresolved" --> covered by TypeScript
    "import/no-unresolved": "off",
    "import/no-useless-path-segments": "error",
    "n/handle-callback-err": "error",
    /* n/hashbang has false positives */
    "n/hashbang": "off",
    "n/no-callback-literal": "error",
    // disable "n/no-extraneous-import" --> thanks to "isolated mode" of node_modules of pnpm and "public-hoist-pattern" being disabled of this monorepo, there is no possibilty for extraneous imports
    "n/no-extraneous-import": "off",
    // disable "n/no-missing-import" and "n/no-missing-require" --> covered by TypeScript
    "n/no-missing-import": "off",
    "n/no-missing-require": "off",
    "n/no-process-env": "error",
    "n/no-sync": "error",
    // disable "n/no-unpublished-import" and "n/no-unpublished-require" --> wrong positive for "@vercel/analytics" for whatever reason
    "n/no-unpublished-import": ["error", { ignoreTypeImport: true }],
    "n/no-unpublished-require": "off",
    // disable "n/no-unsupported-features/es-builtins" --> covered by TypeScript
    "n/no-unsupported-features/es-builtins": "off",
    // disable "n/no-unsupported-features/es-syntax" --> covered by TypeScript
    "n/no-unsupported-features/es-syntax": "off",
    // disable "n/no-unsupported-features/node-builtins" --> covered by TypeScript
    "n/no-unsupported-features/node-builtins": "off",
    "regexp/no-unused-capturing-group": ["error", { allowNamed: true }],
    "unicorn/better-regex": "off",
    "unicorn/consistent-destructuring": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-array-callback-reference": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/no-null": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/prefer-dom-node-dataset": "off",
    "unicorn/prefer-module": "off",
    "unicorn/prefer-string-replace-all": "off",
    "unicorn/prefer-top-level-await": "off",
    "unicorn/prevent-abbreviations": "off",
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/class-literal-property-style": "error",
    "@typescript-eslint/consistent-indexed-object-style": "off",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: { constructors: "off" },
      },
    ],
    "@typescript-eslint/method-signature-style": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-base-to-string": [
      "error",
      { ignoredTypeNames: ["Error", "Moment"] },
    ],
    "@typescript-eslint/no-confusing-non-null-assertion": "error",
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-base-to-string": [
      "error",
      { ignoredTypeNames: ["RegExp"] },
    ],
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/no-meaningless-void-operator": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: { attributes: false } },
    ],
    "@typescript-eslint/no-namespace": [
      "error",
      {
        // namespace can be useful to group related typings
        allowDeclarations: true,
      },
    ],
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-unnecessary-condition": [
      "error",
      { allowConstantLoopConditions: true },
    ],
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/non-nullable-type-assertion-style": "error",
    "@typescript-eslint/parameter-properties": [
      "error",
      {
        allow: ["private readonly", "protected readonly", "public readonly"],
        prefer: "parameter-property",
      },
    ],
    "@typescript-eslint/prefer-enum-initializers": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-literal-enum-member": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/require-array-sort-compare": [
      "error",
      { ignoreStringArrays: true },
    ],
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {
        allowBoolean: true,
      },
    ],
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/unified-signatures": "error",
  },
  overrides: [
    {
      files: [
        "**/*.ts",
        "**/*.cts",
        "**/*.mts",
        "**/*.tsx",
        "**/*.ctsx",
        "**/*.mtsx",
      ],
      extends: ["plugin:jsdoc/recommended-typescript-error"],
      rules: {
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-returns-description": "off",
      },
    },
    {
      files: [
        "**/*.js",
        "**/*.cjs",
        "**/*.mjs",
        "**/*.jsx",
        "**/*.cjsx",
        "**/*.mjsx",
      ],
      extends: ["plugin:jsdoc/recommended-typescript-flavor-error"],
      rules: {
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-returns-description": "off",
      },
    },
  ],
};
```

## .gitignore

Create `.gitignore`:

```.gitignore
**/node_modules
**/dist
**/*.tsbuildinfo
```

## Testing (Vitest)

Install Vitest:

```bash
pnpm add -D vitest@^4.0.18
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Vite projects

Import `defineConfig` from `vitest/config` instead of `vite` so the `test` key is typed:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  // ... existing plugins
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],

    /**
     * disabling {@link https://vitest.dev/config/#isolate} to improve performance and enable worker
     * fixtures ({@link https://vitest.dev/guide/test-context.html#per-scope-context-3-2-0}); safe as
     * our code doesn't (and should not!) rely on side effects
     */
    isolate: false,
  },
});
```

Include `vitest.d.ts` in the tsconfig:

```json
{
  "include": ["vite.config.ts"]
}
```
