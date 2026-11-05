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

export default stylelintConfig
