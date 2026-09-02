---
name: vitest-project-setup
description: "Vitest setup for Node.js, TypeScript, Vite, and Patricktree monorepo packages. Use when adding or editing Vitest dependencies, test and coverage scripts, Vite test config, shared config-vitest consumption, test or coverage include patterns, isolation settings, thresholds, or vitest.d.ts tsconfig coverage."
---

# Vitest Project Setup

## Install

Use workspace catalog entries when they exist. Otherwise install Vitest and its
matching V8 coverage provider:

```bash
pnpm add -D vitest@^4.0.18 @vitest/coverage-v8@^4.0.18
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

## Patricktree monorepos

When the repository uses `.patricktree-stack`, add
`.patricktree-stack/tooling/config-vitest` to `pnpm-workspace.yaml` and use the
shared package from every workspace package that runs Vitest:

```json
{
  "devDependencies": {
    "@patricktree-stack/config-vitest": "workspace:*",
    "@vitest/coverage-v8": "catalog:",
    "vitest": "catalog:"
  }
}
```

Merge the shared config into each package's `vitest.config.ts`:

```ts
import { config as baseConfig } from "@patricktree-stack/config-vitest/vitest-base.js";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, defineConfig({}));
```

The shared config collects V8 coverage for unimported production modules with:

```js
coverage: {
  include: ["src/**/*.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtsx}"],
  exclude: [
    "src/**/*.{test,spec}.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtsx}",
    "src/**/*.d.{ts,tsx,cts,ctsx,mts,mtsx}",
  ],
  provider: "v8",
  reporter: ["text", "json", "html"],
}
```

Keep those defaults in the shared config. Put only package-specific settings in
the consuming config. For example, thresholds merge into the inherited coverage
object without replacing its include, exclude, provider, or reporter fields:

```ts
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        thresholds: {
          branches: 95,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
  }),
);
```

## Standalone and Vite projects

Import `defineConfig` from `vitest/config` instead of `vite` so the `test` key is typed:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  // ... existing plugins
  test: {
    /**
     * disabling {@link https://vitest.dev/config/#isolate} to improve performance and enable worker
     * fixtures ({@link https://vitest.dev/guide/test-context.html#per-scope-context-3-2-0}); safe as
     * our code doesn't (and should not!) rely on side effects
     */
    isolate: false,

    coverage: {
      include: ["src/**/*.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtsx}"],
      exclude: [
        "src/**/*.{test,spec}.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtsx}",
        "src/**/*.d.{ts,tsx,cts,ctsx,mts,mtsx}",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

Use Vitest's default test discovery unless the project has a narrower contract.
When an explicit pattern is required, cover both colocated and separate tests,
including the extension variants the project supports:

```ts
include: [
  "src/**/*.{test,spec}.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtsx}",
  "test/**/*.{test,spec}.{js,jsx,cjs,cjsx,mjs,mjsx,ts,tsx,cts,ctsx,mts,mtsx}",
]
```

Include the configuration file in the tsconfig. Use `vitest.config.ts` for a
dedicated config or `vite.config.ts` when the Vite config owns the `test` key:

```json
{
  "include": ["vitest.config.ts"]
}
```
