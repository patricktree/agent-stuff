# Structure and procedures

Open this reference when designing titles, headings, paragraphs, lists, tables, or instructions.

## Titles and headings

- Base the page title on its primary purpose.
- Use sentence case and a unique level-one heading.
- Start task headings with a base-form verb: "Create an instance," not "Creating an instance."
- Use a noun phrase for conceptual headings: "Cache invalidation," not "Understanding cache invalidation."
- Prefix optional sections with `Optional:` when the entire section is conditional.
- Keep headings descriptive, concise, and unique enough to navigate out of context.
- Maintain a logical hierarchy without skipping levels. Follow every heading with content before introducing a child heading.
- Don't use links or sequence numbers in headings. Avoid code identifiers in headings when a plain-language noun can provide context.

## Page flow

A task page commonly needs the following information, adapted to the task rather than applied as a rigid template:

1. Outcome or purpose.
2. Prerequisites, permissions, supported versions, and material side effects.
3. Procedure, with the preferred path first.
4. Verification or expected result.
5. Troubleshooting, cleanup, or next steps when they help complete the goal.

Keep conceptual background before a procedure only when it changes a decision or prevents a mistake. Link to deeper explanations instead of interrupting the task path.

## Lists and tables

- Use a numbered list when order matters, a bulleted list when it doesn't, and a description list for term-description pairs.
- Use a table when readers must compare three or more consistently structured properties. Don't use tables for layout, long prose, code blocks, or a simple one-dimensional list.
- Don't create a one-item list.
- Introduce a list or table with a complete sentence when the heading doesn't provide enough context.
- Keep list items grammatically parallel. Start items with a capital letter and use end punctuation consistently according to whether the items are sentences.
- Give tables concise column headings, accessible header markup, and a responsive representation.

## Procedures

- Use numbered steps for a sequence with two or more actions. Express a single-step procedure as one sentence, usually in a bullet.
- Start each step's first sentence with an imperative verb.
- Put the goal, condition, tool, or location before the action: "In the console, select **Settings**."
- Keep one reader decision or meaningful action per step. Combine only tightly coupled small actions.
- Use substeps when a step necessarily contains a local sequence; don't bury an independent procedure inside a step.
- Mark an optional step with `Optional:` at its start.
- Prefer the shortest accessible method. Separate genuinely necessary alternatives by heading, tab, or page instead of interleaving them.
- State an action before its result or justification. Include the result when it helps the reader recognize success or find the next control.
- Avoid directional descriptions such as _above_, _below_, or _on the right_. Refer to a heading, label, or figure number.
- Avoid _please_ in instructions and avoid generic introductions such as "Run the following command." State the command's purpose instead.

For a complex command step, use this order:

1. State the action and its purpose.
2. Show the command.
3. Explain placeholders.
4. Explain non-obvious behavior.
5. Show relevant output.
6. Explain the result or next decision.

## Notes and warnings

Use notices sparingly:

- Put prerequisites and expected behavior in normal prose when they belong to the primary path.
- Use a note for useful supplemental information that applies broadly.
- Use a caution for a risk of data loss, cost, degraded behavior, or a hard-to-reverse outcome.
- Use a warning for risk of injury, severe security exposure, or another critical consequence.
- State the consequence and the preventative action. Don't use a notice only to draw attention to ordinary content.
