---
name: pdf-to-text
description: Extract text from PDF files using pdfjs-dist (Mozilla's PDF.js). Use when you need to read, convert, or extract text content from PDF documents. Works reliably via Node.js without Python dependencies.
---

# PDF to Text

Extract text from PDFs using `pdfjs-dist` (Mozilla's PDF.js) via Node.js.

## Setup (once per session)

Install `pdfjs-dist` in `/tmp` if not already present:

```bash
cd /tmp && npm ls pdfjs-dist 2>/dev/null || npm install pdfjs-dist
```

## Usage

Run the following Node.js snippet, replacing the PDF path:

```bash
cd /tmp && node -e "
const fs = require('fs');

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync('/path/to/file.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const texts = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Group items by Y coordinate to reconstruct lines
    const lines = {};
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      if (!lines[y]) lines[y] = [];
      lines[y].push({ x: item.transform[4], str: item.str });
    }
    // Sort lines top-to-bottom, items left-to-right
    const sortedYs = Object.keys(lines).sort((a, b) => b - a);
    const pageLines = sortedYs.map(y =>
      lines[y].sort((a, b) => a.x - b.x).map(i => i.str).join(' ')
    );
    texts.push(pageLines.join('\n'));
  }
  console.log(texts.join('\n\n--- PAGE BREAK ---\n\n'));
}

main().catch(console.error);
"
```

## How it works

- Reads the PDF as a binary buffer
- Uses `pdfjs-dist/legacy/build/pdf.mjs` to parse each page
- Extracts text items with their spatial positions from the transform matrix (`transform[4]` = X, `transform[5]` = Y)
- Groups items by Y coordinate to reconstruct lines, sorts by X within each line
- Outputs readable text with page breaks between pages

## Notes

- Uses the `legacy` build of pdfjs-dist for broad Node.js compatibility
- No Python or system dependencies required — pure Node.js
- Handles multi-page PDFs automatically
- Spatial reconstruction preserves reading order even for complex layouts
- For PDFs with columns, the Y-coordinate grouping generally works but very complex multi-column layouts may interleave columns
