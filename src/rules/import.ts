import type { Linter } from 'eslint'

/** Explicit decision for every `import-x/*` rule. */
export const importRules: Linter.RulesRecord = {
  /*
   * Matches `consistent-type-imports`' `separate-type-imports`: only a top-level `import type` is
   * fully erased.
   */
  'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  /*
   * tsc reports a missing default export in TS files. In JS it can't fire either: under
   * `esModuleInterop` (implied by `module: "preserve"`/`nodenext`) import-x gives every module
   * with exports a synthetic default.
   */
  'import-x/default': 'off',
  // The webpackChunkName comment is read by webpack only.
  'import-x/dynamic-import-chunkname': 'off',
  /*
   * tsc reports duplicate export names and `export *` clashes in TS files; `importJsRules` covers
   * JS.
   */
  'import-x/export': 'off',
  // Contradicts the exported-function-above-its-helpers layout `no-use-before-define` allows.
  'import-x/exports-last': 'off',
  /*
   * Whether `./a` or `./a.ts` is right depends on the consumer's `moduleResolution`; under
   * `nodenext` tsc already rejects extensionless relative imports.
   */
  'import-x/extensions': 'off',
  // Ordering belongs to `import-x/order`, so no `absolute-first` here.
  'import-x/first': 'error',
  // Bans `export function f()` at the definition.
  'import-x/group-exports': 'off',
  // Count-based limit, off like core `max-lines`.
  'import-x/max-dependencies': 'off',
  // tsc reports a missing named export in TS files; `importJsRules` covers JS.
  'import-x/named': 'off',
  // tsc reports a missing namespace member in TS files; `importJsRules` covers JS.
  'import-x/namespace': 'off',
  'import-x/newline-after-import': [
    'error',
    { count: 1, exactCount: true, considerComments: true },
  ],
  // AMD is banned outright by `no-amd`.
  'import-x/no-absolute-path': ['error', { esmodule: true, commonjs: true, amd: false }],
  'import-x/no-amd': 'error',
  'import-x/no-anonymous-default-export': [
    'error',
    {
      allowArray: false,
      allowArrowFunction: false,
      allowAnonymousClass: false,
      allowAnonymousFunction: false,
      // `export default defineConfig({...})` is the canonical config-file form.
      allowCallExpression: true,
      allowLiteral: false,
      allowNew: false,
      allowObject: false,
    },
  ],
  // Off for `.cjs` files in the `konceptware/base/commonjs` block.
  'import-x/no-commonjs': [
    'error',
    { allowPrimitiveModules: false, allowRequire: false, allowConditionalRequire: false },
  ],
  'import-x/no-cycle': [
    'error',
    {
      maxDepth: '∞',
      /*
       * A cycle inside a dependency isn't ours to fix, and traversing `node_modules` is the costly
       * part.
       */
      ignoreExternal: true,
      allowUnsafeDynamicCyclicDependency: false,
      esmodule: true,
      commonjs: true,
      amd: false,
    },
  ],
  // Framework entry points (`page.tsx`, `*.config.ts`) and package entries need default exports.
  'import-x/no-default-export': 'off',
  // `@typescript-eslint/no-deprecated` covers TS type-aware; `importJsRules` covers JS.
  'import-x/no-deprecated': 'off',
  // Vite's `?raw`/`?url` imports are separate modules.
  'import-x/no-duplicates': ['error', { considerQueryString: true, 'prefer-inline': false }],
  // `esmodule` also covers `import(path)`: a computed specifier defeats bundlers and `no-cycle`.
  'import-x/no-dynamic-require': ['error', { esmodule: true }],
  'import-x/no-empty-named-blocks': 'error',
  'import-x/no-extraneous-dependencies': [
    'error',
    {
      /*
       * `/test` allows them wherever the consumer scopes it; scripts and config files need an
       * override.
       */
      devDependencies: false,
      // An optional dependency may be missing at install time, so an unguarded import crashes.
      optionalDependencies: false,
      peerDependencies: true,
      bundledDependencies: true,
      // A published `.d.ts` keeps `import type`, so a type from a devDependency breaks consumers.
      includeTypes: true,
      includeInternal: false,
    },
  ],
  'import-x/no-import-module-exports': ['error', { exceptions: [] }],
  /*
   * Its fix is a barrel `index.ts` per folder, which hides module origins the way the banned
   * `export *` does.
   */
  'import-x/no-internal-modules': 'off',
  'import-x/no-mutable-exports': 'error',
  'import-x/no-named-as-default': 'error',
  // tsc reports a property missing from the default export in TS files; `importJsRules` covers JS.
  'import-x/no-named-as-default-member': 'off',
  'import-x/no-named-default': 'error',
  // Contradicts `no-default-export` being off: named exports are the default style.
  'import-x/no-named-export': 'off',
  // Bans external namespace imports too; `no-restricted-syntax` bans only local ones.
  'import-x/no-namespace': 'off',
  // Which folders run in a browser is the consumer's layout.
  'import-x/no-nodejs-modules': 'off',
  'import-x/no-relative-packages': ['error', { esmodule: true, commonjs: true, amd: false }],
  // Forces `@/` aliases, which each consumer would have to configure.
  'import-x/no-relative-parent-imports': 'off',
  // A default import's local name is the importer's choice; that is what a default export is for.
  'import-x/no-rename-default': 'off',
  // Its zones name the consumer's folders.
  'import-x/no-restricted-paths': 'off',
  'import-x/no-self-import': 'error',
  // CSS, polyfills and `server-only` are imported for their side effects on purpose.
  'import-x/no-unassigned-import': 'off',
  // tsc reports an unresolvable module in TS files; `importJsRules` covers JS.
  'import-x/no-unresolved': 'off',
  // Throws under ESLint 10, which removed the FileEnumerator API the rule walks the project with.
  'import-x/no-unused-modules': 'off',
  // `noUselessIndex` would rewrite `./dir/index.ts` to the directory import `./dir`.
  'import-x/no-useless-path-segments': ['error', { commonjs: true, noUselessIndex: false }],
  // tsc misses `style-loader!./a.css` whenever a wildcard `declare module '*.css'` matches it.
  'import-x/no-webpack-loader-syntax': 'error',
  'import-x/order': [
    'error',
    {
      // No `type` group: `import type` stays next to the value import from the same module.
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
      pathGroups: [],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: false, orderImportKind: 'desc' },
      sortTypesGroup: false,
      // `sort-imports` sorts the names inside `{ … }`.
      named: false,
      // Side-effect imports such as polyfills run in source order, so their position is deliberate.
      warnOnUnassignedImports: false,
    },
  ],
  // Contradicts `no-default-export` being off: named exports are the default style.
  'import-x/prefer-default-export': 'off',
  // `import * as` is allowed for external packages, not required.
  'import-x/prefer-namespace-import': 'off',
  // Off for `.d.ts` files in the `konceptware/base/declarations` block.
  'import-x/unambiguous': 'error',
}

/** `import-x/*` rules for JS files only: in TS files tsc reports the same problems. */
export const importJsRules: Linter.RulesRecord = {
  'import-x/export': 'error',
  // `.cjs` files import through `const { x } = require('./m')`.
  'import-x/named': ['error', { commonjs: true }],
  'import-x/namespace': ['error', { allowComputed: false }],
  'import-x/no-deprecated': 'error',
  'import-x/no-named-as-default-member': 'error',
  /*
   * `caseSensitiveStrict` would also check the case of the directory ESLint runs from,
   * which no import names.
   */
  'import-x/no-unresolved': [
    'error',
    { esmodule: true, commonjs: true, amd: false, caseSensitive: true, caseSensitiveStrict: false },
  ],
}
