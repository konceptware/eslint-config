import vitest from '@vitest/eslint-plugin'
import type { ESLint, Rule } from 'eslint'

import { withoutAutofix } from './without-autofix.ts'

/** Name of the matcher a `prefer-to-be` report points at: `.toBe` or `['toBe']`. */
function matcherName(descriptor: Rule.ReportDescriptor): unknown {
  if (!('node' in descriptor)) return undefined
  const { node } = descriptor
  if ('name' in node) return node.name
  return 'value' in node ? node.value : undefined
}

function vitestRule(name: string): Rule.RuleModule {
  const rule = vitest.rules[name]
  if (rule === undefined) throw new Error(`@vitest/eslint-plugin no longer has the rule ${name}`)
  return rule
}

/**
 * Vitest rules re-registered under our own namespace with a broken autofix removed.
 * A separate namespace instead of a patched `vitest` plugin object: ESLint refuses
 * two different objects under one plugin name, which would break any consumer who
 * registers `@vitest/eslint-plugin` themselves.
 */
export const konceptwareVitest = {
  meta: { name: '@konceptware/eslint-config/vitest-plugin' },
  rules: {
    /*
     * The upstream fix renames `toHaveBeenCalled()` to `toHaveBeenCalledWith()`, which
     * asserts a zero-argument call, so `--fix` turns passing tests red.
     * TODO: drop once `vitest/prefer-called-with` can disable its fix (as
     * `vitest/no-focused-tests` does with `fixable: false`).
     */
    'prefer-called-with': withoutAutofix(vitestRule('prefer-called-with')),
    /*
     * For `expect(x).not.toBe(undefined)` the upstream fix renames the matcher to
     * `toBeDefined` but keeps `.not`, and its next pass turns `.not.toBeDefined()` into
     * `toBeUndefined()`: `--fix` inverts the assertion. That report is the only
     * `useToBeDefined` one whose matcher isn't `toBeUndefined`; every other fix is kept.
     * TODO: drop once upstream removes the `not` modifier in its `undefined`-argument branch.
     */
    'prefer-to-be': withoutAutofix(
      vitestRule('prefer-to-be'),
      (descriptor) =>
        'messageId' in descriptor &&
        descriptor.messageId === 'useToBeDefined' &&
        matcherName(descriptor) !== 'toBeUndefined',
    ),
  },
} satisfies ESLint.Plugin
