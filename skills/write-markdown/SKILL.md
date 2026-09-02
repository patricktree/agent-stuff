---
name: write-markdown
description: Write or edit Markdown with one source line per prose paragraph, then validate it with markdownlint-cli2. Use whenever creating or changing Markdown files.
---

# Write Markdown

## Source layout

- Keep each prose paragraph on one source line. Let the Markdown renderer wrap it visually.
- Keep each list item on one source line unless it contains a nested block or another structure that requires multiple lines.
- Do not hard-wrap prose to a column limit unless the user or repository explicitly requires it.
- Preserve newlines that carry Markdown meaning, including headings, blank lines between blocks, list boundaries, table rows, block quotes, fenced code blocks, and deliberate hard breaks.
- Preserve intentional multiline code and shell command continuations.

## Validate changes

1. Identify every Markdown file changed during the turn.
2. Run markdownlint after all edits:

   ```sh
   pnpm dlx markdownlint-cli2 --config ~/.agents/skills/write-markdown/.markdownlint-cli2.jsonc --fix README.md
   ```

   Replace `README.md` with the changed Markdown paths. Pass multiple paths in one command when applicable.

3. Fix any remaining issues without introducing hard-wrapped prose.
