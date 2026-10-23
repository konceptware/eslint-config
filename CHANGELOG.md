# @konceptware/eslint-config

## 0.3.0

### Minor Changes

- 3e42ede: `@eslint-react/no-implicit-ref` is off: it reports every spread carrying a non-React-typed `ref`, such as React Hook Form's `{...field}`, without checking whether the target accepts a ref. A target-aware replacement is tracked in konceptware/eslint-config#1.

## 0.2.0

### Minor Changes

- c4f1ce7: `no-inline-comments` is off: a trailing `// why` on a parameter or object key stays on that line.
- c4f1ce7: `curly` switches from `multi-line` to `multi-or-nest`: a single one-line statement may be bare on the line below its condition, and braces around a lone one-line statement are now reported. `consistent` still makes every clause of an `if`/`else` chain match.

## 0.1.0

### Minor Changes

- 4f2f946: Initial release: `prod`, `test`, `vitest`, `jest`, `playwright` and `react` flat configs with an explicit decision for every rule.
