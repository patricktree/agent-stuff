# Developer documentation sources

## Synthesis summary

- Retrieval date: 2026-08-24.
- Primary source: Google developer documentation style guide, official English pages.
- Corpus coverage: all 71 distinct `/style` URLs exposed by the guide's English navigation and internal style links at retrieval time, including the `/style/spelling` alias of the word list.
- Retrieved corpus size: approximately 137,000 words including repeated site navigation and footer content.
- Trust tier: primary upstream documentation.
- Confidence: high for the retrieved guidance; project-specific rules and implementation facts remain higher authority at runtime.

## Source adaptation

- Source intent: establish Google's house style for clear and consistent developer documentation.
- Local target: guide portable agents that write, edit, or review developer documentation across repositories.
- Fidelity boundary: preserve decisions that improve clarity, task completion, technical precision, accessibility, inclusion, globalization, and maintainability.
- Local replacements: project-specific guidance precedes this skill; repository and language conventions replace Google-specific markup and formatting defaults where they differ.
- Omitted or generalized material: Google product-specific annotations, historical changelog detail, exhaustive word-list entries, browser-specific authoring UI, and low-level house-style minutiae that do not justify runtime context.
- Rights and attribution: prose is paraphrased from content licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); Google code samples are licensed under Apache 2.0. No upstream examples are copied verbatim into runtime references.

## Complete upstream inventory

### Introduction and key resources

- <https://developers.google.com/style>
- <https://developers.google.com/style/highlights>
- <https://developers.google.com/style/whats-new>
- <https://developers.google.com/style/philosophy>
- <https://developers.google.com/style/word-list>
- <https://developers.google.com/style/spelling>
- <https://developers.google.com/style/product-names>
- <https://developers.google.com/style/text-formatting>

### General principles

- <https://developers.google.com/style/accessibility>
- <https://developers.google.com/style/excessive-claims>
- <https://developers.google.com/style/future>
- <https://developers.google.com/style/translation>
- <https://developers.google.com/style/inclusive-documentation>
- <https://developers.google.com/style/jargon>
- <https://developers.google.com/style/prescriptive-documentation>
- <https://developers.google.com/style/other-sources>
- <https://developers.google.com/style/timeless-documentation>
- <https://developers.google.com/style/tone>

### Language and grammar

- <https://developers.google.com/style/abbreviations>
- <https://developers.google.com/style/voice>
- <https://developers.google.com/style/anthropomorphism>
- <https://developers.google.com/style/articles>
- <https://developers.google.com/style/capitalization>
- <https://developers.google.com/style/contractions>
- <https://developers.google.com/style/pluralization>
- <https://developers.google.com/style/possessives>
- <https://developers.google.com/style/prepositions>
- <https://developers.google.com/style/tense>
- <https://developers.google.com/style/pronouns>
- <https://developers.google.com/style/person>
- <https://developers.google.com/style/sentence-structure>
- <https://developers.google.com/style/reference-verbs>

### Punctuation

- <https://developers.google.com/style/colons>
- <https://developers.google.com/style/commas>
- <https://developers.google.com/style/dashes>
- <https://developers.google.com/style/ellipses>
- <https://developers.google.com/style/hyphens>
- <https://developers.google.com/style/parentheses>
- <https://developers.google.com/style/periods>
- <https://developers.google.com/style/quotation-marks>
- <https://developers.google.com/style/semicolons>
- <https://developers.google.com/style/slashes>

### Formatting and organization

- <https://developers.google.com/style/dates-times>
- <https://developers.google.com/style/examples>
- <https://developers.google.com/style/filenames>
- <https://developers.google.com/style/footnotes>
- <https://developers.google.com/style/format-examples>
- <https://developers.google.com/style/headings>
- <https://developers.google.com/style/headings-targets>
- <https://developers.google.com/style/images>
- <https://developers.google.com/style/italics-terms>
- <https://developers.google.com/style/lists>
- <https://developers.google.com/style/mathematical-notation>
- <https://developers.google.com/style/notices>
- <https://developers.google.com/style/numbers>
- <https://developers.google.com/style/paragraph-structure>
- <https://developers.google.com/style/phone-numbers>
- <https://developers.google.com/style/placeholders>
- <https://developers.google.com/style/procedures>
- <https://developers.google.com/style/tables>
- <https://developers.google.com/style/units-of-measure>

### Linking, interfaces, and markup

- <https://developers.google.com/style/cross-references>
- <https://developers.google.com/style/api-reference-comments>
- <https://developers.google.com/style/code-in-text>
- <https://developers.google.com/style/code-samples>
- <https://developers.google.com/style/code-syntax>
- <https://developers.google.com/style/ui-elements>
- <https://developers.google.com/style/html-formatting>
- <https://developers.google.com/style/markdown>
- <https://developers.google.com/style/semantic-tagging>
- <https://developers.google.com/style/trademarks>

## Coverage and decisions

| Dimension | Status | Runtime location |
| --- | --- | --- |
| Authority, audience, and factual grounding | Adopted | `SKILL.md` |
| Voice, grammar, jargon, claims, and timelessness | Adopted | `references/voice-and-language.md` |
| Headings, paragraphs, lists, tables, notices, and procedures | Adopted | `references/structure-and-procedures.md` |
| Code, commands, placeholders, output, and API reference | Adopted | `references/code-and-api-reference.md` |
| Semantic formatting, links, UI, images, dates, units, and files | Adopted | `references/formatting-links-and-ui.md` |
| Accessibility, inclusion, global writing, and safe example data | Adopted | `references/accessibility-inclusion-and-globalization.md` |
| Punctuation, names, numbers, and exact term lookup | Adopted | `references/mechanics-and-terminology.md` |
| Happy-path, robust, and anti-pattern transformations | Adopted | `references/examples.md` |
| Exhaustive Google word-list entries | Deferred to upstream lookup | `references/mechanics-and-terminology.md` |
| Google product-specific exceptions and annotations | Rejected for portable runtime | This file |
| Full historical change log | Rejected as maintenance-only noise | This file |

## Class and execution shape

- Skill class: generic writing guidance. Required dimensions are workflow, language, structure, technical artifacts, accessibility and global reach, mechanics, examples, and validation.
- Primary execution shape: reference-backed expert.
- Simpler shape rejected: one inline file would either omit high-impact guidance or load unrelated details for every documentation task.
- Advanced shapes rejected: no scripts, routing engine, provider-specific mechanics, or subagents are needed.
- Portability: all bundled paths are skill-root-relative and runtime behavior is provider-agnostic.

## Trigger validation

Should trigger:

- "Write the README section for configuring this SDK."
- "Document this CLI command and all of its options."
- "Improve the public API doc comments for this class."
- "Create a troubleshooting guide for these connection errors."
- "Review these developer docs for clarity and accessibility."

Should not trigger:

- "Implement the SDK configuration loader."
- "Add a short code comment explaining why this retry exists."
- "Draft marketing copy for the product launch."
- "Write a customer support apology email."
- "Summarize this nontechnical essay."

Description decision: name concrete developer-documentation formats to improve recall, state the quality goal, and exclude ordinary implementation comments and nontechnical prose to reduce overlap with code-style and general writing skills.

## Retrieval stopping rationale

Collection stopped after every English guide URL exposed by the official navigation and internal `/style` links had been converted and inventoried. The guide's topic headings, page summaries, core rules, detailed procedure and API-reference guidance, and example transformations were reviewed. Additional retrieval would primarily repeat navigation, localized translations, product-specific variants, or historical changelog entries without changing the portable runtime decisions.

## Open gaps

- Recheck the official navigation and `whats-new` page during maintenance because the guide is actively updated.
- Exact word-list choices remain an upstream lookup instead of a bundled snapshot to avoid staleness and excessive runtime context.
- Forward behavioral evaluation against holdout documentation tasks remains useful after initial real-world use.
