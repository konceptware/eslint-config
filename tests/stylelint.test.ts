import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'

import config from '../src/stylelint.ts'

async function rulesReported(declaration: string): Promise<string[]> {
  const { results } = await stylelint.lint({ code: `a { ${declaration}; }`, config })
  return (results[0]?.warnings ?? []).map((warning) => warning.rule)
}

describe('stylelint preset', () => {
  it.each([
    'font-size: 1rem',
    'font-size: 0.875rem',
    'font-size: 14px',
    'transition-duration: 200ms',
    'transition-duration: 1s',
    'z-index: 10',
    'z-index: -1',
  ])('rejects `%s`', async (declaration) => {
    await expect(rulesReported(declaration)).resolves.toStrictEqual([
      'declaration-property-value-disallowed-list',
    ])
  })

  it.each([
    'font-size: var(--font-size-sm)',
    'transition-duration: var(--duration-fast)',
    'z-index: var(--z-overlay)',
    'z-index: auto',
  ])('accepts `%s`', async (declaration) => {
    await expect(rulesReported(declaration)).resolves.toStrictEqual([])
  })
})
