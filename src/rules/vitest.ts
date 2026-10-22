import type { Linter } from 'eslint'

/**
 * Explicit decision for every `vitest/*` rule. Every option is spelled out so a changed
 * plugin default can't change behaviour.
 */
export const vitestRules: Linter.RulesRecord = {
  'vitest/consistent-each-for': [
    'error',
    // `.for` only adds test-context access in concurrent tests; `.each` is the form Jest shares.
    { test: 'each', it: 'each', describe: 'each', suite: 'each' },
  ],
  'vitest/consistent-test-filename': [
    'error',
    {
      // `.spec` is left to Playwright; `[cm]?` covers `.mts`/`.cts`, which the defaults skip.
      pattern: String.raw`.*\.test\.[cm]?[jt]sx?$`,
      allTestPattern: String.raw`.*\.(test|spec)\.[cm]?[jt]sx?$`,
    },
  ],
  // `it('rejects …')` reads as a sentence; with both keys equal the rule also checks the import.
  'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
  'vitest/consistent-vitest-vi': ['error', { fn: 'vi' }],
  'vitest/expect-expect': [
    'error',
    // `expect*` also counts assertion helpers named `expectValidOrder(...)`.
    { assertFunctionNames: ['expect*', 'assert'], additionalTestBlockFunctions: [] },
  ],
  // `vi.mock` is hoisted to the top of the file wherever it is written.
  'vitest/hoisted-apis-on-top': 'error',
  // Count-based limits, off like core `max-lines`.
  'vitest/max-expects': 'off',
  'vitest/max-nested-describe': 'off',
  'vitest/no-alias-methods': 'error',
  'vitest/no-commented-out-tests': 'error',
  // No `expect.assertions` escape: write the test so the expect always runs (`rejects`, `.each`).
  'vitest/no-conditional-expect': ['error', { expectAssertions: false }],
  'vitest/no-conditional-in-test': 'error',
  // A test defined inside an `if` vanishes from the report; `it.skipIf` shows up as skipped.
  'vitest/no-conditional-tests': 'error',
  // `it.todo` and `it.skipIf(cond)` are not reported; they are the sanctioned forms.
  'vitest/no-disabled-tests': 'error',
  'vitest/no-duplicate-hooks': 'error',
  // Fix-on-save would strip an `.only` added locally to focus a test.
  'vitest/no-focused-tests': ['error', { fixable: false }],
  // Mock restoration and fixture setup are what hooks are for.
  'vitest/no-hooks': 'off',
  'vitest/no-identical-title': 'error',
  'vitest/no-import-node-test': 'error',
  // Opposite of `prefer-importing-vitest-globals`; tests import from `vitest` explicitly.
  'vitest/no-importing-vitest-globals': 'off',
  'vitest/no-interpolation-in-snapshots': 'error',
  // Only inline snapshots are checked unless `.snap` files are linted too.
  'vitest/no-large-snapshots': ['error', { maxSize: 50, inlineMaxSize: 50, allowedSnapshots: {} }],
  'vitest/no-mocks-import': 'error',
  // Every matcher worth banning has a dedicated rule with a fix.
  'vitest/no-restricted-matchers': 'off',
  'vitest/no-restricted-vi-methods': 'off',
  'vitest/no-standalone-expect': ['error', { additionalTestBlockFunctions: [] }],
  'vitest/no-test-prefixes': 'error',
  'vitest/no-test-return-statement': 'error',
  'vitest/no-unneeded-async-expect-function': 'error',
  'vitest/padding-around-all': 'error',
  // Each of these is a subset of `padding-around-all` and would only duplicate its reports.
  'vitest/padding-around-after-all-blocks': 'off',
  'vitest/padding-around-after-each-blocks': 'off',
  'vitest/padding-around-before-all-blocks': 'off',
  'vitest/padding-around-before-each-blocks': 'off',
  'vitest/padding-around-describe-blocks': 'off',
  'vitest/padding-around-expect-groups': 'off',
  'vitest/padding-around-test-blocks': 'off',
  'vitest/prefer-called-exactly-once-with': 'error',
  'vitest/prefer-called-once': 'error',
  // Its fix is the inverse of `prefer-called-once`'s.
  'vitest/prefer-called-times': 'off',
  // Replaced by `konceptware-vitest/prefer-called-with`, the same check without the autofix.
  'vitest/prefer-called-with': 'off',
  'vitest/prefer-comparison-matcher': 'error',
  'vitest/prefer-describe-function-title': 'error',
  'vitest/prefer-each': 'error',
  'vitest/prefer-equality-matcher': 'error',
  'vitest/prefer-expect-assertions': [
    'error',
    {
      // Only an `expect` in a loop or callback can silently not run; elsewhere a count is noise.
      onlyFunctionsWithAsyncKeyword: false,
      onlyFunctionsWithExpectInLoop: true,
      onlyFunctionsWithExpectInCallback: true,
      // `hasAssertions()` proves one ran, not that all of them did.
      disallowHasAssertions: true,
    },
  ],
  'vitest/prefer-expect-resolves': 'error',
  'vitest/prefer-expect-type-of': 'error',
  'vitest/prefer-hooks-in-order': 'error',
  'vitest/prefer-hooks-on-top': 'error',
  // `vi.mock(import('./db'), …)` type-checks the factory against the module and follows renames.
  'vitest/prefer-import-in-mock': ['error', { fixable: true }],
  'vitest/prefer-importing-vitest-globals': 'error',
  'vitest/prefer-lowercase-title': [
    'error',
    {
      // `describe` titles are often proper names (`Button`, `POST /orders`).
      ignore: ['describe'],
      allowedPrefixes: [],
      ignoreTopLevelDescribe: false,
      lowercaseFirstCharacterOnly: true,
    },
  ],
  'vitest/prefer-mock-promise-shorthand': 'error',
  'vitest/prefer-mock-return-shorthand': 'error',
  // Without a hint, `.snap` keys are `title 1`, `title 2`, and reordering shuffles them.
  'vitest/prefer-snapshot-hint': ['error', 'always'],
  'vitest/prefer-spy-on': 'error',
  'vitest/prefer-strict-boolean-matchers': 'error',
  'vitest/prefer-strict-equal': 'error',
  /*
   * Replaced by `konceptware-vitest/prefer-to-be`, the same check without the fix that inverts
   * `.not`.
   */
  'vitest/prefer-to-be': 'off',
  // Both undo `prefer-strict-boolean-matchers`: `toBeTruthy()` passes for `1`, `'x'` and `[]`.
  'vitest/prefer-to-be-falsy': 'off',
  'vitest/prefer-to-be-truthy': 'off',
  'vitest/prefer-to-be-object': 'error',
  'vitest/prefer-to-contain': 'error',
  'vitest/prefer-to-have-been-called-times': 'error',
  'vitest/prefer-to-have-length': 'error',
  'vitest/prefer-todo': 'error',
  'vitest/prefer-vi-mocked': 'error',
  'vitest/require-awaited-expect-poll': 'error',
  'vitest/require-hook': ['error', { allowedFunctionCalls: [] }],
  'vitest/require-local-test-context-for-concurrent-snapshots': 'error',
  /*
   * Off: it demands `vi.fn<() => number>(() => 1)` even where the implementation already types the
   * mock.
   */
  'vitest/require-mock-type-parameters': 'off',
  // Timeouts belong in `testTimeout` in the vitest config, which this rule can't read.
  'vitest/require-test-timeout': 'off',
  'vitest/require-to-throw-message': 'error',
  // The file already groups its tests; a wrapping `describe` repeats the filename.
  'vitest/require-top-level-describe': 'off',
  // Type-aware; enabled for TS test files in the `/vitest` preset.
  'vitest/unbound-method': 'off',
  'vitest/valid-describe-callback': 'error',
  'vitest/valid-expect': [
    'error',
    /*
     * `alwaysAwait` bans `return expect(…).resolves` for the same reason as `no-test-return-
     * statement`.
     */
    { alwaysAwait: true, asyncMatchers: ['toReject', 'toResolve'], minArgs: 1, maxArgs: 1 },
  ],
  'vitest/valid-expect-in-promise': 'error',
  'vitest/valid-title': [
    'error',
    // `it('should reject …')` says nothing `it('rejects …')` doesn't.
    { ignoreTypeOfDescribeName: false, allowArguments: false, disallowedWords: ['should'] },
  ],
  // Contradicts `prefer-todo`; `it.todo` is the sanctioned placeholder.
  'vitest/warn-todo': 'off',
}
