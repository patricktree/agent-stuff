# Compile-to-`dist/` model

One of the two build models in [`SKILL.md`](SKILL.md): `tsc` emits JS and declarations into `dist/`, and Node.js runs the emitted JS. Fits any package, including ones published to npm.

## Build pipeline

- Run the emitted JS in `dist/` with plain `node`; runtime transpilers (`tsx`, `ts-node`, `jiti`, `bun`) stay out of the pipeline.
- Dev loop: `tsc --build ./tsconfig.json --watch` alongside `node --watch dist/index.js`.
- `package.json` entry points, `exports`, and `imports` targets point at JS output in `dist/` (e.g. `"#pkg/*": "./dist/*"`).

## tsconfig

`tsconfig.build.json` adds these emit options to the shared base config:

```jsonc
{
  "compilerOptions": {
    // shared base options from SKILL.md, plus:

    /* Emit */
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "sourceMap": true,

    /* Projects */
    "incremental": true,
  },
}
```

Replace `"incremental": true` with `"composite": true` once another tsconfig references this one (see "Additional tsconfig files" in `SKILL.md`).

## Import specifiers

Specifiers end in `.js`, the extension Node.js loads at runtime. TypeScript maps `#pkg/*` → `./dist/*` back to the source file in `src/`. A `.ts` specifier fails here (TS2307), because `tsc` leaves `#imports` specifiers unrewritten and `dist/` holds no `.ts` files.

```ts
import { cn } from "#pkg/lib/utils.js";
```
