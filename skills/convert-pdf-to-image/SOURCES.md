# Sources: Convert PDF to Image

## Source Inventory

- `pdftoppm -h` and `pdftoppm -v`, Poppler 26.04.0
  - Trust: high.
  - Confidence: high.
  - Contribution: command syntax, formats, DPI, page ranges, `-singlefile`, and password flags.
  - Constraint: local CLI output; re-check after major Poppler upgrades.
- Local conversion of a 13-page sample PDF, Poppler 26.04.0 (2026-10-26)
  - Trust: high.
  - Confidence: high.
  - Contribution: zero-padded page numbering (`page-01.png`), missing-output-directory failure (`Could not write image`), and `-f N -singlefile` writing one unnumbered file.
  - Constraint: observed behavior; re-check after major Poppler upgrades.
- `~/workspace/agent-stuff/README.md`
  - Trust: high.
  - Confidence: high.
  - Contribution: canonical skill root and sync workflow.
  - Constraint: repository-specific.
- `writing-for-agents` skill
  - Trust: high.
  - Confidence: high.
  - Contribution: description wording, pruning of `--help` restatements and default behavior.
  - Constraint: agent-authoring guidance only.

## Synthesis Summary

- Skill class: `workflow-process`.
- Primary execution shape: `inline-guidance`.
- Simplicity rationale: one conversion path fits in `SKILL.md`; references and scripts would add lookup overhead without improving execution.
- Content rationale: `SKILL.md` keeps only what `pdftoppm -h` does not tell the agent: chosen defaults, output naming gotchas, the missing-directory failure, and the password boundary.

## Decisions

- Adopted: `pdftoppm` as the only converter; it is purpose-built for PDF rasterization.
- Adopted: PNG default because it is lossless and predictable.
- Adopted: 200 DPI default for better quality than Poppler's 150 DPI default without excessive size.
- Adopted: document zero-padded output names because agents otherwise assume `page-1.png` and miss files.
- Rejected: an options list (crop box, annotations, grayscale); it restated `pdftoppm -h`.
- Rejected: a script wrapper because plain `pdftoppm` commands are simple and transparent.

## Description Optimization

Should trigger:

- "convert this PDF to PNG"
- "render the PDF pages as images"
- "make JPEGs from pages 2 through 4"
- "export this PDF at 300 DPI"

Should not trigger:

- "extract text from this PDF"
- "convert this PDF to Markdown" (use `docling-convert`)
- "generate alt text for this PNG"
- "compress this PDF"

## Gaps

- No cross-platform package-manager validation beyond Homebrew on macOS.

## Changelog

- 2026-05-27: Created initial skill after installing Poppler/pdftoppm locally.
- 2026-10-26: Pruned `--help` restatements and default behavior; added zero-padding, missing-directory, and `-singlefile` findings from a sample conversion; tightened the description.
