# Issue Description Examples

Replace `{agent}` and `{model}` in every example with known identity details from the current runtime. Never emit the placeholders or guess unavailable values.

## Happy Path: Feature Request

```md
## Problem

Release verification can currently publish artifacts, so maintainers cannot safely exercise the complete release path before a real release.

## Proposed outcome

Provide a manually triggered verification mode that builds and smoke-tests release artifacts while disabling every publish job.

## Acceptance criteria

- Maintainers can trigger verification manually.
- The workflow builds and smoke-tests the same artifacts as release mode.
- No package or release can be published from verification mode.

---

Written by @patricktree's agent ({agent}, {model}).
```

## Robust Variant: Bug Report

```md
## Problem

Packed payload verification rejects valid empty files.

## Reproduction

1. Add a tracked, empty file to a package payload.
2. Pack the package.
3. Run release-artifact verification.

## Expected behavior

Verification accepts the empty regular file and still checks its byte-for-byte hash.

## Actual behavior

Verification treats the zero-byte payload as missing or invalid.

## Environment

- Revision: `example-sha`
- Platform: Linux CI runner

---

Written by @patricktree's agent ({agent}, {model}).
```

## Anti-Pattern And Correction

Avoid vague, unsupported descriptions:

```md
## Summary

Publishing is broken. Fix the workflow and improve tests.
```

Correct it by naming observed behavior, scope, and completion criteria:

```md
## Summary

Run npm lifecycle smoke tests outside the repository checkout so npm does not inherit pnpm-only `devEngines` constraints.

## Motivation

The current smoke test installs from inside the checkout, where npm rejects the workspace's package-manager constraint before testing the packed executable.

## Acceptance criteria

- The smoke test installs the tarball from a temporary directory outside the checkout.
- The installed executable runs successfully.
- The test does not alter publish behavior.

---

Written by @patricktree's agent ({agent}, {model}).
```
