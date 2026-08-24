# Voice and language

Open this reference when choosing tone, sentence construction, terminology, abbreviations, or the strength of a claim.

## Voice

- Sound like a knowledgeable colleague who understands what the reader wants to accomplish.
- Be conversational without slang, cuteness, pop-culture references, excessive politeness, or entertainment that competes with the information.
- Address the reader as _you_. Avoid _we_ when it ambiguously means the author, company, product, or reader.
- Prefer active voice when the actor matters. Use passive voice when the actor is irrelevant or the object deserves emphasis.
- Use common contractions such as _don't_, _can't_, and _you're_. They are conversational and make negation easier to scan. Avoid invented or three-word contractions.
- Don't anthropomorphize software or hardware. State what a component detects, returns, stores, or controls instead of what it thinks, wants, knows, or tells another component.

## Sentences and paragraphs

- Put a condition, location, or goal before the instruction it qualifies: "If caching is disabled, restart the server."
- Use short, complete sentences, but vary their openings and rhythm. Split sentences that contain multiple conditions, exceptions, or actions.
- Keep each paragraph to one idea. Put its distinguishing or critical point in the first sentence.
- Include articles such as _a_, _an_, and _the_; omitting them makes translation and comprehension harder.
- Use pronouns only when their antecedents are unambiguous. Use singular _they_ for a person whose gender is unknown or irrelevant.
- Prefer present tense for general behavior. Use future tense only for an event that genuinely occurs later.
- End a sentence with a preposition when that is the clearest natural construction.

## Terms and abbreviations

1. Prefer the reader's established term and use one term for one concept.
2. Replace jargon with a specific plain-language term when possible.
3. Retain necessary or searchable jargon, but define it in place or link to a trusted definition.
4. Spell out an unfamiliar abbreviation at first use, followed by the abbreviation in parentheses. Don't repeatedly expand a familiar abbreviation.
5. Don't use abbreviations as verbs. Pluralize them as ordinary words without an apostrophe.
6. Preserve the exact spelling and capitalization of code identifiers, UI labels, products, and standards.

## Requirements, options, and outcomes

| Meaning | Prefer | Avoid |
| --- | --- | --- |
| Required action | An imperative or _must_ | Ambiguous _should_ |
| Recommended action | _We recommend_ or a stated tradeoff | Presenting preference as a requirement |
| Optional action | _can_ or `Optional:` | _may_ when permission is unclear |
| Possible result | _might_ or _can_ | _will_ when not guaranteed |
| Expected result | Direct present-tense statement | _should_ as a substitute for verification |

Clarify who sets or observes a state. Replace "The value should be true" with the actual contract: "Set the value to `true`," "The server sets the value to `true`," or "If the value is `false`, ..."

## Durable and defensible claims

- Describe current behavior without _currently_, _now_, _new_, or _latest_. Include a version or date when the distinction matters.
- Don't announce future features or imply unapproved plans.
- Avoid _best_, _fastest_, _never_, _always_, _ensure_, and _guarantee_ unless evidence supports the exact scope.
- Cite the measurement and conditions for performance, cost, compatibility, or security comparisons.
- Describe security measures as reducing risk or contributing to a strategy unless they truly guarantee an outcome.
- Paraphrase third-party material and link to it. Verify license and attribution requirements before reusing text, images, code, or other assets.
