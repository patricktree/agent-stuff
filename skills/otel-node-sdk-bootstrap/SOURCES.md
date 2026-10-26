# Sources

Checked 2026-10-26.

## Primary sources

1. [OpenTelemetry JS ESM support](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md)
   - SDK setup must run before application code.
   - ESM needs the loader hook `@opentelemetry/instrumentation/hook.mjs`; it is the only supported hook, and using `import-in-the-middle/hook.mjs` directly may stop working.
2. [opentelemetry-js#4933](https://github.com/open-telemetry/opentelemetry-js/issues/4933): open issue to move the recommended ESM bootstrap to `module.register(...)` in code.
3. [`import-in-the-middle` README](https://github.com/nodejs/import-in-the-middle/blob/main/README.md): a hook registered via `module.register()` only sees imports evaluated after registration; synchronous `module.registerHooks()` support needs Node 22.22.3, 24.11.1, 25.1.0 or 26.0.0+.
4. [Node.js DEP0205](https://nodejs.org/api/deprecations.html#dep0205-moduleregister): `module.register()` is runtime-deprecated in Node 26 in favor of `module.registerHooks()`.
5. [`NodeSDK` source](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-sdk-node/src/sdk.ts): `start(): void`, `shutdown(): Promise<void>`.

## Decisions

- Scope: greenfield Node.js + TypeScript + ESM apps that start the SDK in code.
- Pattern: `instrumentation.ts` (hook registration + SDK start) + tiny bootstrap entrypoint + dynamic import of `*-main.ts`.
- Excluded on purpose: CJS bootstraps, `--import` / `NODE_OPTIONS` preloading, zero-code auto-instrumentation, exporter and framework-specific setup.
