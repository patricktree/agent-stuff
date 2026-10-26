---
name: node-ts-commander-cli
description: Build or refactor Node.js TypeScript CLIs with commander and @commander-js/extra-typings. Use when creating a CLI, adding commands, options, or arguments, or migrating an existing CLI to commander.
---

# Node.js TypeScript CLI with commander

## Conventions

- Import `Command` (and `Option`, `Argument`) from `@commander-js/extra-typings`, never from `commander`, so action parameters and `.opts()` are inferred from the declared arguments and options.
- Install `commander` and `@commander-js/extra-typings` at the same minor version: extra-typings peer-depends on `commander` with a `~` range. Since v15, both packages are ESM-only and need Node.js >= 22.12.
- Put the entry in `src/cli.ts`, starting with `#!/usr/bin/env node` when it is published as a package `bin`.
- Name commands and long options in kebab-case; add a short flag only for frequently used options.
- When migrating an existing CLI, keep its commands, flags, defaults, and exit codes unchanged.

## Typing gotchas

- An action receives the declared arguments first, then the command's own options, then the command itself. Options declared on a parent command are not in that options object; read them with `cmd.optsWithGlobals()`.
- Use `program.parseAsync()` whenever any action is async; `program.parse()` does not await it.
- Use `new Option(...).choices([...])` for enum-like values; extra-typings narrows the option type to the listed choices.

## Template

```ts
#!/usr/bin/env node
import { Command } from "@commander-js/extra-typings";

const program = new Command()
  .name("app")
  .description("...")
  .version("0.1.0")
  .option("-v, --verbose", "verbose output");

program
  .command("do-thing")
  .description("...")
  .argument("<target>", "thing to act on")
  .option("-f, --force", "force operation")
  .action(async (target, opts, cmd) => {
    const { verbose } = cmd.optsWithGlobals();
    if (verbose) console.log(`doing ${target}`, { force: opts.force });
  });

await program.parseAsync();
```
