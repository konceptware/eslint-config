import type { Linter } from 'eslint'
import jest from 'eslint-plugin-jest'

import { TS_FILES } from './globs.ts'
import { jestRules } from './rules/jest.ts'

/**
 * Jest rules. Requires `eslint-plugin-jest`; tests import their API from
 * `@jest/globals`, so no Jest globals are declared. Sets no test-file globs: scope it
 * with `{ files, extends: [jest] }`.
 */
const jestConfig: Linter.Config[] = [
  {
    name: 'konceptware/jest',
    plugins: { jest },
    /*
     * Without a version `jest/no-deprecated-functions` requires `jest/package.json` from
     * the plugin's own directory and throws on every file when that fails, as it does
     * under pnpm. Every deprecation it knows dates from Jest 26 or earlier, so any
     * version from 26 up enables all of them.
     */
    settings: { jest: { version: 30 } },
    rules: jestRules,
  },
  {
    /*
     * These rules are type-aware, which the base preset turns off for JS files, and
     * `no-untyped-mock-factory`'s fix inserts a type argument; on a JS test file they would
     * throw or produce invalid code. `extends` intersects these `files` with the consumer's.
     */
    name: 'konceptware/jest/typed',
    files: TS_FILES,
    rules: {
      // The jest version wraps it and also exempts `expect(service.save).toHaveBeenCalled()`.
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': ['error', { ignoreStatic: false }],
      'jest/no-error-equal': 'error',
      'jest/no-unnecessary-assertion': 'error',
      'jest/no-untyped-mock-factory': 'error',
      'jest/valid-expect-with-promise': ['error', { checkThenables: true }],
    },
  },
]

export default jestConfig
