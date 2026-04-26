# Examples

These examples show the intended style in a compact, reusable form.

## TypeScript helper

Preferred:

```ts
const MAX_RETRIES = 3;

type FetchJsonOptions = {
  signal?: AbortSignal;
};

export async function fetchJson(
  url: URL,
  options: FetchJsonOptions = {},
): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { signal: options.signal });
      if (!response.ok) {
        throw new Error(
          `Request failed: url=${url.href}, status=${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Request failed after ${MAX_RETRIES} attempts: url=${url.href}`,
  );
}
```

Why this matches the style:

- explicit names
- clear constant naming
- fail-fast error handling
- straightforward control flow
- no unnecessary abstraction

## React component

Preferred:

```tsx
"use client";

import React from "react";

import { Button } from "#pkg/elements/Button.jsx";

type CopyButtonProps = {
  text: string;
};

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [wasCopied, setWasCopied] = React.useState(false);

  async function copyText() {
    if (text.length === 0) {
      throw new Error("CopyButton requires non-empty text");
    }

    await navigator.clipboard.writeText(text);
    setWasCopied(true);
  }

  return <Button onClick={copyText}>{wasCopied ? "Copied" : "Copy"}</Button>;
};
```

Why this matches the style:

- focused component
- explicit prop type
- clear state and handler naming
- defensive guard for required data
- simple colocated logic

## Test style

Preferred:

```ts
import { expect, test } from "@playwright/test";

import { sequence } from "#pkg/util/numbers.util.js";

test("when an inclusive range is given, sequence returns all numbers in the range", () => {
  expect(sequence({ fromInclusive: 3, toInclusive: 7 })).toEqual([
    3, 4, 5, 6, 7,
  ]);
});
```

Prefer this over nested describe trees unless grouping adds real clarity.

## package.json scripts

Preferred:

```json
{
  "scripts": {
    "build": "turbo run turbo:build",
    "dev": "pnpm run build --watch --preserveWatchOutput",
    "lint": "eslint --max-warnings 0 .",
    "lint:fix": "pnpm run lint --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "turbo:build": "tsc",
    "clean": "pnpm run clean:artifacts && del-cli --dot=true \"node_modules\"",
    "clean:artifacts": "del-cli --dot=true \"dist\" \"*.tsbuildinfo\""
  }
}
```

Why this matches the style:

- explicit script names
- task-runner-specific naming only where justified

## Anti-patterns

Avoid:

```ts
export async function run(u: string, o: any) {
  try {
    return await fetch(u).then((r) => r.json());
  } catch {
    return null;
  }
}
```

Problems:

- vague names
- `any`
- swallows errors
- no validation
- no actionable error messages

Prefer:

```ts
type RunOptions = {
  signal?: AbortSignal;
};

export async function fetchJson(
  url: URL,
  options: RunOptions = {},
): Promise<unknown> {
  const response = await fetch(url, { signal: options.signal });

  if (!response.ok) {
    throw new Error(
      `Request failed: url=${url.href}, status=${response.status}`,
    );
  }

  return await response.json();
}
```
