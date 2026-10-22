import type { ESLint, Rule } from 'eslint'
import playwright from 'eslint-plugin-playwright'

import { withoutAutofix } from './without-autofix.ts'

function playwrightRule(name: string): Rule.RuleModule {
  const rule = playwright.rules[name]
  if (rule === undefined) throw new Error(`eslint-plugin-playwright no longer has the rule ${name}`)
  return rule
}

/**
 * Playwright rules re-registered under our own namespace without their autofix, for
 * the same reason as `konceptwareVitest`: a patched `playwright` plugin object would
 * clash with a consumer who registers `eslint-plugin-playwright` themselves.
 */
export const konceptwarePlaywright = {
  meta: { name: '@konceptware/eslint-config/playwright-plugin' },
  rules: {
    /*
     * The fix turns `toBeFalsy()` on `getAttribute`/`textContent`/`inputValue` into a
     * positive `toHaveAttribute`/`toHaveText`/`toHaveValue`, inverting the assertion, and
     * writes `toHaveAttribute(, v)` for a non-literal argument.
     * TODO: drop once upstream negates string-method `toBeFalsy` and copies arguments verbatim.
     */
    'prefer-web-first-assertions': withoutAutofix(playwrightRule('prefer-web-first-assertions')),
    /*
     * For `const c = await l.count()` the fix rewrites the declaration to `const c = l`,
     * breaking every other use of `c`, and an awaited `expect` becomes `await await`.
     * TODO: drop once upstream only fixes an inline `expect(await l.count())`.
     */
    'prefer-to-have-count': withoutAutofix(playwrightRule('prefer-to-have-count')),
    /*
     * Methods are matched by name on any object, so the fix strips the `await` from an
     * async page-object method such as `loginPage.url()`, leaving a floating promise.
     * TODO: drop once upstream checks the receiver is a Playwright `Page` or `Locator`.
     */
    'no-useless-await': withoutAutofix(playwrightRule('no-useless-await')),
    /*
     * The fix appends one entry per reference, so a variable read twice becomes the
     * destructuring `[foo, foo]`, a SyntaxError; a string argument `'abc'` becomes the
     * identifier `abc`.
     * TODO: drop once upstream deduplicates references and keeps existing arguments' source text.
     */
    'no-unsafe-references': withoutAutofix(playwrightRule('no-unsafe-references')),
  },
} satisfies ESLint.Plugin
