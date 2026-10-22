# Terminology

One name per concept in comments and docs. When a comment needs one of these, use the
spelling here.

| Term                | Meaning                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| base preset         | The default export of `src/index.ts` (config name `konceptware/base`). Not "prod preset", "default preset" or "prod-code preset".            |
| `/test`, `/react` … | The package subpath entry points (`@konceptware/eslint-config/test` …). The configs they export are presets; `/test` is also a preset.       |
| runner presets      | `/vitest`, `/jest` and `/playwright` together.                                                                                               |
| block               | One named flat-config object inside a preset, referred to by its `name` (the `konceptware/base/commonjs` block).                             |
| consumer            | The project that extends these presets. Not "a project" or "the repo".                                                                       |
| `files` override    | A consumer-side config entry that narrows or relaxes a rule for some paths. Not "per-folder override" or "per-glob exception".               |
| core rule           | An ESLint built-in rule (`core \`no-shadow\``). Plugin rules are written with their prefix.                                                  |
| type-aware          | A rule that needs the TypeScript type checker. Not "needs type information" or "calls the type checker".                                     |
| tsc                 | The TypeScript compiler. A compiler option gating a diagnostic is written "tsc under `strict`". React Compiler is named in full.             |
| Reported by tsc     | Shorthand for a rule that is `off` because tsc already reports the problem, optionally with the diagnostic code: `(TS2454)`.                 |
| autofix             | A rule's `fix`. `--fix` means the CLI pass; "fix-on-save" means the editor applying it; a "suggestion" is never applied automatically.       |
| Replaced by `x`     | A rule turned `off` in favour of a sibling rule `x` that owns the check.                                                                     |
| `konceptware-*`     | This package's own plugins (`konceptware-vitest`, `konceptware-playwright`): upstream rules re-registered without their autofix.             |
| wraps               | A plugin rule that delegates to a typescript-eslint rule and extends it (`vitest/unbound-method` wraps `@typescript-eslint/unbound-method`). |
| nested comment      | The duplicate comment token typescript-estree emits for a JSDoc scope glob. Not "phantom comment".                                           |
| source              | A rule provider (ESLint core or one plugin) in `scripts/rule-sources.ts`; a "reviewed" source has an explicit setting for every rule.        |
