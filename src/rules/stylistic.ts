import stylistic from '@stylistic/eslint-plugin'
import type { Linter } from 'eslint'

/*
 * Prettier owns formatting, so every @stylistic rule starts `off`; only the rules
 * below, which Prettier never rewrites (comment style, class-member spacing, JSX
 * tidiness), are turned on. A rule added in a plugin upgrade lands `off` until reviewed.
 */
const allOff: Linter.RulesRecord = Object.fromEntries(
  Object.keys(stylistic.rules).map((rule) => [`@stylistic/${rule}`, 'off']),
)

export const stylisticRules: Linter.RulesRecord = {
  ...allOff,
  '@stylistic/multiline-comment-style': ['error', 'starred-block'],
  '@stylistic/spaced-comment': [
    'error',
    'always',
    // `markers: ['/']` keeps `/// <reference …>` directives valid.
    { line: { markers: ['/'] }, block: { balanced: true } },
  ],
  // `no-inline-comments` already reports every trailing `//` comment this rule would.
  '@stylistic/line-comment-position': 'off',
  '@stylistic/lines-between-class-members': [
    'error',
    'always',
    { exceptAfterSingleLine: true, exceptAfterOverload: true },
  ],
}

/** JSX rules from @stylistic, applied by the `/react` preset on top of `stylisticRules`. */
export const stylisticJsxRules: Linter.RulesRecord = {
  '@stylistic/jsx-self-closing-comp': ['error', { component: true, html: true }],
  '@stylistic/jsx-curly-brace-presence': [
    'error',
    { props: 'never', children: 'never', propElementValues: 'always' },
  ],
  '@stylistic/jsx-pascal-case': [
    'error',
    { allowAllCaps: false, allowLeadingUnderscore: false, allowNamespace: false },
  ],
}
