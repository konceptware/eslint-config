import type { Linter } from 'eslint'
import playwright from 'eslint-plugin-playwright'

import { konceptwarePlaywright } from './playwright-plugin.ts'
import { playwrightRules } from './rules/playwright.ts'

/**
 * Playwright rules. Requires `eslint-plugin-playwright`. Sets no e2e-file globs: scope
 * it with `{ files, extends: [playwright] }`.
 */
const playwrightConfig: Linter.Config[] = [
  {
    name: 'konceptware/playwright',
    plugins: { playwright, 'konceptware-playwright': konceptwarePlaywright },
    rules: {
      ...playwrightRules,
      'konceptware-playwright/no-unsafe-references': 'error',
      'konceptware-playwright/no-useless-await': 'error',
      'konceptware-playwright/prefer-to-have-count': 'error',
      'konceptware-playwright/prefer-web-first-assertions': 'error',
    },
  },
]

export default playwrightConfig
