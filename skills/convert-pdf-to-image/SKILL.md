---
name: convert-pdf-to-image
description: Convert PDF pages to raster image files. Use when asked to convert a PDF to PNG, JPEG, TIFF, or page images; render PDF pages as images; control output DPI, page ranges, or single-page image output.
---

# Convert PDF to Image

Convert PDFs to image files with Poppler's `pdftoppm`. Prefer PNG unless the
user requests another format.

## Workflow

1. Confirm the input PDF path exists and identify the requested output format,
   output directory, DPI, and page range.
2. Ensure `pdftoppm` is available:

   ```sh
   command -v pdftoppm >/dev/null || brew install poppler
   ```

   If Homebrew is not available, install the system Poppler package (for example
   `poppler-utils` on Debian/Ubuntu) or ask before using another converter.
3. Create the output directory before rendering.
4. Use an explicit output prefix so multi-page output is predictable.
5. Verify generated files before reporting completion.

## Commands

Multi-page PNG output, defaulting to 200 DPI:

```sh
input_pdf="input.pdf"
output_dir="output"
mkdir -p "${output_dir}"
pdftoppm -png -r 200 "${input_pdf}" "${output_dir}/page"
```

This produces files like `output/page-1.png`, `output/page-2.png`, and so on.

Convert a page range:

```sh
pdftoppm -png -r 200 -f 2 -l 4 "${input_pdf}" "${output_dir}/page"
```

Convert a single page to one exact file stem without page numbering:

```sh
pdftoppm -png -r 200 -f 1 -singlefile "${input_pdf}" "${output_dir}/page-1"
```

Use JPEG or TIFF only when requested:

```sh
pdftoppm -jpeg -r 200 "${input_pdf}" "${output_dir}/page"
pdftoppm -tiff -r 200 "${input_pdf}" "${output_dir}/page"
```

## Options

- Increase sharpness: raise `-r` DPI, commonly `300`.
- Smaller files: lower `-r` DPI or use `-jpeg`.
- Selected pages: use `-f <first>` and `-l <last>`.
- PDF crop box: use `-cropbox`.
- Hide annotations: use `-hide-annotations`.
- Grayscale output: use `-gray`.
- Encrypted PDF: use `-upw` only when the user explicitly provides the password.

## Failure Handling

- If the PDF path is missing, ask for the correct path instead of guessing.
- If no output location is specified, create a sibling directory named after the
  PDF stem plus `-images`.
- If `pdftoppm` reports encryption/password errors, ask the user for the
  password; do not attempt to bypass protections.
- If raster output quality is too low, rerun with a higher `-r` value before
  trying another tool.
