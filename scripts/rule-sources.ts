import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import react from '@eslint-react/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import vitestPlugin from '@vitest/eslint-plugin'
import type { Linter, Rule } from 'eslint'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import { importX } from 'eslint-plugin-import-x'
import jestPlugin from 'eslint-plugin-jest'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
import playwrightPlugin from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import storybookPlugin from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'

import base from '../src/index.ts'
import jest from '../src/jest.ts'
import { konceptwarePlaywright } from '../src/playwright-plugin.ts'
import playwright from '../src/playwright.ts'
import reactPreset from '../src/react.ts'
import { konceptwareStorybook } from '../src/storybook-plugin.ts'
import storybook, { storybookMain } from '../src/storybook.ts'
import { konceptwareVitest } from '../src/vitest-plugin.ts'
import vitest from '../src/vitest.ts'

import {
  E2E_TEST_FILES,
  STORYBOOK_MAIN_FILES,
  STORY_FILES,
  UNIT_TEST_FILES,
  scoped,
} from './eslint-for.ts'

export type RuleSource = {
  /** Key in `REVIEWED_SOURCES` and the `docs/rules/<name>.md` file name. */
  name: string
  prefix: string
  rules: Record<string, Pick<Rule.RuleModule, 'meta'>>
  config: Linter.Config[]
  /**
   * File (relative to the fixture project) whose resolved config must contain every rule of this
   * source.
   */
  sample: string
}

function rulesOf(plugin: object): Record<string, Pick<Rule.RuleModule, 'meta'>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `tseslint.plugin` (`CompatiblePlugin`) and `eslint-plugin-jsx-a11y-x` are typed without `rules`, so their shape is known only at runtime
  return ((plugin as { rules?: unknown }).rules ?? {}) as Record<
    string,
    Pick<Rule.RuleModule, 'meta'>
  >
}

/** `meta.deprecated` is `true` or a `DeprecatedInfo` object on a deprecated rule. */
export function isDeprecated(rule: Pick<Rule.RuleModule, 'meta'>): boolean {
  const deprecated = rule.meta?.deprecated
  return deprecated !== undefined && deprecated !== false
}

export const SOURCES: RuleSource[] = [
  {
    name: 'core',
    prefix: '',
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the only public source of core rule modules (with `meta`) under flat config
    rules: Object.fromEntries(builtinRules),
    config: base,
    sample: 'src/non-null.ts',
  },
  {
    name: 'typescript',
    prefix: '@typescript-eslint/',
    rules: rulesOf(tseslint.plugin),
    config: base,
    sample: 'src/non-null.ts',
  },
  {
    name: 'import',
    prefix: 'import-x/',
    rules: rulesOf(importX),
    config: base,
    sample: 'src/non-null.ts',
  },
  {
    name: 'stylistic',
    prefix: '@stylistic/',
    rules: rulesOf(stylistic),
    // The JSX rules are only turned on by `/react`, so resolve against a .tsx file with it applied.
    config: [...base, ...reactPreset],
    sample: 'src/missing-deps.tsx',
  },
  {
    name: 'eslint-comments',
    prefix: '@eslint-community/eslint-comments/',
    rules: rulesOf(eslintComments),
    config: base,
    sample: 'src/non-null.ts',
  },
  {
    name: 'vitest',
    prefix: 'vitest/',
    rules: rulesOf(vitestPlugin),
    config: scoped(UNIT_TEST_FILES, vitest),
    sample: 'src/non-null.test.ts',
  },
  {
    name: 'konceptware-vitest',
    prefix: 'konceptware-vitest/',
    rules: rulesOf(konceptwareVitest),
    config: scoped(UNIT_TEST_FILES, vitest),
    sample: 'src/non-null.test.ts',
  },
  {
    name: 'jest',
    prefix: 'jest/',
    rules: rulesOf(jestPlugin),
    config: scoped(UNIT_TEST_FILES, jest),
    sample: 'src/non-null.test.ts',
  },
  {
    name: 'playwright',
    prefix: 'playwright/',
    rules: rulesOf(playwrightPlugin),
    config: scoped(E2E_TEST_FILES, playwright),
    sample: 'e2e/page.e2e.ts',
  },
  {
    name: 'konceptware-playwright',
    prefix: 'konceptware-playwright/',
    rules: rulesOf(konceptwarePlaywright),
    config: scoped(E2E_TEST_FILES, playwright),
    sample: 'e2e/page.e2e.ts',
  },
  {
    name: 'storybook',
    prefix: 'storybook/',
    rules: rulesOf(storybookPlugin),
    // Story files decide every rule, `no-uninstalled-addons` as off; `storybookMain` turns it on.
    config: [...scoped(STORY_FILES, storybook), ...scoped(STORYBOOK_MAIN_FILES, storybookMain)],
    sample: 'src/button.stories.tsx',
  },
  {
    name: 'konceptware-storybook',
    prefix: 'konceptware-storybook/',
    rules: rulesOf(konceptwareStorybook),
    config: scoped(STORY_FILES, storybook),
    sample: 'src/button.stories.tsx',
  },
  {
    name: 'react',
    prefix: '@eslint-react/',
    rules: rulesOf(react),
    config: reactPreset,
    sample: 'src/missing-deps.tsx',
  },
  {
    name: 'react-hooks',
    prefix: 'react-hooks/',
    rules: rulesOf(reactHooks),
    config: reactPreset,
    sample: 'src/missing-deps.tsx',
  },
  {
    name: 'jsx-a11y',
    prefix: 'jsx-a11y-x/',
    rules: rulesOf(jsxA11y),
    config: reactPreset,
    sample: 'src/missing-deps.tsx',
  },
]

/**
 * Sources whose every non-deprecated rule has been decided. Once listed, every non-deprecated rule
 * of the source must have an explicit setting in the resolved config, so a plugin
 * upgrade that adds rules fails the coverage test until each new rule is decided.
 */
export const REVIEWED_SOURCES: ReadonlySet<string> = new Set([
  'core',
  'typescript',
  'import',
  'stylistic',
  'eslint-comments',
  'vitest',
  'konceptware-vitest',
  'jest',
  'playwright',
  'konceptware-playwright',
  'storybook',
  'konceptware-storybook',
  'react',
  'react-hooks',
  'jsx-a11y',
])
