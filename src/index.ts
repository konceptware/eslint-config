import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import stylistic from '@stylistic/eslint-plugin'
import type { Linter } from 'eslint'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { DECLARATION_FILES, JS_FILES, SOURCE_FILES } from './globs.ts'
import { parser } from './parser.ts'
import { coreRules } from './rules/core.ts'
import { eslintCommentsRules } from './rules/eslint-comments.ts'
import { importJsRules, importRules } from './rules/import.ts'
import { stylisticRules } from './rules/stylistic.ts'
import { typescriptRules } from './rules/typescript.ts'

/**
 * Base preset: core ESLint, typescript-eslint (type-aware) and import-x.
 *
 * Type-aware rules use the TypeScript project service, so every linted TS file must be
 * covered by a tsconfig. Plain JS files get the same rules minus the type-aware ones.
 * Ignores nothing: build output and generated files are the consumer's to ignore. Put
 * this first; the `/test` and runner presets, scoped by the consumer, override it.
 */
const base: Linter.Config[] = [
  {
    name: 'konceptware/base',
    files: SOURCE_FILES,
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': importX,
      '@stylistic': stylistic,
      '@eslint-community/eslint-comments': eslintComments,
    },
    languageOptions: {
      parser,
      parserOptions: { projectService: true },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.es2025, ...globals.node },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
      /*
       * import-x reads exports only from files with these extensions; its default is
       * `.js`/`.mjs`/`.cjs`.
       */
      'import-x/extensions': ['.ts', '.tsx', '.cts', '.mts', '.js', '.jsx', '.cjs', '.mjs'],
      /*
       * Type-only packages resolve into `@types/*` and count as external, like their runtime
       * package.
       */
      'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      ...coreRules,
      ...typescriptRules,
      ...importRules,
      ...stylisticRules,
      ...eslintCommentsRules,
    },
  },
  {
    // `.cjs` is CommonJS by definition: `require`/`module.exports` scope, not ES module scope.
    name: 'konceptware/base/commonjs',
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { 'import-x/no-commonjs': 'off' },
  },
  {
    /*
     * A global declaration file must stay a script: in a module `declare module '*.svg'`
     * becomes an augmentation, and tsc rejects the wildcard name (TS2664).
     */
    name: 'konceptware/base/declarations',
    files: DECLARATION_FILES,
    rules: { 'import-x/unambiguous': 'off' },
  },
  {
    ...tseslint.configs.disableTypeChecked,
    name: 'konceptware/base/js-without-types',
    files: JS_FILES,
    rules: { ...tseslint.configs.disableTypeChecked.rules, ...importJsRules },
  },
]

export { restrictedSyntax } from './rules/restricted-syntax.ts'

export default base
