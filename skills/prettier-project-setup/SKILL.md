---
name: prettier-project-setup
description: "Prettier setup for Node.js/TypeScript projects. Use when adding, editing, or standardizing Prettier dependencies, prettier.config.cjs, .prettierignore, or format scripts."
---

# Prettier Project Setup

## Prettier Setup

Install Prettier and the package.json plugin:

```bash
pnpm add -D prettier@^3.3.3 prettier-plugin-packagejson@^2.5.2
```

Create `prettier.config.cjs` with this exact config:

```js
module.exports = {
  trailingComma: "all",
  printWidth: 100,
  endOfLine: "auto",
  plugins: ["prettier-plugin-packagejson"],
};
```

Create `.prettierignore`:

```.gitignore
**/dist
pnpm-lock.yaml
```
