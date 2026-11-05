import type { ESLint, Linter } from 'eslint'
import playwrightPlugin from 'eslint-plugin-playwright'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import { describe, expect, it } from 'vitest'

import {
  E2E_TEST_FILES,
  STORYBOOK_MAIN_FILES,
  STORY_FILES,
  UNIT_TEST_FILES,
  eslintFor,
  lintSnippet,
  resolvedConfig,
  resolvedRules,
  scoped,
  severity,
} from '../scripts/eslint-for.ts'
import { TS_FILES } from '../src/globs.ts'
import base from '../src/index.ts'
import jest from '../src/jest.ts'
import playwright from '../src/playwright.ts'
import react from '../src/react.ts'
import storybook, { storybookMain } from '../src/storybook.ts'
import test from '../src/test.ts'
import vitest from '../src/vitest.ts'

const all = [
  ...base,
  ...react,
  ...scoped(UNIT_TEST_FILES, test, vitest),
  ...scoped(E2E_TEST_FILES, test, playwright),
  ...scoped(STORY_FILES, test, storybook),
  ...scoped(STORYBOOK_MAIN_FILES, storybookMain),
]
const FILES = [
  'src/non-null.ts',
  'src/non-null.test.ts',
  'src/focused.test.ts',
  'src/missing-deps.tsx',
  'e2e/page.e2e.ts',
  'src/button.stories.tsx',
  '.storybook/main.ts',
]

async function pluginsFor(config: Linter.Config[], file: string): Promise<string[]> {
  const resolved = await resolvedConfig(config, file)
  return Object.keys(resolved.plugins ?? {})
}

describe('presets', () => {
  it.each(FILES)('lints %s without fatal errors', async (file) => {
    const [result] = await eslintFor(all).lintFiles([file])

    expect(result?.messages.filter((message) => message.fatal)).toStrictEqual([])
  })

  it.each([
    { name: 'test', preset: test },
    { name: 'vitest', preset: vitest },
    { name: 'jest', preset: jest },
    { name: 'playwright', preset: playwright },
    { name: 'storybook', preset: storybook },
    { name: 'storybookMain', preset: storybookMain },
  ])('$name sets no file globs beyond the TS-only split', ({ preset }) => {
    const globs = preset.flatMap((block) => [
      ...(block.files ?? []).flat(),
      ...(block.ignores ?? []),
    ])

    expect(globs.filter((glob) => !TS_FILES.includes(glob))).toStrictEqual([])
  })

  it.each([
    { plugin: 'vitest', preset: vitest, hit: 'src/focused.test.ts', miss: 'src/non-null.ts' },
    { plugin: 'jest', preset: jest, hit: 'src/focused.test.ts', miss: 'src/non-null.ts' },
    { plugin: 'playwright', preset: playwright, hit: 'e2e/page.e2e.ts', miss: 'src/non-null.ts' },
    { plugin: 'storybook', preset: storybook, hit: 'e2e/page.e2e.ts', miss: 'src/non-null.ts' },
  ])('$plugin applies only where the consumer scopes it', async ({ plugin, preset, hit, miss }) => {
    const config = [...base, ...scoped(['src/focused.test.ts', 'e2e/**'], preset)]

    await expect(pluginsFor(config, hit)).resolves.toContain(plugin)
    await expect(pluginsFor(config, miss)).resolves.not.toContain(plugin)
  })

  it('@eslint-react runs its JSX rules on .tsx only and its hook rules on .ts too', async () => {
    const tsx = await resolvedRules([...base, ...react], 'src/missing-deps.tsx')
    const ts = await resolvedRules([...base, ...react], 'src/non-null.ts')
    const ids = ['@eslint-react/error-boundaries', '@eslint-react/rules-of-hooks']

    expect(ids.map((id) => [severity(tsx[id]), severity(ts[id])])).toStrictEqual([
      ['error', undefined],
      ['error', 'error'],
    ])
  })

  it('base ignores no build output', async () => {
    await expect(eslintFor(base).isPathIgnored('dist/index.js')).resolves.toBe(false)
  })

  it('parses .cjs files as CommonJS and allows require there', async () => {
    const resolved = await resolvedConfig(base, 'scripts/tool.cjs')

    expect(resolved.languageOptions?.sourceType).toBe('commonjs')
    expect(severity(resolved.rules?.['import-x/no-commonjs'])).toBe('off')
  })

  it('runs the export-existence rules on JS files only', async () => {
    const ids = [
      'import-x/export',
      'import-x/named',
      'import-x/namespace',
      'import-x/no-deprecated',
    ]
    const js = await resolvedRules(base, 'src/lint-text.js')
    const ts = await resolvedRules(base, 'src/lint-text.ts')

    expect(ids.map((id) => [severity(js[id]), severity(ts[id])])).toStrictEqual(
      ids.map(() => ['error', 'off']),
    )
  })

  it('react type-aware rules stay off .jsx files', async () => {
    const code = 'export function Row({ row }) {\n  return <div {...row} />\n}\n'

    await expect(lintSnippet([...base, ...react], code, 'src/lint-jsx.jsx')).resolves.not.toContain(
      '<parse error>',
    )
  })

  it('react-hooks also covers .ts files that define custom hooks', async () => {
    await expect(pluginsFor([...base, ...react], 'src/non-null.ts')).resolves.toContain(
      'react-hooks',
    )
  })

  it('vitest type-aware settings stay off JS test files', async () => {
    const code =
      'import { describe, expect, it } from "vitest"\n\nclass Cart {}\n\ndescribe(Cart, () => {\n  it("exists", () => {\n    expect(new Cart()).toBeInstanceOf(Cart)\n  })\n})\n'

    await expect(
      lintSnippet([...base, ...scoped(UNIT_TEST_FILES, vitest)], code, 'src/lint-js.test.js'),
    ).resolves.not.toContain('<parse error>')
  })

  it('vitest replaces @typescript-eslint/unbound-method in TS test files', async () => {
    const config = [...base, ...scoped(UNIT_TEST_FILES, vitest)]
    const ts = await resolvedRules(config, 'src/non-null.test.ts')
    const js = await resolvedRules(config, 'src/lint-js.test.js')

    // An `'off'` override keeps the options base set, so only the severity is compared.
    expect(severity(ts['@typescript-eslint/unbound-method'])).toBe('off')
    expect(ts['vitest/unbound-method']).toStrictEqual([2, { ignoreStatic: false }])
    expect(severity(js['vitest/unbound-method'])).toBe('off')
  })

  it('jest type-aware rules stay off JS test files', async () => {
    const code =
      'import { expect, it, jest } from "@jest/globals"\n\njest.mock("./a", () => ({}))\n\nit("loads", async () => {\n  await expect(Promise.resolve(1)).resolves.toBe(1)\n})\n'
    const ids = await lintSnippet(
      [...base, ...scoped(UNIT_TEST_FILES, jest)],
      code,
      'src/lint-js.test.js',
    )

    expect(ids).not.toContain('<parse error>')
    expect(ids).not.toContain('jest/no-untyped-mock-factory')
  })

  it('jest replaces @typescript-eslint/unbound-method in TS test files', async () => {
    const rules = await resolvedRules(
      [...base, ...scoped(UNIT_TEST_FILES, jest)],
      'src/non-null.test.ts',
    )

    // An `'off'` override keeps the options base set, so only the severity is compared.
    expect(severity(rules['@typescript-eslint/unbound-method'])).toBe('off')
    expect(rules['jest/unbound-method']).toStrictEqual([2, { ignoreStatic: false }])
  })

  it('storybook runs its story rules on stories only and its addon rule on main only', async () => {
    const stories = await resolvedRules(all, 'src/button.stories.tsx')
    const main = await resolvedRules(all, '.storybook/main.ts')

    expect(severity(stories['storybook/story-exports'])).toBe('error')
    expect(severity(stories['storybook/no-uninstalled-addons'])).toBe('off')
    expect(severity(main['storybook/no-uninstalled-addons'])).toBe('error')
    expect(Object.keys(main).filter((id) => id.startsWith('storybook/'))).toStrictEqual([
      'storybook/no-uninstalled-addons',
    ])
  })

  it('playwright coexists with a consumer registering eslint-plugin-playwright', async () => {
    const consumer = [
      ...base,
      ...scoped(E2E_TEST_FILES, playwright),
      { plugins: { playwright: playwrightPlugin } },
    ]
    const code =
      'import { expect, test } from "@playwright/test"\n\ntest("waits", async ({ page }) => {\n  await page.waitForTimeout(1000)\n\n  await expect(page).toHaveTitle("x")\n})\n'

    await expect(lintSnippet(consumer, code, 'e2e/lint-text.spec.ts')).resolves.toContain(
      'playwright/no-wait-for-timeout',
    )
  })

  it('react coexists with a consumer registering eslint-plugin-react-hooks', async () => {
    const consumer: Linter.Config[] = [
      ...base,
      ...react,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the same cast a consumer needs; `configs.flat` doesn't fit ESLint's `Plugin` type
      { plugins: { 'react-hooks': reactHooksPlugin as unknown as ESLint.Plugin } },
    ]
    const code =
      'import { useEffect } from "react"\n\nexport function Logger({ value }: { value: string }) {\n  useEffect(() => {\n    console.info(value)\n  }, [])\n  return null\n}\n'

    await expect(lintSnippet(consumer, code, 'src/missing-deps.tsx')).resolves.toContain(
      '@eslint-react/exhaustive-deps',
    )
  })
})
