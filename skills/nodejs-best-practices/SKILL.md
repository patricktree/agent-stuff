---
name: nodejs-best-practices
description: "Node.js runtime and code-level best practices. Use when writing or reviewing Node.js ESM scripts, CLIs, entrypoints, async flow, or top-level await usage. Not for package.json, ESLint, Prettier, Vitest, pnpm, or tsconfig setup."
---

# Node.js Best Practices

## Entrypoints

In ESM entrypoints (scripts, CLIs), use top-level `await` directly instead of wrapping the whole file in an async `main()` only to enable `await`. Keep a named entrypoint function when it improves readability, testability, or error boundaries.

Keep top-level `await` in entrypoints, out of modules that other code imports: `require()` of an ES module (unflagged since Node.js 20.19 and 22.12) throws `ERR_REQUIRE_ASYNC_MODULE` when the imported module graph contains top-level `await`.
