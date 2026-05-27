# Sources: Convert PDF to Image

## Source Inventory

- `pdftoppm -h`, Poppler 26.04.0
  - Trust: high.
  - Confidence: high.
  - Contribution: command syntax, formats, DPI, page ranges, crop, annotations,
    grayscale, and password flags.
  - Constraint: local CLI output; re-check after major Poppler upgrades.
- `pdftoppm -v`, Poppler 26.04.0
  - Trust: high.
  - Confidence: high.
  - Contribution: installed version verification.
  - Constraint: local installation state only.
- `~/workspace/agent-stuff/README.md`
  - Trust: high.
  - Confidence: high.
  - Contribution: canonical skill root and sync workflow.
  - Constraint: repository-specific.
- `skill-writer` references
  - Trust: high.
  - Confidence: high.
  - Contribution: authoring, SPEC/SOURCES split, trigger optimization, and
    validation expectations.
  - Constraint: agent-authoring guidance only.
- `pdf-to-text` neighboring skill
  - Trust: medium.
  - Confidence: medium.
  - Contribution: local skill style and concise runtime pattern.
  - Constraint: different domain/tooling.

## Synthesis Summary

- Skill class: `workflow-process`.
- Primary execution shape: `inline-guidance`.
- Secondary shapes: none.
- Simplicity rationale: one dominant conversion path fits in `SKILL.md`;
  references and scripts would add lookup overhead without improving execution.
- Portability note: runtime guidance is provider-agnostic. Installation guidance
  mentions Homebrew first because the current machine is macOS, with non-macOS
  fallback guidance.
- Retrieval stopping rationale: `pdftoppm -h` covers the needed API surface and
  neighboring skill/repo docs cover local structure. Further upstream docs are
  low-yield for this compact workflow.

## Coverage Matrix

- Preconditions: covered by input path and `pdftoppm` checks.
- Ordered flow: covered by the `SKILL.md` workflow section.
- Failure handling: covers missing file, missing converter, encrypted PDF, and
  quality rerun.
- Safety boundaries: covers not bypassing PDF protections and not storing
  passwords.
- Runtime options: covers DPI, page range, cropbox, annotations, grayscale, and
  formats.
- Validation: covers generated-file verification and skill validator.

## Decisions

- Adopted: use `pdftoppm` as the primary tool because it is installed via
  Poppler and purpose-built for PDF rasterization.
- Adopted: default to PNG because the user asked for PDF to PNG and PNG is
  lossless and predictable.
- Adopted: default example DPI to 200 for better quality than Poppler's 150 DPI
  default without excessive size.
- Rejected: add a script wrapper because plain `pdftoppm` commands are simple
  and transparent.
- Rejected: add runtime references because the content is short and every
  invocation needs the same workflow.

## Description Optimization

Should trigger:

- "convert this PDF to PNG"
- "render the PDF pages as images"
- "make JPEGs from pages 2 through 4"
- "export this PDF at 300 DPI"

Should not trigger:

- "extract text from this PDF"
- "summarize this PDF"
- "generate alt text for this PNG"
- "compress this PDF"

Final description emphasizes PDF-to-image conversion, common output formats,
page images, DPI, page ranges, and single-page output.

## Gaps

- No cross-platform package-manager validation beyond Homebrew installation on
  this machine.
- No sample conversion was run because no input PDF was provided for the new
  skill task.

## Changelog

- 2026-05-27: Created initial skill after installing Poppler/pdftoppm locally.
