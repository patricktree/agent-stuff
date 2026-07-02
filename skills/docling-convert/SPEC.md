# Docling Convert Specification

## Intent

Provide a deterministic skill for converting PDFs and Office documents into
agent-processable Markdown using Docling without depending on local Python.

## Scope

In scope:

- PDF, DOCX, PPTX, and XLSX conversion.
- Markdown as the primary output.
- Optional Docling JSON sidecar output.
- Docker-based execution with a bundled image build and skill-local non-Docker
  archive restore cache.
- Safe file handling: narrow mounts, no network by default, no overwrite by
  default, current-user output ownership by default.

Out of scope:

- PDF page rasterization or DPI/page-range image rendering; use
  `convert-pdf-to-image`.
- Local Python/virtualenv/uv installation flows.
- Broad arbitrary-file conversion routing.
- Interactive prompts.
- Native batch mode in v1.

## Users And Trigger Context

- Primary users: coding agents that need readable document content from local
  PDFs or Office files.
- Common user requests: "convert this PDF to Markdown", "use Docling", "extract
  this DOCX for the agent", "avoid local Python".
- Should not trigger for: PDF-to-image rendering, visual layout inspection,
  screenshot generation, or arbitrary URL/file conversion where Docling/Docker is
  not requested or beneficial.

## Runtime Contract

- Required first actions: confirm input exists, run the bundled helper, and keep
  Docker as the execution boundary.
- Required outputs: Markdown primary output path; JSON summary from the helper on
  success.
- Non-negotiable constraints: no local Python fallback; no silent overwrites;
  Docker image must be restorable from archive after prune when the default image
  is used; Docker network disabled by default; only PDF/DOCX/PPTX/XLSX accepted unless
  `--force` is explicit.
- Expected bundled files loaded at runtime: `SKILL.md`; the script and Dockerfile
  are executed/read by the helper as needed.

## Source And Evidence Model

Authoritative sources:

- Docling README and CLI reference.
- Docker CLI behavior.
- Local conversion validations against sample files.

Useful improvement sources:

- positive examples: conversions that preserve structure useful to an agent.
- negative examples: failures from missing Docker, ownership issues, unsupported
  extensions, OCR needs, or output collisions.
- commit logs/changelogs: Docling CLI option changes.
- issue or PR feedback: routing conflicts with document-related skills.
- validation results: script help, Docker build, sample conversion, sync result.

Data that must not be stored:

- secrets.
- customer/private documents.
- private URLs or identifiers not needed for reproduction.

## Reference Architecture

- `SKILL.md` contains runtime routing and execution instructions.
- `references/` contains no runtime references in v1.
- `references/evidence/` contains no persistent evidence in v1.
- `scripts/` contains `docling-convert.mjs`, the deterministic helper.
- `assets/` contains no assets in v1.
- `Dockerfile` defines the local Docling CLI image.

## Validation

- Lightweight validation:
  - `node scripts/docling-convert.mjs --help`
  - Docker daemon availability check.
  - Docker image build.
  - default image archive save/load behavior.
- Deeper validation:
  - Convert a sample PDF to Markdown with Docker network disabled.
  - Convert at least one Office file with Docker network disabled when sample
    data is available.
  - Verify overwrite and unsupported-extension failures.
- Holdout examples:
  - scanned PDF requiring `-- --ocr --force-ocr`.
  - output path collision.
  - Docker daemon stopped.
- Acceptance gates:
  - helper is non-interactive.
  - conversion succeeds without local Python.
  - output files are not root-owned on macOS/Linux unless opted out.

## Known Limitations

- The bundled Docker image build and first archive save may be slow because they
  download and persist Docling dependencies and PDF layout/table models.
- The default image installs the latest Docling available at build time; pin the
  Dockerfile dependency if a future Docling CLI change breaks the wrapper.
- Exact `--output` mode maps Docling directory output back to a single requested
  primary file and places remaining artifacts in a sibling artifacts directory.

## Maintenance Notes

- Update `SKILL.md` when routing, CLI arguments, output shape, or safety defaults
  change.
- Update `SOURCES.md` when source URLs, verified CLI behavior, or validation
  evidence changes.
- Add `references/evidence/` examples only when real conversion outcomes need to
  guide future behavior.
