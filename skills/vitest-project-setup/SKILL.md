---
name: vitest-project-setup
description: "Vitest setup for Node.js, TypeScript, and Vite projects. Use when adding or editing Vitest dependencies, test scripts, Vite test config, test include patterns, isolation settings, or vitest.d.ts tsconfig coverage."
---

# Vitest Project Setup

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

Include `vite.config.ts` in the tsconfig:

```json
{
  "include": ["vite.config.ts"]
}
```
