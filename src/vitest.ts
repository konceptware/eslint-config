import vitest from '@vitest/eslint-plugin'
import type { Linter } from 'eslint'

import { TS_FILES } from './globs.ts'
import { vitestRules } from './rules/vitest.ts'
import { konceptwareVitest } from './vitest-plugin.ts'

/**
 * Vitest rules. Requires `@vitest/eslint-plugin`. Sets no test-file globs: scope it with
 * `{ files, extends: [vitest] }`.
 */
const vitestConfig: Linter.Config[] = [
  {
    name: 'konceptware/vitest',
    plugins: { vitest, 'konceptware-vitest': konceptwareVitest },
    rules: {
      ...vitestRules,
      'konceptware-vitest/prefer-called-with': 'error',
      'konceptware-vitest/prefer-to-be': 'error',
    },
  },
  {
    /*
     * `unbound-method` is type-aware, and `typecheck: true` makes other rules type-aware; the
     * base preset disables type-aware linting for JS files, so on a JS test file they would throw.
     * `extends` intersects these
     * `files` with the consumer's.
     */
    name: 'konceptware/vitest/typed',
    files: TS_FILES,
    settings: { vitest: { typecheck: true } },
    rules: {
      // The vitest version wraps it and also exempts `expect(service.save).toHaveBeenCalled()`.
      '@typescript-eslint/unbound-method': 'off',
      'vitest/unbound-method': ['error', { ignoreStatic: false }],
    },
  },
]

export default vitestConfig
