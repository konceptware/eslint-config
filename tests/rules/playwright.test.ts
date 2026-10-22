import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { E2E_TEST_FILES, FIXTURE_DIR, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import playwright from '../../src/playwright.ts'
import test from '../../src/test.ts'

import { describeRules } from './cases.ts'

const config = [...base, ...scoped(E2E_TEST_FILES, test, playwright)]

const FILE = 'e2e/lint-text.spec.ts'

/** `body` as a spec file importing `expect` and `test` from `@playwright/test`. */
function spec(body: string): string {
  return `import { expect, test } from "@playwright/test"\n\n${body}\n`
}

/** `body` wrapped in one test receiving the `page` fixture. */
function inTest(body: string, fixtures = 'page'): string {
  return spec(`test("works", async ({ ${fixtures} }) => {\n${body}\n})`)
}

const BUTTON = 'const button = page.getByRole("button")\n\n'

describeRules(config, FILE, [
  {
    rule: 'playwright/consistent-spacing-between-blocks',
    invalid: [
      spec(
        'test("a", async ({ page }) => {\n  await expect(page).toHaveTitle("a")\n})\ntest("b", async ({ page }) => {\n  await expect(page).toHaveTitle("b")\n})',
      ),
    ],
    valid: [
      spec(
        'test("a", async ({ page }) => {\n  await expect(page).toHaveTitle("a")\n})\n\ntest("b", async ({ page }) => {\n  await expect(page).toHaveTitle("b")\n})',
      ),
    ],
  },
  {
    rule: 'playwright/expect-expect',
    invalid: [inTest('await page.goto("/")')],
    valid: [
      spec(
        'declare function expectHeading(page: unknown): Promise<void>\n\ntest("works", async ({ page }) => {\n  await expectHeading(page)\n})',
      ),
    ],
  },
  {
    rule: 'playwright/max-expects',
    invalid: [],
    valid: [inTest('expect(1).toBe(1)\n'.repeat(6))],
  },
  {
    rule: 'playwright/max-nested-describe',
    invalid: [],
    valid: [
      spec(
        'test.describe("a", () => {\n  test.describe("b", () => {\n    test.describe("c", () => {\n      test.describe("d", () => {\n        test("works", async ({ page }) => {\n          await expect(page).toHaveTitle("x")\n        })\n      })\n    })\n  })\n})',
      ),
    ],
  },
  {
    rule: 'playwright/missing-playwright-await',
    invalid: [
      inTest(`${BUTTON}expect(button).toBeVisible()`),
      // Added through `customMatchers`.
      inTest(`${BUTTON}expect(button).toMatchAriaSnapshot("- button")`),
    ],
    valid: [inTest(`${BUTTON}await expect(button).toBeVisible()`)],
  },
  {
    rule: 'playwright/no-action-timeout',
    invalid: [
      inTest('const SLOW_MS = 5000\n\nawait page.getByRole("button").click({ timeout: SLOW_MS })'),
    ],
    valid: [inTest('await page.getByRole("button").click()')],
  },
  {
    rule: 'playwright/no-commented-out-tests',
    invalid: [spec('// test("works", async () => {})')],
    valid: [spec('// The cases below cover checkout.')],
  },
  {
    rule: 'playwright/no-conditional-expect',
    invalid: [
      inTest(
        `${BUTTON}if (await button.isEnabled()) {\n  await expect(button).toHaveText("Buy")\n}`,
      ),
    ],
    valid: [inTest(`${BUTTON}await expect(button).toHaveText("Buy")`)],
  },
  {
    rule: 'playwright/no-conditional-in-test',
    invalid: [inTest('const url = page.url()\n\nif (url) {\n  await page.goto("/")\n}')],
    // `??` is exempt by the plugin's design.
    valid: [
      inTest(
        'const name = process.env["USER_NAME"] ?? "guest"\n\nawait expect(page).toHaveTitle(name)',
      ),
    ],
  },
  {
    rule: 'playwright/no-duplicate-hooks',
    invalid: [
      spec(
        'test.beforeEach(async ({ page }) => {\n  await page.goto("/")\n})\n\ntest.beforeEach(async ({ page }) => {\n  await page.goto("/cart")\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'playwright/no-duplicate-slow',
    invalid: [
      inTest(
        'test.slow(browserName === "webkit", "slow layout")\ntest.slow(browserName === "firefox", "slow fonts")\n\nawait expect(page).toHaveTitle("x")',
        'page, browserName',
      ),
    ],
    valid: [],
  },
  {
    rule: 'playwright/no-element-handle',
    invalid: [inTest('const handle = await page.$("#cart")\n\nexpect(handle).not.toBeNull()')],
    valid: [],
  },
  {
    rule: 'playwright/no-eval',
    invalid: [
      inTest('const id = await page.$eval("#cart", (el) => el.id)\n\nexpect(id).toBe("cart")'),
    ],
    valid: [],
  },
  {
    rule: 'playwright/no-export',
    invalid: [`export const n = 1\n\n${inTest('await expect(page).toHaveTitle("x")')}`],
    valid: [],
  },
  {
    rule: 'playwright/no-focused-test',
    invalid: [
      spec('test.only("works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})'),
    ],
    valid: [],
  },
  {
    rule: 'playwright/no-force-option',
    invalid: [inTest('await page.getByRole("button").click({ force: true })')],
    valid: [inTest('await page.getByRole("button").click()')],
  },
  {
    rule: 'playwright/no-get-by-title',
    invalid: [inTest('await page.getByTitle("Cart").click()')],
    valid: [inTest('await page.getByRole("link", { name: "Cart" }).click()')],
  },
  {
    rule: 'playwright/no-identical-title',
    invalid: [
      `${inTest('await expect(page).toHaveTitle("x")')}\ntest("works", async ({ page }) => {\n  await expect(page).toHaveTitle("y")\n})\n`,
    ],
    valid: [],
  },
  {
    rule: 'playwright/no-magic-timeouts',
    invalid: [spec('test.setTimeout(60_000)')],
    valid: [spec('const UPLOAD_MS = 60_000\n\ntest.setTimeout(UPLOAD_MS)')],
  },
  {
    rule: 'playwright/no-nested-step',
    invalid: [
      inTest(
        'await test.step("outer", async () => {\n  await test.step("inner", async () => {\n    await page.goto("/")\n  })\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'playwright/no-networkidle',
    invalid: [inTest('await page.waitForLoadState("networkidle")')],
    valid: [],
  },
  {
    rule: 'playwright/no-nth-methods',
    invalid: [inTest('await page.getByRole("row").first().click()')],
    valid: [inTest('await page.getByRole("row", { name: "Order 1" }).click()')],
  },
  {
    rule: 'playwright/no-page-pause',
    invalid: [inTest('await page.pause()')],
    valid: [],
  },
  {
    rule: 'playwright/no-raw-locators',
    invalid: [inTest('await page.locator(".btn-primary").click()')],
    // A selector in a variable is the deliberate opt-out.
    valid: [inTest('const CANVAS = "canvas"\n\nawait page.locator(CANVAS).click()')],
  },
  {
    rule: 'playwright/no-restricted-matchers',
    invalid: [
      inTest('const ok = true\n\nexpect(ok).toBeTruthy()'),
      inTest('const ok = true\n\nexpect.soft(ok).not.toBeFalsy()'),
    ],
    valid: [inTest('const ok = true\n\nexpect(ok).toBe(true)')],
  },
  {
    rule: 'playwright/no-skipped-test',
    invalid: [
      spec('test.skip("works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})'),
      spec('test.fixme("works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})'),
    ],
    valid: [
      inTest(
        'test.skip(isMobile, "no hover on touch screens")\n\nawait expect(page).toHaveTitle("x")',
        'page, isMobile',
      ),
    ],
  },
  {
    rule: 'playwright/no-slowed-test',
    invalid: [inTest('test.slow()\n\nawait expect(page).toHaveTitle("x")')],
    valid: [
      inTest(
        'test.slow(browserName === "webkit", "slow layout")\n\nawait expect(page).toHaveTitle("x")',
        'page, browserName',
      ),
    ],
  },
  {
    rule: 'playwright/no-standalone-expect',
    invalid: [spec('test.describe("a", () => {\n  expect(1).toBe(1)\n})')],
    valid: [],
  },
  {
    rule: 'playwright/no-template-literal-title',
    invalid: [],
    // Playwright's documented way to parameterise tests.
    valid: [
      spec(
        // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
        'for (const role of ["admin", "editor"]) {\n  test(`${role} can log in`, async ({ page }) => {\n    await expect(page).toHaveTitle(role)\n  })\n}',
      ),
    ],
  },
  {
    rule: 'playwright/no-test-return-statement',
    invalid: [spec('test("works", async ({ page }) => {\n  return page.goto("/")\n})')],
    valid: [],
  },
  {
    rule: 'playwright/no-unnecessary-assertions',
    invalid: [inTest(`${BUTTON}expect(button).toBeDefined()`)],
    valid: [inTest(`${BUTTON}await expect(button).toBeVisible()`)],
  },
  {
    rule: 'konceptware-playwright/no-unsafe-references',
    invalid: [
      inTest(
        'const id = "cart"\n\nconst found = await page.evaluate(() => document.getElementById(id) !== null)\n\nexpect(found).toBe(true)',
      ),
    ],
    valid: [
      inTest(
        'const id = "cart"\n\nconst found = await page.evaluate((i) => document.getElementById(i) !== null, id)\n\nexpect(found).toBe(true)',
      ),
    ],
  },
  {
    rule: 'playwright/no-unused-locators',
    invalid: [inTest('page.getByRole("button")\n\nawait expect(page).toHaveTitle("x")')],
    valid: [],
  },
  {
    rule: 'konceptware-playwright/no-useless-await',
    invalid: [
      inTest('const button = await page.getByRole("button")\n\nawait expect(button).toBeVisible()'),
    ],
    valid: [inTest(`${BUTTON}await expect(button).toBeVisible()`)],
  },
  {
    rule: 'playwright/no-useless-not',
    invalid: [inTest(`${BUTTON}await expect(button).not.toBeVisible()`)],
    valid: [inTest(`${BUTTON}await expect(button).toBeHidden()`)],
  },
  {
    rule: 'playwright/no-wait-for-navigation',
    invalid: [inTest('await page.waitForNavigation()')],
    valid: [inTest('await page.waitForURL("/cart")')],
  },
  {
    rule: 'playwright/no-wait-for-selector',
    invalid: [inTest('await page.waitForSelector("#cart")')],
    valid: [],
  },
  {
    rule: 'playwright/no-wait-for-timeout',
    invalid: [inTest('await page.waitForTimeout(1000)')],
    valid: [],
  },
  {
    rule: 'playwright/prefer-comparison-matcher',
    invalid: [inTest('const n = 2\n\nexpect(n > 1).toBe(true)')],
    valid: [inTest('const n = 2\n\nexpect(n).toBeGreaterThan(1)')],
  },
  {
    rule: 'playwright/prefer-ending-with-an-expect',
    invalid: [inTest('await expect(page).toHaveTitle("x")\nawait page.close()')],
    valid: [
      spec(
        'declare function expectHeading(page: unknown): Promise<void>\n\ntest("works", async ({ page }) => {\n  await expectHeading(page)\n})',
      ),
    ],
  },
  {
    rule: 'playwright/prefer-equality-matcher',
    invalid: [inTest('const n = 1\n\nexpect(n === 1).toBe(true)')],
    valid: [inTest('const n = 1\n\nexpect(n).toBe(1)')],
  },
  {
    rule: 'playwright/prefer-hooks-in-order',
    invalid: [
      spec(
        'test.afterEach(async ({ page }) => {\n  await page.close()\n})\n\ntest.beforeEach(async ({ page }) => {\n  await page.goto("/")\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'playwright/prefer-hooks-on-top',
    invalid: [
      `${inTest('await expect(page).toHaveTitle("x")')}\ntest.beforeEach(async ({ page }) => {\n  await page.goto("/")\n})\n`,
    ],
    valid: [],
  },
  {
    rule: 'playwright/prefer-locator',
    invalid: [inTest('await page.click("#cart")')],
    valid: [inTest('await page.getByRole("link", { name: "Cart" }).click()')],
  },
  {
    rule: 'playwright/prefer-lowercase-title',
    invalid: [
      spec('test("Works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})'),
    ],
    valid: [
      spec(
        'test.describe("Checkout", () => {\n  test("works", async ({ page }) => {\n    await expect(page).toHaveTitle("x")\n  })\n})',
      ),
    ],
  },
  {
    rule: 'playwright/prefer-strict-equal',
    invalid: [inTest('expect({ a: 1 }).toEqual({ a: 1 })')],
    valid: [inTest('expect({ a: 1 }).toStrictEqual({ a: 1 })')],
  },
  {
    rule: 'playwright/prefer-to-be',
    invalid: [inTest('expect(1).toStrictEqual(1)')],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'playwright/prefer-to-contain',
    invalid: [inTest('expect([1].includes(1)).toBe(true)')],
    valid: [inTest('expect([1]).toContain(1)')],
  },
  {
    rule: 'konceptware-playwright/prefer-to-have-count',
    invalid: [inTest('expect(await page.getByRole("row").count()).toBe(2)')],
    valid: [inTest('await expect(page.getByRole("row")).toHaveCount(2)')],
  },
  {
    rule: 'playwright/prefer-to-have-length',
    invalid: [inTest('expect([1].length).toBe(1)')],
    valid: [inTest('expect([1]).toHaveLength(1)')],
  },
  {
    rule: 'konceptware-playwright/prefer-web-first-assertions',
    invalid: [inTest(`${BUTTON}expect(await button.isVisible()).toBe(true)`)],
    valid: [inTest(`${BUTTON}await expect(button).toBeVisible()`)],
  },
  {
    rule: 'playwright/require-annotation-reason',
    invalid: [
      inTest('test.skip(isMobile)\n\nawait expect(page).toHaveTitle("x")', 'page, isMobile'),
    ],
    valid: [
      inTest(
        'test.skip(isMobile, "no hover on touch screens")\n\nawait expect(page).toHaveTitle("x")',
        'page, isMobile',
      ),
    ],
  },
  {
    rule: 'playwright/require-hook',
    invalid: [
      spec(
        'declare function seed(): void\n\nseed()\n\ntest("works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})',
      ),
    ],
    valid: [
      spec(
        'declare function seed(): void\n\ntest.beforeAll(seed)\n\ntest("works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})',
      ),
    ],
  },
  {
    rule: 'playwright/require-to-pass-timeout',
    invalid: [
      inTest('await expect(async () => {\n  await expect(page).toHaveTitle("x")\n}).toPass()'),
    ],
    valid: [
      spec(
        'const POLL_MS = 10_000\n\ntest("works", async ({ page }) => {\n  await expect(async () => {\n    await expect(page).toHaveTitle("x")\n  }).toPass({ timeout: POLL_MS })\n})',
      ),
    ],
  },
  {
    rule: 'playwright/require-to-throw-message',
    invalid: [inTest('expect(() => JSON.parse("{")).toThrow()')],
    valid: [inTest('expect(() => JSON.parse("{")).toThrow(SyntaxError)')],
  },
  {
    rule: 'playwright/valid-describe-callback',
    invalid: [
      spec(
        'test.describe("a", async () => {\n  test("works", async ({ page }) => {\n    await expect(page).toHaveTitle("x")\n  })\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'playwright/valid-expect',
    invalid: [inTest('expect(page)')],
    // The second argument is Playwright's custom failure message.
    valid: [inTest(`${BUTTON}await expect(button, "buy button").toHaveText("Buy")`)],
  },
  {
    rule: 'playwright/valid-expect-in-promise',
    invalid: [
      spec(
        'test("works", async ({ page }, testInfo) => {\n  void testInfo\n  page.title().then((title) => {\n    expect(title).toBe("x")\n  })\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'playwright/valid-test-tags',
    invalid: [
      spec(
        'test("works", { tag: "smoke" }, async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})',
      ),
    ],
    valid: [
      spec(
        'test("works", { tag: "@smoke" }, async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})',
      ),
    ],
  },
  {
    rule: 'playwright/valid-title',
    invalid: [
      spec('test("should work", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})'),
      spec('test(" works", async ({ page }) => {\n  await expect(page).toHaveTitle("x")\n})'),
    ],
    valid: [inTest('await expect(page).toHaveTitle("x")')],
  },
])

describe('konceptware-playwright fixes', () => {
  const fixer = new ESLint({
    cwd: FIXTURE_DIR,
    overrideConfigFile: true,
    overrideConfig: config,
    fix: true,
  })

  it.each([
    [
      'konceptware-playwright/prefer-web-first-assertions',
      inTest('expect(await page.getByRole("button").getAttribute("disabled")).toBeFalsy()'),
    ],
    [
      'konceptware-playwright/prefer-to-have-count',
      inTest(
        'const rows = await page.getByRole("row").count()\n\nexpect(rows).toBe(2)\nexpect(rows + 1).toBe(3)',
      ),
    ],
    [
      'konceptware-playwright/no-useless-await',
      spec(
        'declare const loginPage: { url: () => Promise<string> }\n\ntest("works", async () => {\n  const url = await loginPage.url()\n\n  expect(url).toBe("/")\n})',
      ),
    ],
    [
      'konceptware-playwright/no-unsafe-references',
      inTest(
        'const id = "cart"\n\nconst found = await page.evaluate(() => document.getElementById(id) ?? document.getElementById(id))\n\nexpect(found).toBeNull()',
      ),
    ],
  ])('%s reports without rewriting under --fix', async (rule, code) => {
    const [result] = await fixer.lintText(code, { filePath: FILE })

    expect(result?.output).toBeUndefined()
    expect(result?.messages.map((message) => message.ruleId)).toContain(rule)
  })

  it('keeps the semantics-preserving no-useless-not fix', async () => {
    const [result] = await fixer.lintText(
      inTest(`${BUTTON}await expect(button).not.toBeVisible()`),
      {
        filePath: FILE,
      },
    )

    expect(result?.output).toContain('await expect(button).toBeHidden()')
  })
})
