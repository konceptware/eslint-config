import type { Linter } from 'eslint'

import { storybookMainRules, storybookRules } from './rules/storybook.ts'
import { konceptwareStorybook, storybookPlugin } from './storybook-plugin.ts'

/**
 * Storybook rules for story files. Requires `eslint-plugin-storybook`. Sets no story-file
 * globs: scope it with `{ files, extends: [storybook] }`.
 */
const storybookConfig: Linter.Config[] = [
  {
    name: 'konceptware/storybook',
    plugins: { storybook: storybookPlugin, 'konceptware-storybook': konceptwareStorybook },
    rules: {
      ...storybookRules,
      'konceptware-storybook/use-storybook-testing-library': 'error',
    },
  },
]

/**
 * Rules for `.storybook/main.*`, separate because the story rules would report a file
 * without stories. Scope it with `{ files, extends: [storybookMain] }`.
 */
export const storybookMain: Linter.Config[] = [
  {
    name: 'konceptware/storybook/main',
    plugins: { storybook: storybookPlugin },
    rules: storybookMainRules,
  },
]

export default storybookConfig
