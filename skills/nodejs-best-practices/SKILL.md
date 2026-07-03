---
name: nodejs-best-practices
description: "Node.js runtime and code-level best practices. Use when writing or reviewing Node.js ESM scripts, CLIs, entrypoints, async flow, or top-level await usage. Not for package.json, ESLint, Prettier, Vitest, pnpm, or tsconfig setup."
---

# Node.js Best Practices

## Entrypoints

For ESM scripts and CLIs on supported Node.js versions, top-level `await` is acceptable. Prefer it over wrapping the whole file in an async `main()` only to enable `await`, unless a named entrypoint improves readability, testability, or error boundaries.
