import type { Linter } from 'eslint'

const BOOLEAN_MATCHER_CHAINS = [
  '',
  'not.',
  'resolves.',
  'rejects.',
  'resolves.not.',
  'rejects.not.',
]

/*
 * `jest/no-restricted-matchers` compares a key against the whole modifier + matcher
 * chain, so every prefix needs its own key.
 */
const restrictedBooleanMatchers = Object.fromEntries(
  BOOLEAN_MATCHER_CHAINS.flatMap((prefix) => [
    [
      `${prefix}toBeTruthy`,
      'Use `toBe(true)`; `toBeTruthy()` also passes for `1`, `"x"` and `[]`.',
    ],
    [
      `${prefix}toBeFalsy`,
      'Use `toBe(false)`; `toBeFalsy()` also passes for `0`, `""` and `null`.',
    ],
  ]),
)

/*
 * Explicit decision for every `jest/*` rule. Options mirror `vitestRules` wherever the
 * twin rule behaves the same, and are spelled out in full so a changed plugin default
 * can't change behaviour.
 */
export const jestRules: Linter.RulesRecord = {
  // `it('rejects …')` reads as a sentence.
  'jest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
  'jest/expect-expect': [
    'error',
    // `expect*` also counts assertion helpers named `expectValidOrder(...)`.
    { assertFunctionNames: ['expect*', 'assert'], additionalTestBlockFunctions: [] },
  ],
  // Count-based limits, off like core `max-lines`.
  'jest/max-expects': 'off',
  'jest/max-nested-describe': 'off',
  'jest/no-alias-methods': 'error',
  'jest/no-commented-out-tests': 'error',
  'jest/no-conditional-expect': 'error',
  // `rows[0]?.id` fails the assertion when the row is missing, so it hides no branch.
  'jest/no-conditional-in-test': ['error', { allowOptionalChaining: true }],
  'jest/no-confusing-set-timeout': 'error',
  'jest/no-deprecated-functions': 'error',
  // `it.todo` is not reported; it is the sanctioned placeholder.
  'jest/no-disabled-tests': 'error',
  // A `done` callback turns a thrown error into a timeout; `async` tests report the error itself.
  'jest/no-done-callback': 'error',
  'jest/no-duplicate-hooks': 'error',
  // Type-aware; enabled for TS test files in the `/jest` preset.
  'jest/no-error-equal': 'off',
  // An exporting test file gets imported elsewhere, and its tests run in both files.
  'jest/no-export': 'error',
  // Jest offers removing `.only` as a suggestion only, so fix-on-save can't strip a local focus.
  'jest/no-focused-tests': 'error',
  // Mock restoration and fixture setup are what hooks are for.
  'jest/no-hooks': 'off',
  'jest/no-identical-title': 'error',
  'jest/no-interpolation-in-snapshots': 'error',
  'jest/no-jasmine-globals': 'error',
  // Only inline snapshots are checked unless `.snap` files are linted too.
  'jest/no-large-snapshots': ['error', { maxSize: 50, inlineMaxSize: 50, allowedSnapshots: {} }],
  'jest/no-mocks-import': 'error',
  'jest/no-restricted-jest-methods': 'off',
  // Jest has no `prefer-strict-boolean-matchers`; banning the loose matchers gets the same result.
  'jest/no-restricted-matchers': ['error', restrictedBooleanMatchers],
  'jest/no-standalone-expect': ['error', { additionalTestBlockFunctions: [] }],
  'jest/no-test-prefixes': 'error',
  'jest/no-test-return-statement': 'error',
  // Type-aware; enabled for TS test files in the `/jest` preset.
  'jest/no-unnecessary-assertion': 'off',
  'jest/no-unneeded-async-expect-function': 'error',
  // Its fix inserts `<typeof import(…)>`, a syntax error in JS; enabled for TS test files.
  'jest/no-untyped-mock-factory': 'off',
  'jest/padding-around-all': 'error',
  // Each of these is a subset of `padding-around-all` and would only duplicate its reports.
  'jest/padding-around-after-all-blocks': 'off',
  'jest/padding-around-after-each-blocks': 'off',
  'jest/padding-around-before-all-blocks': 'off',
  'jest/padding-around-before-each-blocks': 'off',
  'jest/padding-around-describe-blocks': 'off',
  'jest/padding-around-expect-groups': 'off',
  'jest/padding-around-test-blocks': 'off',
  /*
   * Unlike `vitest/prefer-called-with`, the jest rule has no autofix, so it needs no
   * `konceptware-*` replacement.
   */
  'jest/prefer-called-with': 'error',
  'jest/prefer-comparison-matcher': 'error',
  'jest/prefer-each': 'error',
  /*
   * A statement after the last assertion is either cleanup, which belongs in `afterEach`
   * because it doesn't run when the assertion fails, or an action nothing checks.
   */
  'jest/prefer-ending-with-an-expect': [
    'error',
    { assertFunctionNames: ['expect*', 'assert'], additionalTestBlockFunctions: [] },
  ],
  'jest/prefer-equality-matcher': 'error',
  'jest/prefer-expect-assertions': [
    'error',
    {
      // Only an `expect` in a loop or callback can silently not run; elsewhere a count is noise.
      onlyFunctionsWithAsyncKeyword: false,
      onlyFunctionsWithExpectInLoop: true,
      onlyFunctionsWithExpectInCallback: true,
    },
  ],
  'jest/prefer-expect-resolves': 'error',
  'jest/prefer-hooks-in-order': 'error',
  'jest/prefer-hooks-on-top': 'error',
  'jest/prefer-importing-jest-globals': [
    'error',
    { types: ['hook', 'describe', 'test', 'expect', 'jest', 'unknown'] },
  ],
  'jest/prefer-jest-mocked': 'error',
  'jest/prefer-lowercase-title': [
    'error',
    // `describe` titles are often proper names (`Button`, `POST /orders`).
    {
      ignore: ['describe'],
      allowedPrefixes: [],
      ignoreTopLevelDescribe: false,
      ignoreTodos: false,
    },
  ],
  'jest/prefer-mock-promise-shorthand': 'error',
  'jest/prefer-mock-return-shorthand': 'error',
  // Without a hint, `.snap` keys are `title 1`, `title 2`, and reordering shuffles them.
  'jest/prefer-snapshot-hint': ['error', 'always'],
  'jest/prefer-spy-on': 'error',
  'jest/prefer-strict-equal': 'error',
  'jest/prefer-to-be': 'error',
  'jest/prefer-to-contain': 'error',
  'jest/prefer-to-have-been-called': 'error',
  'jest/prefer-to-have-been-called-times': 'error',
  'jest/prefer-to-have-length': 'error',
  'jest/prefer-todo': 'error',
  'jest/require-hook': ['error', { allowedFunctionCalls: [] }],
  'jest/require-to-throw-message': 'error',
  // The file already groups its tests; a wrapping `describe` repeats the filename.
  'jest/require-top-level-describe': 'off',
  // Type-aware; enabled for TS test files in the `/jest` preset.
  'jest/unbound-method': 'off',
  'jest/valid-describe-callback': 'error',
  'jest/valid-expect': [
    'error',
    /*
     * `alwaysAwait` bans `return expect(…).resolves` for the same reason as `no-test-return-
     * statement`.
     */
    { alwaysAwait: true, asyncMatchers: ['toReject', 'toResolve'], minArgs: 1, maxArgs: 1 },
  ],
  'jest/valid-expect-in-promise': 'error',
  // Type-aware; enabled for TS test files in the `/jest` preset.
  'jest/valid-expect-with-promise': 'off',
  /*
   * It resolves `jest.mock('x')` without `moduleNameMapper` or tsconfig `paths`, so every
   * aliased path is a false positive; in TS, `no-untyped-mock-factory`'s
   * `typeof import('x')` fails tsc on a wrong path instead.
   */
  'jest/valid-mock-module-path': 'off',
  'jest/valid-title': [
    'error',
    {
      ignoreSpaces: false,
      // Jest's version can't tell a class from any other value, so `describe(Cart)` is reported.
      ignoreTypeOfDescribeName: false,
      ignoreTypeOfTestName: false,
      // `it('should reject …')` says nothing `it('rejects …')` doesn't.
      disallowedWords: ['should'],
    },
  ],
}
