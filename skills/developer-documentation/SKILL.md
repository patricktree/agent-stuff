---
name: developer-documentation
description: Writes, edits, or reviews developer documentation, including READMEs, guides, tutorials, procedures, conceptual explanations, CLI docs, API references, code comments, and troubleshooting content. Use when documentation for developers must be technically accurate, clear, scannable, accessible, inclusive, and consistent. Do not use for ordinary code comments that only explain an implementation detail or for nontechnical prose.
---

# Developer documentation

Write documentation that helps a technical reader complete a task or understand a system with minimal ambiguity.

## Resolve authority and facts first

1. Inspect the repository's documentation conventions, templates, terminology, and nearby examples.
2. Treat project-specific guidance as authoritative. Use this skill to fill gaps and break ties.
3. Verify claims against the implementation, public interfaces, configuration, tests, and supported versions. Don't invent behavior or document an intended future state as current.
4. Identify the audience, their goal, assumed knowledge, prerequisites, and the document's maintenance horizon.
5. Ask only for information that cannot be established from the repository and would materially change the document.

## Choose the document's job

Give each page one primary job:

| Reader need | Shape |
| --- | --- |
| Complete a goal | Task-oriented guide or how-to |
| Learn while building | Tutorial |
| Understand a system or decision | Conceptual explanation |
| Look up exact behavior | Reference |
| Recover from a failure | Troubleshooting guide |

Separate competing jobs when combining them would obscure the reader's path. Keep necessary context near the task, but don't turn a procedure into an encyclopedia.

## Draft in reader order

1. Lead with what the page enables the reader to do or understand.
2. State prerequisites, constraints, permissions, costs, destructive effects, and version requirements before the reader reaches the affected step.
3. Organize task content in the order the reader performs it. Organize conceptual content from the governing idea to details and consequences.
4. Put critical information first in each section, paragraph, and sentence.
5. Use examples that match realistic reader goals and the surrounding codebase.
6. End task content with an observable verification step and, when relevant, cleanup or rollback guidance.

## Apply the house style

- Write in US English unless the project specifies another variety.
- Use a conversational, knowledgeable, respectful tone.
- Address the reader as _you_. Use active voice and present tense when they express the behavior accurately.
- Prefer direct, concrete words. Define necessary jargon and abbreviations on first use.
- Use prescriptive language precisely: imperatives or _must_ for requirements, _can_ for options, and _might_ for possible outcomes. Avoid ambiguous _should_ when the distinction matters.
- Prefer timeless, verifiable statements. Avoid hype, unsupported claims, promises, and words such as _simply_, _easy_, _obviously_, _currently_, _new_, and _soon_ unless the context genuinely requires them.
- Preserve consistent terminology, capitalization, formatting, and grammatical structure.
- Depart from a guideline when clarity for the actual audience improves; apply the departure consistently.

## Load focused guidance

| Need | Read |
| --- | --- |
| Choose voice, sentences, terminology, abbreviations, or claim language | `references/voice-and-language.md` |
| Design headings, paragraphs, lists, tables, or step-by-step procedures | `references/structure-and-procedures.md` |
| Document code, commands, placeholders, output, public APIs, or deprecations | `references/code-and-api-reference.md` |
| Format technical text, links, UI interactions, dates, numbers, files, or images | `references/formatting-links-and-ui.md` |
| Check accessibility, inclusive language, examples, or global readability | `references/accessibility-inclusion-and-globalization.md` |
| Resolve grammar, punctuation, naming, or word-choice questions | `references/mechanics-and-terminology.md` |
| Imitate or compare concrete documentation transformations | `references/examples.md` |

Read only the references relevant to the current document.

## Validate before handoff

- Confirm every command, code sample, option, name, path, link, prerequisite, default, result, and error condition that can be checked.
- Ensure the title, introduction, and headings accurately advertise the content.
- Ensure procedures use actionable steps, state context before action, explain placeholders, and include expected results where useful.
- Ensure code and UI names exactly match their sources.
- Remove repetition, throat-clearing, hidden prerequisites, vague pronouns, unnecessary alternatives, and claims without evidence.
- Check heading hierarchy, link text, list parallelism, semantic formatting, alt text, keyboard accessibility, and nonvisual descriptions.
- Scan for secrets, personal data, real customer identifiers, reversible image redaction, and unsafe example values.
- Run the repository's documentation formatting, linting, link, snippet, and build checks when available.

When reviewing rather than editing, report concrete issues with locations and suggested corrections. Don't rewrite unaffected prose merely to impose personal preference.
