---
name: write-markdown
description: Write or edit Markdown with one source line per prose paragraph, then validate it with markdownlint-cli2. Use whenever creating or changing Markdown files.
---

# Write Markdown

## Source layout

- Keep each prose paragraph on one source line and let the renderer wrap it. Wrap at a column limit only when the user or repository requires one, e.g. through `MD013` in its markdownlint config.
- Keep each list item on one source line unless it contains a nested block or another structure that requires multiple lines.
- Preserve newlines that carry Markdown meaning, including headings, blank lines between blocks, list boundaries, table rows, block quotes, code blocks, and deliberate hard breaks.

## Validate changes

1. Identify every Markdown file changed during the turn.
2. Run markdownlint after all edits:

   ```sh
   pnpm dlx markdownlint-cli2 --config ~/.agents/skills/write-markdown/.markdownlint-cli2.jsonc --fix README.md
   ```

   Replace `README.md` with the changed Markdown paths, all in one command. The `--config` file is only the base: a markdownlint config in the repository overrides it.

3. Fix remaining issues by hand, keeping prose unwrapped, until markdownlint reports 0 issues.
