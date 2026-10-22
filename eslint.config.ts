import { defineConfig } from 'eslint/config'

import base from './src/index.ts'
import test from './src/test.ts'
import vitest from './src/vitest.ts'

export default defineConfig([
  { ignores: ['dist/**', 'tests/fixtures/**'] },
  ...base,
  {
    files: ['tests/**/*.test.ts'],
    extends: [test, vitest],
    // `describeRules` only declares `describe`/`it` blocks, so it runs at collection time by design.
    rules: { 'vitest/require-hook': ['error', { allowedFunctionCalls: ['describeRules'] }] },
  },
  {
    // Test helpers and tool configs run only in development.
    files: ['tests/**/*.ts', '*.config.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, optionalDependencies: false, includeTypes: true },
      ],
    },
  },
])
