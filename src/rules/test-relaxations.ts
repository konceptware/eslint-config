import type { Linter } from 'eslint'

/**
 * Severities the `/test` preset overrides: every entry loosens a decision made in `core.ts`,
 * `typescript.ts` or `import.ts`.
 */
export const testRelaxations: Linter.RulesRecord = {
  // Tests set up mocks and fixtures by mutating the objects they're handed.
  'no-param-reassign': 'off',
  // Partial mocks such as `{ id: 1 } as User` are the normal way to stub.
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow',
      arrayLiteralTypeAssertions: 'never',
    },
  ],
  // Stub implementations such as `vi.fn(() => {})` are empty on purpose.
  '@typescript-eslint/no-empty-function': 'off',
  // Test runners, fixtures and mocking libraries are devDependencies.
  'import-x/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: true,
      optionalDependencies: false,
      peerDependencies: true,
      bundledDependencies: true,
      includeTypes: true,
      includeInternal: false,
    },
  ],
  // A test that hits `null` where `!` asserted fails loudly, which is what a test is for.
  '@typescript-eslint/no-non-null-assertion': 'off',
}
