import stylistic from '@stylistic/eslint-plugin'
import prettierConflicts from 'eslint-config-prettier'
import { describe, expect, it } from 'vitest'

import {
  E2E_TEST_FILES,
  STORYBOOK_MAIN_FILES,
  STORY_FILES,
  UNIT_TEST_FILES,
  resolvedConfig,
  scoped,
} from '../scripts/eslint-for.ts'
import base from '../src/index.ts'
import jest from '../src/jest.ts'
import playwright from '../src/playwright.ts'
import react from '../src/react.ts'
import storybook, { storybookMain } from '../src/storybook.ts'
import test from '../src/test.ts'
import vitest from '../src/vitest.ts'

/*
 * eslint-config-prettier lists these as needing care rather than always conflicting.
 * `curly: multi-or-nest` depends on where Prettier breaks lines, but the two converge: when
 * Prettier wraps a one-statement body, `eslint --fix` adds braces and the next Prettier
 * run keeps them; a bare one-liner stays one line whether Prettier keeps it beside the
 * condition or moves it below. `no-unexpected-multiline` only flags code Prettier would never produce.
 */
const PRETTIER_SAFE = new Set(['curly', 'no-unexpected-multiline'])

// Line-break rules newer than eslint-config-prettier's list; Prettier owns line breaks, so they conflict too.
const UNLISTED_CONFLICTS = [
  '@stylistic/curly-newline',
  '@stylistic/jsx-function-call-newline',
  '@stylistic/exp-jsx-props-style',
  '@stylistic/exp-list-style',
]

const FILES = [
  'src/non-null.ts',
  'src/non-null.test.ts',
  'src/missing-deps.tsx',
  'e2e/page.e2e.ts',
  'src/button.stories.tsx',
  '.storybook/main.ts',
]

describe('prettier compatibility', () => {
  it('lists only rules that exist in @stylistic', () => {
    const known = Object.keys(stylistic.rules).map((rule) => `@stylistic/${rule}`)

    expect(UNLISTED_CONFLICTS.filter((id) => !known.includes(id))).toStrictEqual([])
  })

  it.each(FILES)('%s enables no rule that conflicts with Prettier', async (file) => {
    const config = [
      ...base,
      ...react,
      ...scoped(UNIT_TEST_FILES, test, vitest, jest),
      ...scoped(E2E_TEST_FILES, test, playwright),
      ...scoped(STORY_FILES, test, storybook),
      ...scoped(STORYBOOK_MAIN_FILES, storybookMain),
    ]
    const resolved = await resolvedConfig(config, file)
    const enabled = Object.entries(resolved.rules ?? {})
      .filter(([, entry]) => (Array.isArray(entry) ? entry[0] : entry) !== 0)
      .map(([id]) => id)
    const conflicts = new Set([...Object.keys(prettierConflicts.rules), ...UNLISTED_CONFLICTS])

    expect(enabled.filter((id) => conflicts.has(id) && !PRETTIER_SAFE.has(id))).toStrictEqual([])
  })
})
