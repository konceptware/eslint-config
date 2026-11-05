import stylelint from 'stylelint'
import type { Config } from 'stylelint'
import { describe, expect, it } from 'vitest'

import config, { createStylelintConfig } from '../src/stylelint.ts'

async function rulesReported(declaration: string): Promise<string[]> {
  return await rulesReportedIn(`a { ${declaration}; }`, config)
}

async function rulesReportedIn(code: string, lintConfig: Config): Promise<string[]> {
  const { results } = await stylelint.lint({ code, config: lintConfig })
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

describe(createStylelintConfig, () => {
  const full = createStylelintConfig({ tokenPrefix: 'ie' })

  it.each([
    [':root {\n  --foo: red;\n}\n', 'custom-property-pattern'],
    ['a {\n  z-index: 10;\n}\n', 'declaration-property-value-disallowed-list'],
    // Proves the absolute `extends` path loads `stylelint-config-standard`.
    ['a {\n  color: #ffffff;\n}\n', 'color-hex-length'],
  ])('reports %j under %s', async (code, rule) => {
    await expect(rulesReportedIn(code, full)).resolves.toStrictEqual([rule])
  })

  it.each([
    ':root {\n  --ie-color-accent: red;\n}\n',
    '.fooBar {\n  color: var(--ie-color-accent);\n}\n',
    ':global(.dark) .fooBar {\n  color: red;\n}\n',
  ])('accepts %j', async (code) => {
    await expect(rulesReportedIn(code, full)).resolves.toStrictEqual([])
  })

  it.each(['', 'IE', 'ie.', '1ie', 'ie_x'])('rejects tokenPrefix %j', (tokenPrefix) => {
    expect(() => createStylelintConfig({ tokenPrefix })).toThrow(/tokenPrefix must match/u)
  })
})
