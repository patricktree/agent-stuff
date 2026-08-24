# Formatting, links, and UI

Open this reference when formatting technical text, links, UI instructions, dates, numbers, files, or images.

## Semantic formatting

| Content | Format |
| --- | --- |
| Code identifiers, filenames, paths, commands, flags, literal input or output | Code font |
| UI labels and controls | Bold |
| A code-derived value displayed in a UI control | Bold code font |
| A term being introduced or a word discussed as a word | Italics |
| Emphasis | Prefer wording; use semantic emphasis sparingly |

- Use sentence case for titles, headings, navigation, captions, labels, list items, and table text unless an official name or literal UI label differs.
- Use Markdown or semantic HTML for meaning. Don't use headings, tables, bold, or manual font styling only to achieve visual appearance.
- Reserve underlining for links. Don't encode meaning through capitalization, color, position, or formatting alone.
- Prefer the project's existing Markdown or HTML form. Markdown is easier to read as source; HTML is appropriate when richer semantics are necessary.

## Links and cross-references

- Write descriptive link text that makes sense out of context and predicts the destination.
- Put enough essential context on the current page; don't make the reader follow a link to understand the current instruction.
- Link to the most relevant canonical page, not a landing page that forces another search.
- Avoid vague link text such as _click here_, _this page_, _more_, or a bare URL.
- Avoid duplicate links to the same destination in one short section.
- State unexpected behavior such as a download, authentication requirement, or new domain.
- Open links in the current tab unless the product imposes another behavior.
- Refer to stable headings or custom anchors. Preserve old anchors or update inbound links when changing a linked heading.

## UI interactions

- Focus on the reader's goal rather than narrating every visible control.
- Match UI labels, capitalization, and punctuation exactly and format them in bold.
- Name an element type only when it helps locate or understand the control: "In the **Region** list, select ..."
- Put the application or page context before the action.
- Represent a menu path with `>` between bold labels when local conventions allow it: **File** > **New** > **Document**.
- Use verbs consistently: _click_ for buttons and links, _select_ for options, _enter_ for text, and _go to_ for pages.
- Refer to an icon by its accessible name or tooltip, not only by shape or position.
- Format keyboard keys semantically when supported. Don't require a shortcut when an accessible UI path is available.

## Images

- Use an image only when it explains something that words, code, or semantic markup cannot express as effectively.
- Never use an image of text, code, or terminal output.
- Crop screenshots to relevant content and keep their platform and visual treatment consistent.
- Remove personal information with an irreversible opaque overlay and flatten layered exports; blur and mosaic effects can be reversible.
- Provide concise, contextual alt text for informative images and empty alt text for decorative images. Provide a nearby text description for complex diagrams.
- Don't begin alt text with "Image of." Include punctuation and keep meaning independent of color or spatial position.
- Prefer SVG for diagrams and appropriately sized high-resolution raster images for screenshots.

## Dates, numbers, units, and files

- Prefer an unambiguous written date such as `January 19, 2026`. Use ISO 8601 (`2026-01-19`) when a numeric-only format is required.
- Include a time zone and UTC offset when readers could otherwise interpret a time differently.
- Use numerals for measurements and technical values. Use a space between a number and most unit symbols; preserve the project's rendering convention for nonbreaking spaces.
- Distinguish decimal byte units (`kB`, `MB`, `GB`) from binary units (`KiB`, `MiB`, `GiB`).
- Use lowercase ASCII filenames with hyphens when creating documentation files, unless the repository's established convention differs.
- Refer to exact filenames and paths in code font. Use the formal file type name, such as "a PNG file," instead of treating the extension as the type name.
