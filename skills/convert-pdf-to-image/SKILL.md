---
name: convert-pdf-to-image
description: Rasterize PDF pages to PNG, JPEG, or TIFF files with Poppler's pdftoppm. Use when asked to convert a PDF or selected pages to images, or to render a PDF page as an image at a given DPI.
---

# Convert PDF to Image

Render with Poppler's `pdftoppm`. Defaults, unless the user asks otherwise: PNG, 200 DPI (Poppler's own default of 150 is soft), all pages, output in a sibling directory named `<pdf-stem>-images`.

## Workflow

1. Ensure `pdftoppm` is installed: `brew install poppler` on macOS, the `poppler-utils` package on Debian/Ubuntu. Ask before switching to another converter.
2. Create the output directory first: `pdftoppm` does not create it and exits with `Could not write image`.
3. Render with an explicit output prefix:

   ```sh
   pdftoppm -png -r 200 "${input_pdf}" "${output_dir}/page"
   ```

   Add `-f <first> -l <last>` for a page range; swap `-png` for `-jpeg` or `-tiff` when requested.
4. List the output directory and report the actual file paths.

## Output naming

- Page numbers are zero-padded to the digit count of the PDF's last page: a 13-page PDF yields `page-01.png` … `page-13.png`, not `page-1.png`. Glob or list the directory rather than constructing names.
- For one page as one exact filename, use `-singlefile` with `-f`: `pdftoppm -png -r 200 -f 3 -singlefile in.pdf out/cover` writes `out/cover.png`.

## Encrypted PDFs

On a password error, ask the user for the password and pass it with `-upw`; leave other protections intact, and keep the password out of files and commit history.
