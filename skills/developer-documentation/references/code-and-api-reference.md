# Code, commands, and API reference

Open this reference when documenting code, commands, placeholders, output, public APIs, or deprecations.

## Code samples

- Follow the repository and language's code style. Preserve existing indentation and line-length conventions.
- Prefer the smallest complete sample that demonstrates a realistic task. Include imports, setup, cleanup, error handling, and security controls when omitting them would teach an unsafe pattern.
- Test or otherwise verify samples against the documented version. Don't use pseudocode without labeling it.
- Introduce each sample with a complete sentence that states what it demonstrates.
- Use a fenced code block with an accurate language identifier when the local format supports it.
- Show omitted code with a language-appropriate comment. Don't make an incomplete sample appear click-to-copy.
- Explain why non-obvious lines or options matter after the sample instead of narrating every line.
- Keep secrets, personal information, real customer data, and live resource identifiers out of samples.

## Commands and output

- Make the preferred command directly runnable when practical. Don't mix prompt characters, output, or explanatory comments into a click-to-copy command.
- Put each command in a code block. Break long commands at meaningful boundaries using the shell's continuation syntax when supported.
- Explain the command's purpose before showing it.
- Use separate blocks for input and output. Show only output that helps verify success or make the next decision, and introduce variable output as similar rather than exact.
- Document optional, mutually exclusive, and repeatable arguments unambiguously. Prefer separate runnable examples over dense formal syntax for common tasks.
- Name the relevant shell, working directory, permissions, environment, and supported platform when they affect the result.

## Placeholders

- Use descriptive uppercase names with underscores, such as `PROJECT_ID` or `OUTPUT_DIRECTORY`.
- Don't combine a placeholder with surrounding literal text when separate placeholders are clearer.
- Explain every placeholder immediately after the sample, in the order it appears.
- Tell the reader what kind of value to supply, not merely to "replace the placeholder."
- Use reserved documentation domains, IP ranges, and fictitious identifiers for concrete examples.

## Code in prose

Use code formatting for identifiers and literal technical input or output, including filenames, paths, commands, flags, methods, classes, environment variables, status codes, and placeholder values. Don't use code formatting merely because a term is technical.

Keep identifiers grammatically intact. Add a descriptive noun instead of pluralizing, possessing, or using an identifier as a verb: "`Intent` objects," "the value of `ADDRESS`," and "send a `POST` request."

## Public API reference

Document every public class, interface, type, constant, field, method, parameter, return value, exception, and deprecation that is part of the supported surface.

### Types

- Begin with a short, unique purpose statement that adds information beyond the name and signature.
- Follow with construction or invocation guidance, key behavior, prerequisites, lifecycle, concurrency, performance implications, best practices, and pitfalls when relevant.
- Include a small representative example near the top when it materially improves use of the type.

### Methods

- Begin in present tense with the action the method performs: _Creates_, _Gets_, _Checks whether_, _Updates_, or _Deletes_.
- Explain why and when to use it, prerequisites, side effects, idempotency, missing dependencies, related APIs, and failure behavior when relevant.
- For a non-Boolean parameter, describe the value and constraints. For a Boolean instruction, state behavior for both true and false. State defaults explicitly.
- Describe a non-Boolean return value with a concise noun phrase. For Boolean values, use "True if ...; false otherwise" when that matches the language's convention.
- Describe each documented exception with the condition that causes it.

### Deprecations

Put the essential migration action first. Name the replacement, the version or date of deprecation when applicable, behavior changes, and the steps required to keep existing code working. Don't mark an API deprecated without a usable path forward unless no replacement exists; state that explicitly.
