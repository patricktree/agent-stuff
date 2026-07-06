---
name: docling-convert
description: Convert PDFs and Office documents (DOCX, PPTX, XLSX) into agent-processable Markdown using Docling in Docker. Use when the user asks for Docling, PDF/DOCX/PPTX/XLSX-to-Markdown extraction, structure-aware document conversion, or document conversion that must not depend on local Python. Do not use for PDF page rasterization; use convert-pdf-to-image for PDF-to-PNG/JPEG/TIFF/page-image rendering.
---

# Docling Convert

Convert PDFs and Office documents to Markdown with Docling in Docker. Do not rely
on local Python.

## Use This For

- PDF, DOCX, PPTX, or XLSX extraction into Markdown for agent processing.
- Structure-aware conversion where tables, headings, reading order, and optional
  JSON sidecars matter.
- Workflows that require Docker instead of local Python packages.

Use `convert-pdf-to-image` instead when the user needs page images, screenshots,
DPI control, or raster rendering.

## Script

Run the bundled non-interactive helper from this skill directory:

```sh
node scripts/docling-convert.mjs --input ./paper.pdf --out-dir ./converted
```

Common variants:

```sh
node scripts/docling-convert.mjs --input ./paper.pdf --out-dir ./converted --json
node scripts/docling-convert.mjs --input ./paper.pdf --output ./converted/paper.md --overwrite
node scripts/docling-convert.mjs --input ./text.pdf --out-dir ./converted -- --no-ocr
node scripts/docling-convert.mjs --input ./scan.pdf --out-dir ./converted -- --ocr --force-ocr
```

## Contract

- Requires `docker` and `node`; fails fast if either is unavailable.
- Accepts `.pdf`, `.docx`, `.pptx`, and `.xlsx` by default; pass `--force` only
  when intentionally letting Docling try another extension.
- Requires exactly one of:
  - `--out-dir <dir>`: writes to `<dir>/<input-stem>/`.
  - `--output <file.md>`: writes the primary Markdown file exactly there.
- Fails rather than overwriting existing output unless `--overwrite` is passed.
- Builds the local Docker image from this skill's `Dockerfile` when missing;
  first build can be slow because it installs Docling, native OpenCV runtime
  libraries, and PDF layout, table, and RapidOCR models for offline conversion.
- Saves the default image to `.cache/docker-images/` inside this skill after
  build and reloads it if `docker system prune -a` removes the Docker image.
- Runs Docker with input parent mounted read-only and output mounted read-write.
- Runs with `--network none` by default; set `DOCLING_DOCKER_NETWORK=default`
  only when a Docling option truly needs network access.
- Runs as the current UID/GID by default on macOS/Linux; set
  `DOCLING_DOCKER_USER=default` to use the container default user.

## Output Shape

For `--out-dir ./converted` and `--input ./paper.pdf`:

```text
converted/
  paper/
    paper.md
    paper.json        # when --json is passed and Docling emits JSON
    *_artifacts/      # when Docling emits referenced assets
```

For `--output ./converted/paper.md`, sidecars are written next to the exact
output path when requested/emitted.

## Environment Overrides

| Variable | Default | Purpose |
| --- | ---: | --- |
| `DOCLING_DOCKER_IMAGE` | `agent-docling-convert:2026-07-06` | Override the Docker image. |
| `DOCLING_DOCKER_BUILD` | `missing` | `never`, `missing`, or `always` for building the default image. |
| `DOCLING_DOCKER_ARCHIVE` | `missing` | `never`, `missing`, or `always` for saving the default image archive. |
| `DOCLING_DOCKER_NETWORK` | `none` | Docker network mode. |
| `DOCLING_DOCKER_USER` | current UID:GID | Use `default` to skip `--user`. |

## Failure Handling

- If Docker is unavailable or not running, tell the user Docker is required
  because the workflow intentionally avoids local Python.
- If conversion fails, retry only after addressing the specific Docling or Docker
  error; do not silently fall back to Python, `markit`, or another converter.
- If output exists, rerun with `--overwrite` only when replacing it is intended.
- OCR is available offline in the default image. For scanned PDFs, pass Docling
  flags after `--`, such as `-- --ocr --force-ocr`.
- For text PDFs where OCR is unnecessary or produces worse output, retry with
  `-- --no-ocr`.
- If Docling reports missing native libraries such as `libxcb.so.1` or
  `libGL.so.1`, force a default image rebuild with `DOCLING_DOCKER_BUILD=always`
  and confirm the rebuilt image tag matches the default image in this skill.

## Batch Pattern

The helper handles one input at a time. For multiple files, loop explicitly:

```sh
for file in ./docs/*.{pdf,docx,pptx,xlsx}; do
  [ -e "$file" ] || continue
  node scripts/docling-convert.mjs --input "$file" --out-dir ./converted
done
```
