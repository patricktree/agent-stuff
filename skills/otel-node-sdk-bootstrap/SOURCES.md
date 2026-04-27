# Sources

## Primary sources

1. OpenTelemetry JS ESM support
   - https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md
   - Key points used:
     - SDK setup must run before application code
     - ESM needs special startup care
     - `--import` / loader-hook guidance exists, but is broader than this skill's narrow scope

2. Local implementation example
   - `packages/backend/src/bin.ts`
   - `packages/backend/src/instrumentation.ts`
   - `packages/backend/src/bin-main.ts`
   - Key points used:
     - concrete 3-file split
     - top-level await bootstrap pattern
     - observability object reuse after initialization

## Decisions

- Chosen scope: **greenfield only**
- Chosen runtime shape: **Node.js + TypeScript + ESM only**
- Chosen pattern: **`instrumentation.ts` + tiny bootstrap entrypoint + dynamic import of `*-main.ts`**
- Excluded on purpose:
  - CJS bootstraps
  - generic OTEL architecture guidance
  - zero-code auto-instrumentation
  - loader-hook deep dives

## Coverage matrix

- API surface: covered in `references/api-surface.md`
- naming / file seam convention: covered in `SKILL.md` and `references/api-surface.md`

## Gaps intentionally left open

- exact `NODE_OPTIONS` / `--import` / `--experimental-loader` startup commands for every environment
- CJS equivalents
- framework-specific tracing/instrumentation packages
- runtime-specific exporter selection
