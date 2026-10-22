import react from '@eslint-react/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import type { ESLint, Linter } from 'eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { JS_FILES, REACT_FILES, SOURCE_FILES } from './globs.ts'
import {
  jsxA11yRules,
  reactHookRules,
  reactHooksRules,
  reactJsRules,
  reactRules,
} from './rules/react.ts'
import { stylisticJsxRules } from './rules/stylistic.ts'

/**
 * React-only rules: components, hooks, accessibility. Requires
 * `@eslint-react/eslint-plugin`, `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y-x`.
 * Hook rules also need to see `.ts` files that define custom hooks, so they cover all TS/JS.
 */
const reactConfig: Linter.Config[] = [
  {
    name: 'konceptware/react',
    files: REACT_FILES,
    plugins: {
      '@eslint-react': react,
      '@stylistic': stylistic,
      'jsx-a11y-x': jsxA11y,
    },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    rules: {
      ...reactRules,
      ...jsxA11yRules,
      ...stylisticJsxRules,
    },
  },
  {
    name: 'konceptware/react/js',
    files: JS_FILES,
    rules: reactJsRules,
  },
  {
    name: 'konceptware/react/hooks',
    files: SOURCE_FILES,
    plugins: {
      '@eslint-react': react,
      /*
       * Needed for `@typescript-eslint/no-restricted-types`; the same object the base preset
       * registers, so ESLint accepts the duplicate name.
       */
      '@typescript-eslint': tseslint.plugin,
      /*
       * The module itself, not a rebuilt `{ meta, rules }`: ESLint rejects two different objects
       * under one plugin name, which would break consumers who also register this plugin.
       */
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the plugin's nested `configs.flat` doesn't fit ESLint's `Plugin` type
      'react-hooks': reactHooks as unknown as ESLint.Plugin,
    },
    rules: { ...reactHookRules, ...reactHooksRules },
  },
]

export { restrictedReactTypes } from './rules/react.ts'

export default reactConfig
