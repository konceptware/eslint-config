import type { ESLint, Rule } from 'eslint'
import storybook from 'eslint-plugin-storybook'

import { withoutAutofix } from './without-autofix.ts'

/**
 * The module itself, not a rebuilt `{ meta, rules }`: ESLint rejects two different objects
 * under one plugin name, which would break consumers who also register this plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- its rules are typed with `@typescript-eslint/utils`' RuleContext, which still declares context methods ESLint 10 removed (`getAncestors`, `parserPath`, …), and its `configs` allow `files: undefined`
export const storybookPlugin = storybook as unknown as ESLint.Plugin

function storybookRule(name: string): Rule.RuleModule {
  const rule = storybookPlugin.rules?.[name]
  if (rule === undefined) throw new Error(`eslint-plugin-storybook no longer has the rule ${name}`)
  return rule
}

/**
 * Storybook rules re-registered under our own namespace without their autofix, for the
 * same reason as `konceptwareVitest`: a patched `storybook` plugin object would clash with
 * a consumer who registers `eslint-plugin-storybook` themselves.
 */
export const konceptwareStorybook = {
  meta: { name: '@konceptware/eslint-config/storybook-plugin' },
  rules: {
    /*
     * The fix swaps any `@testing-library/*` source for `storybook/test` without checking the
     * imported names, so `import { render } from '@testing-library/react'` becomes an import
     * `storybook/test` doesn't export.
     * TODO: drop once upstream fixes only imports whose names `storybook/test` exports.
     */
    'use-storybook-testing-library': withoutAutofix(storybookRule('use-storybook-testing-library')),
  },
} satisfies ESLint.Plugin
