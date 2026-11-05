# @konceptware/eslint-config

## 0.5.0

### Minor Changes

- 726a745: New `createStylelintConfig({ tokenPrefix })` in `@konceptware/eslint-config/stylelint`: `stylelint-config-standard` (now installed with this package), the design-token rule, `--<tokenPrefix>-…` custom property names and CSS-modules allowances in one call. The `stylelint` peer dependency narrows to `^18.0.0`, which `stylelint-config-standard` 41 requires.

## 0.4.0

### Minor Changes

- c77b70e: New `/storybook` preset for story files, with `storybookMain` for `.storybook/main.*`. Requires the optional peer `eslint-plugin-storybook`. Every rule is decided explicitly: `context-in-play-function` is off, and `use-storybook-testing-library` runs as `konceptware-storybook/use-storybook-testing-library` without its autofix.
- f3c1f7f: New `@konceptware/eslint-config/stylelint` export: a Stylelint config rejecting raw `font-size`, `transition-duration` and `z-index` values in favour of design tokens. Requires the new optional peer dependency `stylelint`.

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
