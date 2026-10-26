---
name: otel-node-sdk-bootstrap
description: Bootstrap the OpenTelemetry Node SDK in Node.js TypeScript ESM apps so the SDK and its ESM loader hook are registered before the app module graph loads. Use when initializing OTEL in an ESM entrypoint, fixing OTEL startup order or ESM imports that are not instrumented, or splitting an entrypoint into `instrumentation.ts`, a bootstrap file and a `*-main.ts` file.
---

# OTEL Node SDK Bootstrap

This skill covers one opinionated bootstrap for **greenfield** Node.js + TypeScript + **ESM** apps that start the OpenTelemetry Node SDK in application code, from an entrypoint such as `bin.ts`, `server.ts`, or `cli.ts`. CJS apps and apps preloaded via `node --import` / `NODE_OPTIONS` need a different setup; tell the user this skill does not fit them.

## Why the split exists

Instrumentation patches a module only if it is loaded after the SDK started. ESM makes this strict in two ways:

- Node resolves and links every **static** import of a graph before any module body runs, so statements at the top of `instrumentation.ts` cannot run before sibling static imports in the same graph are loaded.
- Packages the app loads via `import` bypass `require`, so OTEL patches them only through its ESM loader hook (`import-in-the-middle`), and a loader hook sees only modules imported after it is registered. Without the hook, some instrumentation still works by accident (modules that packages `require` internally, such as `http` or `pg`), while packages like `express` stay silently unpatched.

So `instrumentation.ts` registers the hook and starts the SDK, and the bootstrap entrypoint then pulls in the app with a dynamic `import()`, so every app module loads after both are in place. Replacing it with a static import leaves the app uninstrumented without any error.

## File layout

Use these three modules unless the user has approved other names:

| Module                                           | Owns                                                                                                                                                                   | Contains nothing of                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `instrumentation.ts`                             | Registering the ESM loader hook, then building and starting `NodeSDK` at top level. Exports initialized handles (`sdk`, a logger facade) only when the app needs them. | App startup or imports of the app graph. Startup side effects hidden behind functions a caller must remember to invoke. |
| Bootstrap entrypoint (`bin.ts`, `server.ts`, …)  | Module-loading order: one static import of `instrumentation.ts`, then `await import()` of the main module.                                                             | Startup logic or static imports of app modules.                                                                         |
| Main module (`bin-main.ts`, `server-main.ts`, …) | Real startup: server or CLI wiring, signal handling, calling `sdk.shutdown()` on exit. May import handles from `instrumentation.ts`.                                   | A second SDK initialization.                                                                                            |

## Canonical pattern

```ts
// bin.ts
import "./instrumentation.ts";

await import("./bin-main.ts");
```

```ts
// instrumentation.ts
import { register } from "node:module";
import { NodeSDK } from "@opentelemetry/sdk-node";

register("@opentelemetry/instrumentation/hook.mjs", import.meta.url);

export const sdk = new NodeSDK({
  // exporters, resources, processors, instrumentations
});

sdk.start();
```

```ts
// bin-main.ts
import { startServer } from "./server.ts";

await startServer();
```

`sdk.start()` is synchronous; `sdk.shutdown()` returns a promise.

`@opentelemetry/instrumentation/hook.mjs` is the only loader hook OTEL supports; it wraps `import-in-the-middle`, so do not register `import-in-the-middle/hook.mjs` directly. Node 26 runtime-deprecates `module.register()` (DEP0205) in favor of the synchronous `module.registerHooks()`, which OTEL does not support yet ([opentelemetry-js#4933](https://github.com/open-telemetry/opentelemetry-js/issues/4933)). On Node 26+, keep `register()`, mention the deprecation warning to the user, and check that issue for a supported synchronous hook before inventing one.

## Workflow

1. Confirm the app is ESM and starts the SDK in code.
2. Identify the runtime entrypoint.
3. Create `instrumentation.ts` with the hook registration and SDK start, and add `@opentelemetry/instrumentation` as a direct dependency: the hook specifier resolves from `instrumentation.ts`, so a strict package manager such as pnpm fails with `ERR_MODULE_NOT_FOUND` when it is only transitive.
4. Move the real startup logic into `*-main.ts`.
5. Reduce the entrypoint to the static import of `instrumentation.ts` plus the dynamic import of `*-main.ts`.
6. Search the repo for other `NodeSDK` constructions or `sdk.start()` calls; the process starts the SDK exactly once, in `instrumentation.ts`.
7. Validate: build, tests, and one real startup that shows spans from an ESM-imported instrumented package (for example `express`), not only from manual spans.

## Scope

Keep the work about the bootstrap sequence. Exporter choice, framework-specific instrumentation and general tracing, metrics or logging design belong to separate requests.

## Report

Tell the user:

- the three-file split you made
- why the dynamic import and the loader hook are both required
- startup command caveats that still apply to this repo (for example a Node version that emits DEP0205)
- validation results
