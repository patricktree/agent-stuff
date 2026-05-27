# Convert PDF to Image Specification

## Intent

Provide a compact, repeatable workflow for converting PDF pages into raster images using Poppler's `pdftoppm`.

## Scope

In scope:

- PDF to PNG, JPEG, or TIFF conversion.
- DPI, page range, crop box, annotation visibility, grayscale, and single-page output guidance.
- Installation fallback guidance for missing `pdftoppm`.

Out of scope:

- OCR, text extraction, PDF editing, or vector asset extraction.
- Bypassing PDF encryption or access controls.

## Users And Trigger Context

- Primary users: coding agents handling local PDF conversion tasks.
- Common user requests: "convert this PDF to PNG", "render PDF pages as images", "make JPEGs from page 2-4".
- Should not trigger for: extracting PDF text, summarizing PDF content, generating alt text for an existing image.

## Runtime Contract

- Required first actions: verify input path and conversion requirements; ensure `pdftoppm` exists.
- Required outputs: generated image path(s) or a clear blocker.
- Non-negotiable constraints: do not bypass protected PDFs; verify generated files.
- Expected bundled files loaded at runtime: `SKILL.md` only.

## Source And Evidence Model

Authoritative sources:

- `pdftoppm -h` and `pdftoppm -v` output from the installed Poppler package.
- Local agent-stuff README for skill location and sync workflow.
- Skill-writer guidance for authoring, trigger optimization, and validation.

Useful improvement sources:

- positive examples: successful local conversions with requested DPI/page range.
- negative examples: failed conversions due to missing files, password protection, or quality issues.
- validation results: quick structural validation and manual command verification.

Data that must not be stored:

- PDF passwords.
- private PDF contents or filenames unless needed for a reproducible, redacted bug report.

## Reference Architecture

- `SKILL.md` contains: all runtime conversion instructions.
- `references/` contains: none.
- `references/evidence/` contains: none.
- `scripts/` contains: none.
- `assets/` contains: none.

## Validation

- Lightweight validation: run the skill validator on this directory.
- Deeper validation: convert a small sample PDF and inspect generated images when conversion behavior changes.
- Holdout examples: requests for PNG default, JPEG requested, page range requested, and encrypted PDF blocker.
- Acceptance gates: valid frontmatter, trigger description, concise runtime workflow, and no host-specific paths.

## Known Limitations

- Output is rasterized, so text is no longer selectable.
- Large PDFs or high DPI settings can produce many large image files.
- Platform-specific installation commands may differ outside macOS, Debian, and Ubuntu.

## Maintenance Notes

- Update `SKILL.md` when recommended command options or workflow steps change.
- Update `SOURCES.md` when Poppler behavior, validation results, or source decisions change.
- Add evidence examples only when repeated failures reveal a durable edge case.
