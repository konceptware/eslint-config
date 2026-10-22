import type { Linter } from 'eslint'

/** Explicit decision for every `@eslint-community/eslint-comments/*` rule. */
export const eslintCommentsRules: Linter.RulesRecord = {
  // A whole-file disable belongs in a `files` override in eslint.config, where it is visible.
  '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
  '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
  '@eslint-community/eslint-comments/no-duplicate-disable': 'error',
  // Off: no rule is worth shielding from inline disables yet.
  '@eslint-community/eslint-comments/no-restricted-disable': 'off',
  '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
  /*
   * `linterOptions.reportUnusedDisableDirectives` in the base preset reports unused disables and
   * enables, with autofix.
   */
  '@eslint-community/eslint-comments/no-unused-disable': 'off',
  '@eslint-community/eslint-comments/no-unused-enable': 'off',
  // Suppressions stay allowed; `require-description` makes each one justify itself.
  '@eslint-community/eslint-comments/no-use': 'off',
  '@eslint-community/eslint-comments/require-description': ['error', { ignore: ['eslint-enable'] }],
}
