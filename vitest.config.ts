import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/fixtures/**'],
    // Each ESLint instance with typed linting starts a TypeScript project service, which takes seconds.
    testTimeout: 60_000,
  },
})
