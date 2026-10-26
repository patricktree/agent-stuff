---
name: docling-convert
description: Convert PDFs and Office documents (DOCX, PPTX, XLSX) to Markdown with Docling running in Docker. Use when the user asks for Docling, wants a PDF or Office file extracted to Markdown for reading or processing, needs structure-aware extraction (tables, headings, reading order, OCR for scans), or wants conversion without local Python. For PDF-to-image rendering use convert-pdf-to-image.
---

# Docling Convert

The bundled helper runs Docling inside a locally built Docker image, so conversion never depends on local Python. Docker is the execution boundary: when Docker or a conversion fails, fix that specific error and rerun; Python, `markitdown`, and other converters stay out of the workflow.

## Run

Run the helper from the user's working directory by its absolute path inside this skill folder, so relative input and output paths resolve against the user's files:

```sh
node <skill-dir>/scripts/docling-convert.mjs --input ./paper.pdf --out-dir ./converted
```

Pass exactly one output target:

- `--out-dir <dir>` writes `<dir>/<input-stem>/<input-stem>.md` plus any `*_artifacts/` assets Docling emits.
- `--output <file.md>` writes the primary file exactly there, with a sibling `<stem>.json` sidecar and `<stem>-artifacts/` directory when emitted.

Other options:

- `--json` adds a Docling JSON sidecar.
- `--format text|html` changes the primary format (default `md`); `--output` must use the matching extension.
- `--overwrite` replaces existing output; without it the helper fails on any collision.
- `--force` lets Docling try an extension other than `.pdf`, `.docx`, `.pptx`, or `.xlsx`.
- Arguments after `--` go straight to `docling convert`, for example `-- --ocr --force-ocr` for scanned PDFs or `-- --no-ocr` for text PDFs where OCR degrades the output.

On success the helper prints a JSON summary with the primary output path. It converts one file per run; loop in the shell for batches.

## Runtime behavior

- The first run builds the image from this skill's `Dockerfile` (slow: it installs Docling and downloads the layout, table, and RapidOCR models), then saves it to `.cache/docker-images/` in this skill. Later runs reload that archive if a prune removed the image.
- Containers run with `--network none`; OCR works offline from the bundled models. Set `DOCLING_DOCKER_NETWORK=default` only when a passed-through Docling option needs the network.
- Containers run as the current UID:GID so output is not root-owned; `DOCLING_DOCKER_USER=default` uses the container's default user.
- `node <skill-dir>/scripts/docling-convert.mjs --help` lists every option and environment override, including the image, build, and archive modes.

## Failures

- Docker missing or its daemon down: tell the user Docker is required for this workflow.
- Missing native libraries such as `libxcb.so.1` or `libGL.so.1`: rebuild with `DOCLING_DOCKER_BUILD=always`.
- Poor text from a scan: rerun with `-- --ocr --force-ocr`. Garbled text from a digital PDF: rerun with `-- --no-ocr`.
