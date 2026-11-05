import { fileURLToPath } from 'node:url'

import type { Config } from 'stylelint'

/**
 * Stylelint config that rejects raw `font-size`, `transition-duration` and `z-index` values, so
 * they come from design tokens (`var(--…)`). Requires `stylelint`. It sets only this rule; the
 * file that defines the tokens turns it off in its own `overrides`.
 */
const stylelintConfig: Config = {
  rules: {
    'declaration-property-value-disallowed-list': {
      'font-size': ['/^[0-9.]+rem$/', '/^[0-9]+px$/'],
      'transition-duration': ['/^[0-9]+m?s$/'],
      'z-index': ['/^-?[0-9]+$/'],
    },
  },
}

const TOKEN_PREFIX = /^[a-z][a-z0-9-]*$/u

/**
 * Full Stylelint config for a CSS-modules UI package: `stylelint-config-standard`, the token rule
 * of the default export, and custom properties named `--<tokenPrefix>-…`.
 *
 * Spread it into your config; a `rules` key of your own replaces ours, so merge with
 * `rules: { ...base.rules, … }` or put per-file changes in `overrides`.
 *
 * @throws {Error} When `tokenPrefix` is not lowercase kebab-case starting with a letter.
 */
export function createStylelintConfig({ tokenPrefix }: { tokenPrefix: string }): Config {
  if (!TOKEN_PREFIX.test(tokenPrefix)) {
    throw new Error(
      `tokenPrefix must match ${TOKEN_PREFIX.source}, got ${JSON.stringify(tokenPrefix)}`,
    )
  }
  return {
    // An absolute path, so Stylelint finds the standard config in this package, not the app's.
    extends: [fileURLToPath(import.meta.resolve('stylelint-config-standard'))],
    rules: {
      ...stylelintConfig.rules,
      'custom-property-pattern': `^${tokenPrefix}-[a-z0-9-]+$`,
      // CSS modules: class names are camelCase JS identifiers, and `:global` escapes the hashing.
      'selector-class-pattern': null,
      'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
      'no-descending-specificity': null,
      'comment-empty-line-before': null,
      'custom-property-empty-line-before': null,
    },
  }
}

export default stylelintConfig
