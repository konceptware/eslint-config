# @konceptware/eslint-config

Konceptware's ESLint flat configs. Every rule is set explicitly and chosen by us: no
plugin `recommended` sets are inherited, so a plugin upgrade never changes behaviour
without a decision recorded here. See [`docs/rules/`](docs/rules) for each rule's setting
and purpose.

## Presets

| Import                                  | Use for                                 | Extra peer dependencies                                                                |
| --------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| `@konceptware/eslint-config`            | Prod code (TS/JS, type-aware)           | —                                                                                      |
| `@konceptware/eslint-config/test`       | Relaxations of the prod rules for tests | —                                                                                      |
| `@konceptware/eslint-config/vitest`     | Vitest rules                            | `@vitest/eslint-plugin`                                                                |
| `@konceptware/eslint-config/jest`       | Jest rules                              | `eslint-plugin-jest`                                                                   |
| `@konceptware/eslint-config/playwright` | Playwright rules                        | `eslint-plugin-playwright`                                                             |
| `@konceptware/eslint-config/react`      | React components and hooks              | `@eslint-react/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y-x` |

## Formatting

ESLint here checks code quality only; formatting belongs to Prettier, run separately
(`prettier --check .` in CI). No rule that `eslint-config-prettier` lists as conflicting
with Prettier is enabled, so you don't need `eslint-config-prettier` on top of these
presets. `tests/prettier-compat.test.ts` enforces that.

Run `eslint --fix` before `prettier --write` (e.g. in lint-staged): some autofixes, such
as the braces `curly` adds, are left for Prettier to format.

## Usage

```sh
pnpm add -D eslint typescript @konceptware/eslint-config
```

```js
// eslint.config.js
import { defineConfig } from 'eslint/config'
import base from '@konceptware/eslint-config'
import test from '@konceptware/eslint-config/test'
import vitest from '@konceptware/eslint-config/vitest'
import playwright from '@konceptware/eslint-config/playwright'
import react from '@konceptware/eslint-config/react'

export default defineConfig([
  { ignores: ['dist/**', 'coverage/**'] },
  ...base,
  ...react,
  { files: ['src/**/*.test.ts'], extends: [test, vitest] },
  { files: ['e2e/**/*.ts'], extends: [test, playwright] },
])
```

The presets define rules, not your layout. `/test` and the runner presets set no file
globs: scope each one to your test files with `extends`, or it applies to every file.
Nothing is ignored for you either; add your build output, or your `.gitignore` with
`includeIgnoreFile` from `@eslint/compat`. The only globs the presets carry are about
syntax: type-aware rules stay off JS files, `.cjs` parses as CommonJS, and the JSX rules
cover `.tsx`/`.jsx`. Under `extends` those intersect with your `files`.

Type-aware rules need `strict: true` (at least `strictNullChecks`) in your tsconfig, and
every linted TS file covered by a `tsconfig.json`.

Order matters: `base` first, the scoped `/test` and runner presets after it so they
override it.

`import-x/no-extraneous-dependencies` bans importing devDependencies, including
`import type`; `/test` lifts the ban wherever you scope it. Scripts and tool configs run
only in development too, so lift it for them yourself:

```js
{
  files: ['scripts/**', '*.config.ts'],
  rules: {
    'import-x/no-extraneous-dependencies': [
      'error',
      { devDependencies: true, optionalDependencies: false, includeTypes: true },
    ],
  },
}
```

No barrels: re-export members by name (`export { parse, format } from './dates'`), never
`export * from`, and use `import * as` only for external packages (`import * as z from 'zod'`),
not the repo's own modules (relative, `@/`, `~/` or `#` paths).

`no-restricted-syntax` is a list, and setting it replaces ours rather than adding to it.
Spread ours in to keep the `for…in`, `enum`, `interface`, `export *` and local `import * as`
bans:

```js
import base, { restrictedSyntax } from '@konceptware/eslint-config'

export default [
  ...base,
  { rules: { 'no-restricted-syntax': ['error', ...restrictedSyntax, 'WithStatement'] } },
]
```

### Vitest

- Import the test API explicitly: `import { describe, expect, it, vi } from 'vitest'`. The
  preset does not assume `globals: true`.
- An assertion helper counts as an assertion when its name starts with `expect`
  (`expectValidOrder(order)`).
- A bare `toHaveBeenCalled()` is reported by `konceptware-vitest/prefer-called-with`, which
  is `vitest/prefer-called-with` without its autofix: the upstream fix rewrites it to a
  zero-argument `toHaveBeenCalledWith()` and turns passing tests red.
- `vitest/prefer-to-be` is replaced by `konceptware-vitest/prefer-to-be`, the same check
  minus one fix: upstream rewrites `.not.toBe(undefined)` to `toBeUndefined()`, inverting
  the assertion. That case is reported and left for you to fix.
- `vitest/require-hook` reports calls at module or `describe` level. A helper that only
  declares `describe`/`it` blocks is allowed by name:

  ```js
  {
    files: ['src/**/*.test.ts'],
    rules: { 'vitest/require-hook': ['error', { allowedFunctionCalls: ['describeCases'] }] },
  }
  ```

### Jest

- Import the test API explicitly: `import { describe, expect, it, jest } from '@jest/globals'`,
  and add the package itself (`pnpm add -D @jest/globals`); the preset declares no Jest
  globals.
- An assertion helper counts as an assertion when its name starts with `expect`, and a test
  must end with an assertion (`jest/prefer-ending-with-an-expect`): cleanup goes in
  `afterEach`.
- Type mock factories in TS: `jest.mock<typeof import('./db')>('./db', () => …)`.
- Use `toBe(true)`/`toBe(false)`; `toBeTruthy()`/`toBeFalsy()` are banned through
  `jest/no-restricted-matchers`.
- The preset sets `settings.jest.version: 30` so `jest/no-deprecated-functions` doesn't have
  to find `jest` from the plugin's directory. Override it with your own `settings.jest`.

### Playwright

- Locate elements the way a user does: `getByRole`, `getByLabel`, `getByTestId`.
  `playwright/no-raw-locators` reports `page.locator('.btn')`; a selector held in a named
  constant (`page.locator(CANVAS)`) is the deliberate escape.
- A timeout that differs from `playwright.config` is a named constant
  (`const UPLOAD_MS = 60_000`), and `toPass()` always gets one.
- `test.skip`, `test.fixme` and `test.slow` are allowed only with a condition and a reason:
  `test.skip(isMobile, 'no hover on touch screens')`.
- Four rules are re-registered as `konceptware-playwright/*` without their autofix, because
  the upstream fix rewrites assertions or code incorrectly:
  - `prefer-web-first-assertions`: turns `toBeFalsy()` on `getAttribute` into a positive
    `toHaveAttribute`.
  - `prefer-to-have-count`: rewrites `const c = await l.count()` to `const c = l`.
  - `no-useless-await`: strips the `await` from page-object methods named like locator ones.
  - `no-unsafe-references`: writes duplicate or shifted `page.evaluate` arguments.

### Storybook

Requires `eslint-plugin-storybook`. Story files take `/test` too, since they import
devDependencies; `.storybook/main.*` takes `storybookMain`, because the story rules would
report a file without stories:

```js
import storybook, { storybookMain } from '@konceptware/eslint-config/storybook'

export default defineConfig([
  // …
  { files: ['src/**/*.stories.tsx'], extends: [test, storybook] },
  { files: ['.storybook/main.ts'], extends: [storybookMain] },
])
```

- Cover `.storybook` in your tsconfig by naming it: `"include": ["src", ".storybook/*.ts"]`.
  TypeScript's globs skip dot-directories, so `".storybook"` alone matches nothing and the
  type-aware rules fail with "not found by the project service".
- Type the meta with `satisfies` (`const meta = { … } satisfies Meta<typeof Button>`), and set
  no `title`: autotitle derives the sidebar path from the file's location.
- Write `play` as a method, `async play({ canvasElement }) {…}`; `object-shorthand` reports
  the arrow form. `storybook/context-in-play-function` is off because it misreads the method
  form; on a `StoryObj`-typed story tsc reports a `play` reused without its context.
- `storybook/await-interactions` only recognises the legacy `@storybook/test` import, so with
  `storybook/test` it stays silent. In TS, `@typescript-eslint/no-floating-promises` reports an
  un-awaited interaction instead.
- `use-storybook-testing-library` is re-registered as `konceptware-storybook/*` without its
  autofix, which swaps any `@testing-library/*` import for `storybook/test`, including names
  such as `render` that `storybook/test` doesn't export. The suggestion to switch remains.
- `storybook/no-uninstalled-addons` reads `./package.json` relative to the directory ESLint
  runs from. In a monorepo linted from the root, pass your package's path:
  `['error', { packageJsonLocation: 'apps/web/package.json', ignore: [] }]`. It only checks
  addons written as strings or `{ name }` objects; one wrapped in `getAbsolutePath(…)` is
  skipped.

### React

- On React 19 and later, pass `ref` as a prop; `forwardRef` is reported
  (`@eslint-react/no-forward-ref`). The rule reads the installed React version and stays
  silent below 19, where `forwardRef` is still required.
- Hook rules (`rules-of-hooks`, `exhaustive-deps`, …) also run on `.ts` files, where custom
  hooks live. Where `@eslint-react` and `react-hooks` implement the same rule, the
  `@eslint-react` one is used and the other is off.
- An effect that should run after every render says so: `useEffect(fn, undefined)`.
- Type renderable values as `ReactNode`; `ReactElement` is banned through
  `@typescript-eslint/no-restricted-types`. Setting that rule replaces the list, so spread
  ours in: `{ types: { ...restrictedReactTypes, Foo: 'use Bar' } }`, with
  `restrictedReactTypes` imported from `@konceptware/eslint-config/react`.
- Wrap a declared component, not an inline one: `export const Row = memo(RowView)`.
  `memo(() => …)` has no display name, and `memo(function Row() {…})` breaks
  `prefer-arrow-callback`.
- With React Compiler, set `settings['react-x'].compilationMode` to `'infer'` or `'all'`;
  `@eslint-react/no-unstable-context-value` then stops asking for a `useMemo` the compiler
  adds itself.
- Map your wrapper components to the HTML they render, so the accessibility rules check
  them too:

  ```js
  { settings: { 'jsx-a11y-x': { components: { Link: 'a', Image: 'img', TextInput: 'input' } } } }
  ```

- `jsx-a11y-x/prefer-tag-over-role` judges the `role` alone, so a few correct patterns
  take a disable comment with their reason: `<canvas role="img" aria-label="…">` for a
  chart, a hand-built `<ul role="listbox">`, and a focusable scroll region. So does
  `autoFocus` on the first field of a dialog (`jsx-a11y-x/no-autofocus`).

## Developing

| Command           | Does                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `pnpm test`       | Preset wiring tests and a coverage test that fails on any rule left undecided |
| `pnpm docs:rules` | Regenerates `docs/rules/*.md` from the resolved configs                       |
| `pnpm inspect`    | Opens `@eslint/config-inspector` on this repo's own config                    |
| `pnpm changeset`  | Records a release note; required for every rule change                        |

Rule decisions live in `src/rules/*.ts`, one module per rule source. Comments use the names in `docs/terminology.md`. When a source is
fully reviewed, add it to `REVIEWED_SOURCES` in `scripts/rule-sources.ts`; from then on
a rule the plugin adds without a decision fails the coverage test.
