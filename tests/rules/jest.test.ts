import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { FIXTURE_DIR, UNIT_TEST_FILES, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import jest from '../../src/jest.ts'
import test from '../../src/test.ts'

import { describeRules } from './cases.ts'

const config = [...base, ...scoped(UNIT_TEST_FILES, test, jest)]

/** `body` as a test file importing `names` from `@jest/globals`. */
function spec(names: string, body: string): string {
  return `import { ${names} } from "@jest/globals"\n\n${body}\n`
}

/** `body` wrapped in one `it` block. */
function inTest(body: string, names = 'expect, it'): string {
  return spec(names, `it("works", () => {\n${body}\n})`)
}

const INLINE_SNAPSHOT_LINES = 52

const LOAD = 'declare function load(): Promise<number>\n\n'

const REPO = 'class Repo {\n  name = "r"\n  label(): string {\n    return this.name\n  }\n}\n\n'

describeRules(config, 'src/lint-text.test.ts', [
  {
    rule: 'jest/consistent-test-it',
    invalid: [spec('expect, test', 'test("adds", () => {\n  expect(1).toBe(1)\n})')],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'jest/expect-expect',
    invalid: [inTest('console.info(1)')],
    valid: [
      spec(
        'expect, it',
        'function expectPositive(n: number): void {\n  expect(n).toBeGreaterThan(0)\n}\n\nit("is positive", () => {\n  expectPositive(1)\n})',
      ),
    ],
  },
  {
    rule: 'jest/max-expects',
    invalid: [],
    valid: [inTest(`const n = 1\n\n${'expect(n).toBe(1)\n'.repeat(6)}`)],
  },
  {
    rule: 'jest/max-nested-describe',
    invalid: [],
    valid: [
      spec(
        'describe, expect, it',
        'describe("a", () => {\n  describe("b", () => {\n    describe("c", () => {\n      describe("d", () => {\n        it("works", () => {\n          expect(1).toBe(1)\n        })\n      })\n    })\n  })\n})',
      ),
      // Unlike vitest's, jest's count includes `describe.each`.
      spec(
        'describe, expect, it',
        'describe("a", () => {\n  describe("b", () => {\n    describe("c", () => {\n      describe.each([1])("%s", (n) => {\n        it("works", () => {\n          expect(n).toBe(1)\n        })\n      })\n    })\n  })\n})',
      ),
    ],
  },
  {
    rule: 'jest/no-alias-methods',
    invalid: [inTest('expect(() => 1).toThrowError("x")')],
    valid: [inTest('expect(() => 1).toThrow("x")')],
  },
  {
    rule: 'jest/no-commented-out-tests',
    invalid: [spec('expect, it', '// it("works", () => {})')],
    valid: [spec('expect, it', '// The cases below cover rounding.')],
  },
  {
    rule: 'jest/no-conditional-expect',
    invalid: [
      inTest('const n = Math.random()\n\nif (n > 0.5) {\n  expect(n).toBeGreaterThan(0.5)\n}'),
    ],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'jest/no-conditional-in-test',
    invalid: [
      inTest('const n = Math.random()\n\nif (n > 0.5) {\n  expect(n).toBeGreaterThan(0.5)\n}'),
      spec(
        'expect, it',
        'declare const v: number | undefined\n\nit("works", () => {\n  expect(v ?? 0).toBe(0)\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it',
        'declare const rows: { id: number }[]\n\nit("works", () => {\n  expect(rows[0]?.id).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'jest/no-confusing-set-timeout',
    invalid: [`${inTest('expect(1).toBe(1)', 'expect, it, jest')}\njest.setTimeout(1000)\n`],
    valid: [
      spec(
        'expect, it, jest',
        'jest.setTimeout(1000)\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'jest/no-deprecated-functions',
    invalid: [
      spec(
        'expect, it, jest',
        'const helpers = jest.genMockFromModule("./helpers")\n\nit("works", () => {\n  expect(helpers).toBeDefined()\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it, jest',
        'const helpers = jest.createMockFromModule("./helpers")\n\nit("works", () => {\n  expect(helpers).toBeDefined()\n})',
      ),
    ],
  },
  {
    rule: 'jest/no-disabled-tests',
    invalid: [
      spec('expect, it', 'it.skip("works", () => {\n  expect(1).toBe(1)\n})'),
      spec('it', 'it("works")'),
    ],
    valid: [spec('it', 'it.todo("rounds half up")')],
  },
  {
    rule: 'jest/no-done-callback',
    invalid: [spec('expect, it', 'it("works", (done) => {\n  expect(1).toBe(1)\n  done()\n})')],
    valid: [
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})`,
      ),
    ],
  },
  {
    rule: 'jest/no-duplicate-hooks',
    invalid: [
      spec(
        'beforeEach, expect, it, jest',
        'beforeEach(() => {\n  jest.useFakeTimers()\n})\n\nbeforeEach(() => {\n  jest.clearAllMocks()\n})\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'jest/no-error-equal',
    invalid: [
      inTest('const error = new Error("x")\n\nexpect(error).toStrictEqual(new Error("x"))'),
    ],
    valid: [inTest('expect(() => JSON.parse("{")).toThrow(SyntaxError)')],
  },
  {
    rule: 'jest/no-export',
    invalid: [`export const n = 1\n\n${inTest('expect(n).toBe(1)')}`],
    valid: [],
  },
  {
    rule: 'jest/no-focused-tests',
    invalid: [spec('expect, it', 'it.only("works", () => {\n  expect(1).toBe(1)\n})')],
    valid: [],
  },
  {
    rule: 'jest/no-identical-title',
    invalid: [`${inTest('expect(1).toBe(1)')}\nit("works", () => {\n  expect(2).toBe(2)\n})\n`],
    valid: [],
  },
  {
    rule: 'jest/no-interpolation-in-snapshots',
    // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
    invalid: [inTest('const n = 1\n\nexpect({ n }).toMatchInlineSnapshot(`{ "n": ${n} }`)')],
    valid: [inTest('expect({ n: 1 }).toMatchInlineSnapshot(`{ "n": 1 }`)')],
  },
  {
    rule: 'jest/no-jasmine-globals',
    invalid: [inTest('expect(1).toStrictEqual(jasmine.any(Number))')],
    valid: [inTest('expect(1).toStrictEqual(expect.any(Number))')],
  },
  {
    rule: 'jest/no-large-snapshots',
    invalid: [
      inTest(`expect("a").toMatchInlineSnapshot(\`\n${'x\n'.repeat(INLINE_SNAPSHOT_LINES)}\`)`),
    ],
    valid: [inTest('expect("a").toMatchInlineSnapshot(`"a"`)')],
  },
  {
    rule: 'jest/no-mocks-import',
    invalid: [
      spec(
        'expect, it',
        'import { db } from "./__mocks__/db"\n\nit("works", () => {\n  expect(db).toBe(1)\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'jest/no-restricted-matchers',
    invalid: [
      inTest('const ok = true\n\nexpect(ok).toBeTruthy()'),
      inTest('const ok = true\n\nexpect(ok).not.toBeFalsy()'),
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).resolves.toBeTruthy()\n})`,
      ),
    ],
    valid: [inTest('const ok = true\n\nexpect(ok).toBe(true)')],
  },
  {
    rule: 'jest/no-standalone-expect',
    invalid: [spec('describe, expect', 'describe("a", () => {\n  expect(1).toBe(1)\n})')],
    valid: [spec('expect', 'expect.extend({})')],
  },
  {
    rule: 'jest/no-test-prefixes',
    invalid: [spec('expect, xit', 'xit("works", () => {\n  expect(1).toBe(1)\n})')],
    valid: [],
  },
  {
    rule: 'jest/no-test-return-statement',
    invalid: [spec('it', 'it("works", () => {\n  return Promise.resolve(1)\n})')],
    valid: [],
  },
  {
    rule: 'jest/no-unnecessary-assertion',
    invalid: [inTest('const n = 1\n\nexpect(n).not.toBeNull()')],
    valid: [
      spec(
        'expect, it',
        'declare const v: string | null\n\nit("works", () => {\n  expect(v).toBeNull()\n})',
      ),
    ],
  },
  {
    rule: 'jest/no-unneeded-async-expect-function',
    // Unlike vitest's, jest's version skips the concise `async () => await load()`.
    invalid: [
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(async () => {\n    await load()\n  }).rejects.toThrow("x")\n})`,
      ),
    ],
    valid: [
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).rejects.toThrow("x")\n})`,
      ),
    ],
  },
  {
    rule: 'jest/no-untyped-mock-factory',
    invalid: [
      spec(
        'expect, it, jest',
        'jest.mock("./helpers", () => ({ parse: jest.fn() }))\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it, jest',
        'jest.mock<typeof import("./helpers")>("./helpers", () => ({ parse: jest.fn() }))\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
      // Automocking takes no factory to type.
      spec(
        'expect, it, jest',
        'jest.mock("./helpers")\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'jest/padding-around-all',
    invalid: [
      spec(
        'expect, it',
        'it("a", () => {\n  expect(1).toBe(1)\n})\nit("b", () => {\n  expect(2).toBe(2)\n})',
      ),
      inTest('const n = 1\nexpect(n).toBe(1)'),
    ],
    // Consecutive expects form one group.
    valid: [inTest('const n = 1\n\nexpect(n).toBe(1)\nexpect(n + 1).toBe(2)')],
  },
  {
    rule: 'jest/prefer-called-with',
    invalid: [inTest('const f = jest.fn()\n\nexpect(f).toHaveBeenCalled()', 'expect, it, jest')],
    valid: [inTest('const f = jest.fn()\n\nexpect(f).not.toHaveBeenCalled()', 'expect, it, jest')],
  },
  {
    rule: 'jest/prefer-comparison-matcher',
    invalid: [inTest('const n = 2\n\nexpect(n > 1).toBe(true)')],
    valid: [inTest('const n = 2\n\nexpect(n).toBeGreaterThan(1)')],
  },
  {
    rule: 'jest/prefer-each',
    invalid: [
      spec(
        'expect, it',
        'for (const n of [1, 2]) {\n  it("is positive", () => {\n    expect(n).toBeGreaterThan(0)\n  })\n}',
      ),
    ],
    valid: [
      spec(
        'expect, it',
        'it.each([1, 2])("%s is positive", (n) => {\n  expect(n).toBeGreaterThan(0)\n})',
      ),
    ],
  },
  {
    rule: 'jest/prefer-ending-with-an-expect',
    invalid: [inTest('expect(1).toBe(1)\nconsole.info("done")')],
    valid: [
      spec(
        'expect, it',
        'function expectPositive(n: number): void {\n  expect(n).toBeGreaterThan(0)\n}\n\nit("is positive", () => {\n  expectPositive(1)\n})',
      ),
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})`,
      ),
    ],
  },
  {
    rule: 'jest/prefer-equality-matcher',
    invalid: [inTest('const n = 1\n\nexpect(n === 1).toBe(true)')],
    valid: [inTest('const n = 1\n\nexpect(n).toBe(1)')],
  },
  {
    rule: 'jest/prefer-expect-assertions',
    invalid: [inTest('for (const n of [1, 2]) {\n  expect(n).toBeGreaterThan(0)\n}')],
    valid: [
      inTest(
        'expect.assertions(2)\n\nfor (const n of [1, 2]) {\n  expect(n).toBeGreaterThan(0)\n}',
      ),
      // A straight-line test needs no count.
      inTest('expect(1).toBe(1)'),
    ],
  },
  {
    rule: 'jest/prefer-expect-resolves',
    invalid: [
      spec('expect, it', `${LOAD}it("works", async () => {\n  expect(await load()).toBe(1)\n})`),
    ],
    valid: [
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})`,
      ),
    ],
  },
  {
    rule: 'jest/prefer-hooks-in-order',
    invalid: [
      spec(
        'afterEach, beforeEach, expect, it, jest',
        'afterEach(() => {\n  jest.restoreAllMocks()\n})\n\nbeforeEach(() => {\n  jest.useFakeTimers()\n})\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'jest/prefer-hooks-on-top',
    invalid: [
      spec(
        'afterEach, expect, it, jest',
        'it("works", () => {\n  expect(1).toBe(1)\n})\n\nafterEach(() => {\n  jest.restoreAllMocks()\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'jest/prefer-importing-jest-globals',
    invalid: [
      'import { expect } from "@jest/globals"\n\nit("works", () => {\n  expect(1).toBe(1)\n})\n',
    ],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'jest/prefer-jest-mocked',
    invalid: [
      spec(
        'expect, it, jest',
        'declare function count(): number\n\nit("works", () => {\n  expect(count as jest.Mock).not.toHaveBeenCalled()\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it, jest',
        'declare function count(): number\n\nit("works", () => {\n  expect(jest.mocked(count)).not.toHaveBeenCalled()\n})',
      ),
    ],
  },
  {
    rule: 'jest/prefer-lowercase-title',
    invalid: [
      spec('expect, it', 'it("Works", () => {\n  expect(1).toBe(1)\n})'),
      spec('it', 'it.todo("Rounds half up")'),
    ],
    valid: [
      spec(
        'describe, expect, it',
        'describe("Button", () => {\n  it("renders", () => {\n    expect(1).toBe(1)\n  })\n})',
      ),
    ],
  },
  {
    rule: 'jest/prefer-mock-promise-shorthand',
    invalid: [
      inTest(
        'const f = jest.fn().mockImplementation(() => Promise.resolve(1))\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, jest',
      ),
    ],
    valid: [
      inTest(
        'const f = jest.fn().mockResolvedValue(1)\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, jest',
      ),
    ],
  },
  {
    rule: 'jest/prefer-mock-return-shorthand',
    invalid: [
      inTest(
        'const f = jest.fn().mockImplementation(() => 1)\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, jest',
      ),
    ],
    valid: [
      inTest(
        'const f = jest.fn().mockReturnValue(1)\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, jest',
      ),
    ],
  },
  {
    rule: 'jest/prefer-snapshot-hint',
    invalid: [inTest('expect({ a: 1 }).toMatchSnapshot()')],
    valid: [inTest('expect({ a: 1 }).toMatchSnapshot("shape")')],
  },
  {
    rule: 'jest/prefer-spy-on',
    invalid: [
      inTest(
        'const o = { f: (): number => 1 }\n\no.f = jest.fn()\n\nexpect(o.f).not.toHaveBeenCalled()',
        'expect, it, jest',
      ),
    ],
    valid: [
      inTest(
        'const o = { f: (): number => 1 }\nconst spy = jest.spyOn(o, "f")\n\nexpect(spy).not.toHaveBeenCalled()',
        'expect, it, jest',
      ),
    ],
  },
  {
    rule: 'jest/prefer-strict-equal',
    invalid: [inTest('expect({ a: 1 }).toEqual({ a: 1 })')],
    valid: [inTest('expect({ a: 1 }).toStrictEqual({ a: 1 })')],
  },
  {
    rule: 'jest/prefer-to-be',
    invalid: [
      inTest('expect(1).toStrictEqual(1)'),
      inTest('const v = null\n\nexpect(v).toBe(null)'),
    ],
    valid: [inTest('const v = null\n\nexpect(v).toBeNull()')],
  },
  {
    rule: 'jest/prefer-to-contain',
    invalid: [inTest('expect([1].includes(1)).toBe(true)')],
    valid: [inTest('expect([1]).toContain(1)')],
  },
  {
    rule: 'jest/prefer-to-have-been-called',
    invalid: [
      inTest('const f = jest.fn()\n\nexpect(f).toHaveBeenCalledTimes(0)', 'expect, it, jest'),
    ],
    valid: [inTest('const f = jest.fn()\n\nexpect(f).not.toHaveBeenCalled()', 'expect, it, jest')],
  },
  {
    rule: 'jest/prefer-to-have-been-called-times',
    invalid: [
      inTest('const f = jest.fn()\n\nexpect(f.mock.calls).toHaveLength(2)', 'expect, it, jest'),
    ],
    valid: [
      inTest('const f = jest.fn()\n\nexpect(f).toHaveBeenCalledTimes(2)', 'expect, it, jest'),
    ],
  },
  {
    rule: 'jest/prefer-to-have-length',
    invalid: [inTest('expect([1].length).toBe(1)')],
    valid: [inTest('expect([1]).toHaveLength(1)')],
  },
  {
    rule: 'jest/prefer-todo',
    invalid: [spec('it', 'it("rounds half up", () => {})')],
    valid: [spec('it', 'it.todo("rounds half up")')],
  },
  {
    rule: 'jest/require-hook',
    invalid: [
      spec(
        'expect, it',
        'declare function seed(): void\n\nseed()\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [
      spec(
        'beforeAll, expect, it',
        'declare function seed(): void\n\nbeforeAll(seed)\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'jest/require-to-throw-message',
    invalid: [inTest('expect(() => JSON.parse("{")).toThrow()')],
    valid: [
      inTest('expect(() => JSON.parse("{")).toThrow(SyntaxError)'),
      inTest('expect(() => 1).not.toThrow()'),
    ],
  },
  {
    rule: 'jest/unbound-method',
    invalid: [
      spec(
        'expect, it',
        `${REPO}it("works", () => {\n  const repo = new Repo()\n  const { label } = repo\n\n  expect(label()).toBe("r")\n})`,
      ),
    ],
    // A spied method passed to `expect` is never called unbound.
    valid: [
      spec(
        'expect, it, jest',
        `${REPO}it("works", () => {\n  const repo = new Repo()\n\n  jest.spyOn(repo, "label")\n\n  expect(repo.label).not.toHaveBeenCalled()\n})`,
      ),
    ],
  },
  {
    rule: 'jest/valid-describe-callback',
    invalid: [
      spec(
        'describe, expect, it',
        'describe("a", (n: number) => {\n  it("works", () => {\n    expect(n).toBe(1)\n  })\n})',
      ),
      spec(
        'describe, expect, it',
        'describe("a", async () => {\n  it("works", () => {\n    expect(1).toBe(1)\n  })\n})',
      ),
    ],
    valid: [
      spec(
        'describe, expect, it',
        'describe.each([1])("%s", (n) => {\n  it("works", () => {\n    expect(n).toBe(1)\n  })\n})',
      ),
    ],
  },
  {
    rule: 'jest/valid-expect',
    invalid: [
      inTest('expect(1)'),
      inTest('expect(1, "one").toBe(1)'),
      spec(
        'expect, it',
        `${LOAD}it("works", () => {\n  return expect(load()).resolves.toBe(1)\n})`,
      ),
    ],
    valid: [
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})`,
      ),
    ],
  },
  {
    rule: 'jest/valid-expect-in-promise',
    invalid: [
      spec(
        'expect, it',
        `${LOAD}it("works", () => {\n  load().then((n) => {\n    expect(n).toBe(1)\n  })\n})`,
      ),
    ],
    valid: [],
  },
  {
    rule: 'jest/valid-expect-with-promise',
    invalid: [
      spec('expect, it', `${LOAD}it("works", async () => {\n  await expect(load()).toBe(1)\n})`),
      inTest('expect(1).resolves.toBe(1)'),
    ],
    valid: [
      spec(
        'expect, it',
        `${LOAD}it("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})`,
      ),
    ],
  },
  {
    rule: 'jest/valid-title',
    invalid: [
      spec('expect, it', 'it("should add", () => {\n  expect(1).toBe(1)\n})'),
      spec('expect, it', 'it(" adds", () => {\n  expect(1).toBe(1)\n})'),
      spec('expect, it', 'it("it adds", () => {\n  expect(1).toBe(1)\n})'),
      spec(
        'describe, expect, it',
        'class Cart {}\n\ndescribe(Cart, () => {\n  it("is empty", () => {\n    expect(new Cart()).toStrictEqual(new Cart())\n  })\n})',
      ),
    ],
    valid: [
      spec(
        'describe, expect, it',
        'describe("Cart", () => {\n  it("is empty", () => {\n    expect([]).toHaveLength(0)\n  })\n})',
      ),
    ],
  },
])

describe('jest autofixes', () => {
  const fixer = new ESLint({
    cwd: FIXTURE_DIR,
    overrideConfigFile: true,
    overrideConfig: config,
    fix: true,
  })

  it.each([
    ['const v = undefined\n\nexpect(v).not.toBe(undefined)', 'expect(v).toBeDefined()'],
    [
      'const f = jest.fn()\n\nexpect(f).toHaveBeenCalledTimes(0)',
      'expect(f).not.toHaveBeenCalled()',
    ],
  ])('rewrites %s without changing its meaning', async (body, expected) => {
    const [result] = await fixer.lintText(inTest(body, 'expect, it, jest'), {
      filePath: 'src/lint-text.test.ts',
    })

    expect(result?.output).toContain(expected)
  })
})
