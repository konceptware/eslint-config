import type { Linter } from 'eslint'

/**
 * Explicit decision for every `playwright/*` rule. The plugin keeps its defaults in rule
 * code rather than `meta.defaultOptions`, so every option is spelled out.
 */
export const playwrightRules: Linter.RulesRecord = {
  // The plugin's counterpart of `padding-around-all`; the autofix only inserts blank lines.
  'playwright/consistent-spacing-between-blocks': 'error',
  'playwright/expect-expect': [
    'error',
    /*
     * Patterns are unanchored regexes on the callee's last identifier: `expectValidOrder(page)`
     * counts.
     */
    { assertFunctionNames: [], assertFunctionPatterns: ['^expect'] },
  ],
  // Count-based limits, off like core `max-lines`.
  'playwright/max-expects': 'off',
  'playwright/max-nested-describe': 'off',
  'playwright/missing-playwright-await': [
    'error',
    {
      // Async locator matchers missing from the plugin's built-in list.
      customMatchers: [
        'toMatchAriaSnapshot',
        'toHaveRole',
        'toHaveAccessibleName',
        'toHaveAccessibleDescription',
      ],
      /*
       * `includePageLocatorMethods` would match `fill`/`clear`/`all` on any object (`buf.fill(0)`);
       * in TS,
       * `@typescript-eslint/no-floating-promises` catches un-awaited locator calls by type.
       */
      includePageLocatorMethods: false,
    },
  ],
  // Action timeouts belong in `actionTimeout` in `playwright.config`.
  'playwright/no-action-timeout': ['error', { allow: [] }],
  'playwright/no-commented-out-tests': 'error',
  'playwright/no-conditional-expect': 'error',
  // `??`, `||` and `?.` are exempt by the plugin's design; `if`, ternaries and `&&` are reported.
  'playwright/no-conditional-in-test': 'error',
  'playwright/no-duplicate-hooks': 'error',
  'playwright/no-duplicate-slow': 'error',
  'playwright/no-element-handle': 'error',
  'playwright/no-eval': 'error',
  'playwright/no-export': 'error',
  // Removing `.only` is a suggestion, so fix-on-save can't strip a local focus.
  'playwright/no-focused-test': 'error',
  'playwright/no-force-option': 'error',
  // A `title` attribute is hover-only and often missing; Playwright ranks it last among locators.
  'playwright/no-get-by-title': 'error',
  // Mock restoration and fixture setup are what hooks are for.
  'playwright/no-hooks': 'off',
  'playwright/no-identical-title': 'error',
  // A named constant states why a timeout differs from the config; `defineConfig(…)` is exempt.
  'playwright/no-magic-timeouts': [
    'error',
    { allow: [], minOccurrences: 1, properties: ['timeout'] },
  ],
  'playwright/no-nested-step': 'error',
  'playwright/no-networkidle': 'error',
  // DOM position reorders silently; narrow the locator instead.
  'playwright/no-nth-methods': 'error',
  'playwright/no-page-pause': 'error',
  // A selector held in a variable is not reported, which is the visible opt-out.
  'playwright/no-raw-locators': ['error', { allowed: [] }],
  'playwright/no-restricted-locators': 'off',
  'playwright/no-restricted-matchers': [
    'error',
    // A key matches any run of the chain, so these also cover `.not`, `.soft` and `.resolves`.
    {
      toBeTruthy: 'Use `toBe(true)`; `toBeTruthy()` also passes for `1`, `"x"` and `[]`.',
      toBeFalsy: 'Use `toBe(false)`; `toBeFalsy()` also passes for `0`, `""` and `null`.',
    },
  ],
  'playwright/no-restricted-roles': 'off',
  'playwright/no-skipped-test': [
    'error',
    /*
     * `test.skip(isMobile, 'reason')` states its condition; `disallowFixme` treats `fixme` as a
     * skip.
     */
    { allowConditional: true, disallowFixme: true },
  ],
  'playwright/no-slowed-test': ['error', { allowConditional: true }],
  'playwright/no-standalone-expect': 'error',
  // It bans `` test(`${role} can log in`) ``, Playwright's documented way to parameterise tests.
  'playwright/no-template-literal-title': 'off',
  'playwright/no-test-return-statement': 'error',
  'playwright/no-unnecessary-assertions': 'error',
  // Replaced by `konceptware-playwright/no-unsafe-references`, the same check without its autofix.
  'playwright/no-unsafe-references': 'off',
  'playwright/no-unused-locators': 'error',
  // Replaced by `konceptware-playwright/no-useless-await`, the same check without its autofix.
  'playwright/no-useless-await': 'off',
  'playwright/no-useless-not': 'error',
  'playwright/no-wait-for-navigation': 'error',
  'playwright/no-wait-for-selector': 'error',
  'playwright/no-wait-for-timeout': 'error',
  'playwright/prefer-comparison-matcher': 'error',
  'playwright/prefer-ending-with-an-expect': [
    'error',
    { assertFunctionNames: [], assertFunctionPatterns: ['^expect'] },
  ],
  'playwright/prefer-equality-matcher': 'error',
  'playwright/prefer-hooks-in-order': 'error',
  'playwright/prefer-hooks-on-top': 'error',
  'playwright/prefer-locator': 'error',
  'playwright/prefer-lowercase-title': [
    'error',
    // `describe` titles are often proper names (`Checkout`, `POST /orders`).
    { ignore: ['test.describe'], allowedPrefixes: [], ignoreTopLevelDescribe: false },
  ],
  // Reports a subset of `no-raw-locators`, and its fix drops `{ hasText }` filters.
  'playwright/prefer-native-locators': 'off',
  'playwright/prefer-strict-equal': 'error',
  'playwright/prefer-to-be': 'error',
  'playwright/prefer-to-contain': 'error',
  // Replaced by `konceptware-playwright/prefer-to-have-count`, the same check without its autofix.
  'playwright/prefer-to-have-count': 'off',
  'playwright/prefer-to-have-length': 'error',
  /*
   * Replaced by `konceptware-playwright/prefer-web-first-assertions`, the same check without its
   * autofix.
   */
  'playwright/prefer-web-first-assertions': 'off',
  'playwright/require-annotation-reason': [
    'error',
    { annotations: ['fail', 'fixme', 'skip', 'slow'] },
  ],
  'playwright/require-hook': ['error', { allowedFunctionCalls: [] }],
  /*
   * `expect.soft` everywhere lets a test continue on a broken page; softness is a per-assertion
   * choice.
   */
  'playwright/require-soft-assertions': 'off',
  // Tags select suites per project; a shared preset can't know which ones exist.
  'playwright/require-tags': 'off',
  // Without a `timeout`, `toPass()` retries until the test timeout.
  'playwright/require-to-pass-timeout': 'error',
  'playwright/require-to-throw-message': 'error',
  // The file already groups its tests; a wrapping `describe` repeats the filename.
  'playwright/require-top-level-describe': 'off',
  'playwright/valid-describe-callback': 'error',
  // The second argument is Playwright's custom failure message.
  'playwright/valid-expect': ['error', { minArgs: 1, maxArgs: 2 }],
  'playwright/valid-expect-in-promise': 'error',
  'playwright/valid-test-tags': 'error',
  'playwright/valid-title': [
    'error',
    {
      disallowedWords: ['should'],
      ignoreSpaces: false,
      ignoreTypeOfDescribeName: false,
      ignoreTypeOfStepName: false,
      ignoreTypeOfTestName: false,
    },
  ],
}
