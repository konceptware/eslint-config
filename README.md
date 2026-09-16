# @real-acrm/eslint-config

The shared ESLint baseline for every real-acrm package. A consumer's whole config is:

```ts
import { baseline } from "@real-acrm/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...baseline({
    tsconfigRootDir: __dirname,
    ignores: ["dist/**", "coverage/**"],
    react: true, // or ["src/admin/**"] to scope to a subtree, or omit
    tests: "vitest", // or "jest" — follows the runner the package uses
    storybook: true,
  }),
  {
    /* OVERRIDES — the only place a consumer may differ from the baseline.
       Narrowest glob first; every entry carries a falsifiable mechanism. */
  },
]);
```

**The contract: rule activation is identical across consumers.** Anything a package
needs to differ on is a trailing override with a stated mechanism, never a divergent
baseline. `docs/LINT-RULESET.md` in the acrm monorepo is the ledger of those overrides
and of every deferred adoption.

## What the baseline extends

| Block | Preset                                                                | Scope                         |
| ----- | --------------------------------------------------------------------- | ----------------------------- |
| 1     | consumer `ignores`                                                    | global                        |
| 2     | `js.configs.recommended` + tseslint `strictTypeChecked`¹              | all files                     |
| 3     | local rules (barrel ban, `no-unused-vars` options) + `projectService` | `srcGlobs`                    |
| 3     | `import-x` `recommended` + `typescript`                               | `srcGlobs`                    |
| 3     | `react` + `jsx-a11y` + `react-hooks` recommended                      | `react` globs                 |
| 4     | `storybook` `flat/recommended` (scopes itself to stories)             | opt-in                        |
| 5     | `vitest.configs.recommended` / `jest` `flat/recommended`              | `testGlobs`                   |
| 6     | `disableTypeChecked` + node globals escape hatch                      | `**/*.{js,cjs,mjs}`, configs² |

¹ Strict is the measured monorepo-wide decision (see `docs/LINT-RULESET.md`);
`strict: false` downgrades to `recommendedTypeChecked` and is itself a
ledger-worthy divergence.
² Plus consumer `untypedGlobs`: files outside every tsconfig project. A type-aware rule
on such a file **aborts the whole run** rather than skipping the file.

Deliberately not here, because they are a different tool rather than a different
standard: `@medusajs/eslint-plugin` (backend-only; its preset globally ignores
storefronts), `@next/eslint-plugin-next` (the Next app only). Consumers add those
presets themselves before their OVERRIDES block.

## Preset mechanics (established; do not re-derive)

- **`settings.react.version` must be a literal (`"19.0.4"`), never `"detect"`** —
  eslint-plugin-react 7.37.5 sniffs the version via `context.getFilename()`, removed in
  eslint 10, so detection crashes the run before any rule executes.
- **`reactHooks.configs.flat.recommended`, never `.recommended`** — the latter is still
  eslintrc format (`plugins: ["react-hooks"]`) and crashes `extends`.
- **The import resolver is bound here, not looked up from the consumer.**
  `importX.flatConfigs.typescript` sets the LEGACY `import-x/resolver: {typescript:
true}`, which resolves `eslint-import-resolver-typescript` from the consumer — where
  it may be absent (every import reads as unresolved) or an incompatible major
  ("invalid interface loaded as resolver"). The baseline overrides it with
  `import-x/resolver-next: [createTypeScriptImportResolver()]`, binding the resolver
  instance this package ships so resolution cannot vary by consumer. The preset is
  still extended for its one rule change (`import-x/named` off — TypeScript's job).
- **`importX.flatConfigs.recommended` sets `sourceType: "module"`** on everything it
  matches, so it stays scoped to `srcGlobs` — at top level it breaks CommonJS tooling
  configs.
- **`tseslint.configs.disableTypeChecked` carries its own `languageOptions`** — it is
  merged via `extends` (first) so a consumer's `globals` are not silently dropped.
- **Plugins are real `dependencies`, not peers.** Flat-config consumers import plugin
  _objects_, so plugins resolve from this package's own `node_modules`; there is no
  string-based plugin lookup to satisfy.
- **The `compat()` seam in `src/index.ts` is the only type assertion allowed here.**
  Every flat-config plugin compiles its exported configs against a different eslint
  typing generation, so no common supertype exists; runtime parity is what
  `eslint --print-config` verifies.

## Self-test

`.smoke/` is a miniature consumer: its `eslint.config.ts` imports this package by name
and its fixtures contain deliberate violations. Expected output — exactly two errors:

```bash
cd .smoke && npx eslint src   # 1× no-floating-promises (type-aware works)
                              # 1× no-restricted-syntax (barrel ban works)
```

The package root's own lint ignores `.smoke/**` for that reason.

## Consuming from a standalone editor-repo checkout

This package is a git submodule nested inside `page-editor`, `rich-text-editor` and
`image-editor` (at `eslint-config/`), listed in each repo's `pnpm-workspace.yaml` and
depended on as `workspace:*`. Inside the acrm monorepo the nested copy is shadowed by
acrm's `packages/eslint-config`; `scripts/lint-baseline-parity.mjs` in acrm asserts the
nested pointers equal acrm's pointer, so the two resolution paths cannot silently
diverge. Never run `pnpm install` inside a submodule while it sits inside acrm — a
nested `node_modules` plants a second workspace root.
