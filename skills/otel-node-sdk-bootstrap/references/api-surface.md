# API Surface

This skill covers a single, opinionated bootstrap surface for **Node.js + TypeScript + ESM** apps that initialize the OpenTelemetry Node SDK in code.

## Module roles

### `instrumentation.ts`

Owns OTEL SDK initialization.

Expected contents:

- `NodeSDK` construction
- exporter / processor / resource setup
- `await sdk.start()` at top level
- optional exported observability handles, such as an initialized logger facade or shutdown helper

Must not:

- start the application server / worker / CLI
- import the app's real startup graph
- hide startup side effects behind exported functions that callers may forget to invoke

### bootstrap entrypoint (`bin.ts`, `server.ts`, `worker.ts`, `cli.ts`)

Owns the module-loading order only.

Expected contents:

- static import of `instrumentation.ts`
- `await import("./*-main.ts")`

Must not:

- contain the real startup logic
- statically import app modules that should load only after instrumentation setup

### real main module (`bin-main.ts`, `server-main.ts`, `worker-main.ts`)

Owns actual application startup.

Expected contents:

- server / worker / CLI startup logic
- signal handling
- commander wiring if applicable
- imports of initialized observability objects when needed

Must not:

- initialize the OTEL SDK again

## Canonical import sequence

```ts
import "./instrumentation.ts";

await import("./bin-main.ts");
```

## Startup semantics

- `instrumentation.ts` must evaluate first
- the app module graph must load only after that evaluation completes
- the dynamic `import()` is deliberate, not stylistic

## Out of scope

This skill does not try to solve:

- CJS bootstrap patterns
- `NODE_OPTIONS=--import ...`
- loader-hook setup via `--experimental-loader`
- zero-code auto-instrumentation bootstraps
- framework-specific tracing architecture
- generic logging/tracing/metrics design
