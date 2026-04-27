---
name: otel-node-sdk-bootstrap
description: Set up OpenTelemetry Node SDK initialization correctly in Node.js TypeScript ESM apps. Use when the user asks to initialize OTEL early, fix OTEL SDK startup order, bootstrap OpenTelemetry in an ESM entrypoint, split a server or CLI entrypoint into `instrumentation.ts` + bootstrap file + implementation file, or ensure the SDK is registered before the rest of the module graph loads.
---

# OTEL Node SDK Bootstrap

Use this skill for **greenfield** Node.js + TypeScript + **ESM** applications that need a correct OpenTelemetry bootstrap sequence.

This skill is intentionally narrow and opinionated.

## When to use this pattern

Use this pattern when all of the following are true:

- the app runs as **ESM**
- the app initializes the **OpenTelemetry Node SDK** in application code
- the SDK must be registered **before** the rest of the app module graph loads
- the app has a clear entrypoint such as `bin.ts`, `server.ts`, `worker.ts`, or `cli.ts`

If the app is CJS or is bootstrapped externally via `node --import ...` / `NODE_OPTIONS`, this skill does **not** apply directly.

Read these bundled references before editing:

- `references/api-surface.md`

## Required file layout

Use this exact seam unless the user has already approved a different naming convention:

- `instrumentation.ts` — initializes OTEL at top level
- bootstrap entrypoint such as `bin.ts` / `server.ts` / `worker.ts`
- real main module such as `bin-main.ts` / `server-main.ts` / `worker-main.ts`

### Responsibilities

**`instrumentation.ts`**

- initializes the Node SDK at top level
- exports initialized observability objects only when needed
- does not start the application

**bootstrap entrypoint**

- does a **static import** of `instrumentation.ts`
- then does a **dynamic import** of the real main module via `await import(...)`
- contains no real app startup logic besides the bootstrap split

**`*-main.ts`**

- contains the actual application startup logic
- may import observability objects from `instrumentation.ts`
- must not initialize the SDK itself

## Canonical pattern

```ts
// bin.ts
import "./instrumentation.ts";

await import("./bin-main.ts");
```

```ts
// instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";

export const sdk = new NodeSDK({
  // exporters, resources, processors, instrumentations
});

await sdk.start();
```

```ts
// bin-main.ts
import { startServer } from "./server.ts";

await startServer();
```

## Why this split exists

OpenTelemetry SDK setup must happen **before** application modules that should be observed are loaded.

For ESM entrypoints, the safe pattern is:

1. statically import `instrumentation.ts`
2. let it register the SDK first
3. then dynamically import the real main module

The dynamic `import()` starts a fresh ESM evaluation phase after instrumentation setup, which prevents the main application graph from loading too early.

## Workflow

1. Confirm the app is ESM and this skill applies.
2. Identify the runtime entrypoint.
3. Create `instrumentation.ts`.
4. Move real startup logic into `*-main.ts`.
5. Reduce the original entrypoint to:
   - static import of `instrumentation.ts`
   - dynamic import of `*-main.ts`
6. Ensure no other module initializes the Node SDK.
7. Validate startup, build, and tests.

## Guardrails

- Do **not** put the main startup logic in the bootstrap entrypoint.
- Do **not** initialize the SDK lazily from a helper imported deep in the app.
- Do **not** rely on import order inside a large entrypoint file once app modules are already statically imported there.
- Do **not** create multiple SDK initializations in the same process.
- Do **not** broaden this skill into generic OTEL architecture advice; keep it about the bootstrap sequence.

## Output expectations

When applying this skill, produce:

- the 3-file bootstrap split
- a short explanation of why the dynamic import is required
- any startup command caveats that still matter for this repo
- validation results
