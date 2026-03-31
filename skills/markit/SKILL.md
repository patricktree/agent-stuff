---
name: markit
description: "Convert files and URLs to Markdown using the markit CLI (markit-ai). Supports PDF, DOCX, PPTX, XLSX, HTML, EPUB, CSV, JSON, YAML, images, audio, ZIP, URLs, Wikipedia, Jupyter notebooks, RSS/Atom feeds, and code files. Use when asked to \"fetch a page as markdown\", \"convert a PDF\", \"extract text from a document\", \"download a URL as markdown\", \"convert HTML to markdown\", \"read a DOCX file\", or any file/URL-to-markdown conversion task."
---

# markit

Convert files and URLs to Markdown via the `markit-ai` npm package.

## Invocation

Always invoke via `pnpm dlx`:

```bash
pnpm dlx markit-ai <source> [options]
```

## Common patterns

```bash
# Convert a URL (raw markdown, no decoration)
pnpm dlx markit-ai https://example.com -q

# Convert a URL and write to file
pnpm dlx markit-ai https://example.com -q -o output.md

# Convert a local file
pnpm dlx markit-ai report.pdf -q

# JSON output (includes title field)
pnpm dlx markit-ai report.pdf --json

# Read from stdin
cat file.pdf | pnpm dlx markit-ai - -q

# AI-powered image description (requires OPENAI_API_KEY or ANTHROPIC_API_KEY)
pnpm dlx markit-ai photo.jpg -p "Extract all text verbatim"
```

## CLI flags

| Flag | Effect |
|------|--------|
| `-q`, `--quiet` | Raw markdown only — no decoration or metadata header |
| `-o <path>`, `--output <path>` | Write output to file instead of stdout |
| `--json` | Structured JSON output: `{ markdown, title }` |
| `-p <text>`, `--prompt <text>` | Custom AI instructions for image/audio conversion |

## Supported formats

| Category | Extensions / patterns |
|----------|----------------------|
| PDF | `.pdf` |
| Word | `.docx` |
| PowerPoint | `.pptx` |
| Excel | `.xlsx` |
| HTML | `.html`, `.htm` |
| EPUB | `.epub` |
| Jupyter | `.ipynb` |
| RSS/Atom | `.rss`, `.atom`, `.xml` |
| CSV/TSV | `.csv`, `.tsv` |
| JSON | `.json` |
| YAML | `.yaml`, `.yml` |
| XML/SVG | `.xml`, `.svg` |
| Images | `.jpg`, `.png`, `.gif`, `.webp` |
| Audio | `.mp3`, `.wav`, `.m4a`, `.flac` |
| ZIP | `.zip` (recursive — converts each file inside) |
| URLs | `http://`, `https://` |
| Wikipedia | `*.wikipedia.org` (special main-content extraction) |
| Code | `.py`, `.ts`, `.js`, `.go`, `.rs`, etc. (fenced code block) |
| Plain text | `.txt`, `.md`, `.rst`, `.log` (pass-through) |

## When to use `-q` vs `--json`

- Use `-q` when piping to other tools, writing to a file, or when only the markdown content matters.
- Use `--json` when the title metadata is also needed (parses as `{ "markdown": "...", "title": "..." }`).

## AI features (images and audio)

Image and audio files get metadata extraction (EXIF, audio tags) for free. For AI-powered description or transcription, an API key must be set:

```bash
export OPENAI_API_KEY=sk-...    # default provider
# or
export ANTHROPIC_API_KEY=sk-ant-...
```

Use `-p` to focus the AI on specific extraction tasks:

```bash
pnpm dlx markit-ai receipt.jpg -p "List all line items with prices as a table"
pnpm dlx markit-ai diagram.png -p "Describe the architecture and data flow"
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pnpm dlx` is slow on first run | Normal — downloads the package. Subsequent runs use cache. |
| URL conversion returns minimal content | Some sites block non-browser requests or render via JS. Try a different source or save the HTML locally first. |
| Image/audio returns only metadata, no description | Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` for AI features. |
| Wikipedia conversion misses sections | Use the full article URL (not mobile). markit has dedicated Wikipedia extraction. |
| PDF text extraction is garbled | The PDF may be image-based (scanned). Convert the image pages with `-p` and an API key instead. |
| stdin conversion fails | Ensure you pass `-` as the source: `cat file | pnpm dlx markit-ai -` |
| RSS/Atom `.xml` file treated as raw XML | markit auto-detects feed structure. If detection fails, rename to `.rss` or `.atom`. |
| ZIP with nested archives | Only one level of ZIP extraction. Extract nested archives separately. |
