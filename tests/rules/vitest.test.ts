import vitestPlugin from '@vitest/eslint-plugin'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { FIXTURE_DIR, UNIT_TEST_FILES, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import test from '../../src/test.ts'
import vitest from '../../src/vitest.ts'

import { describeRules } from './cases.ts'

const config = [...base, ...scoped(UNIT_TEST_FILES, test, vitest)]

/** `body` as a test file importing `names` from vitest. */
function spec(names: string, body: string): string {
  return `import { ${names} } from "vitest"\n\n${body}\n`
}

/** `body` wrapped in one `it` block. */
function inTest(body: string, names = 'expect, it'): string {
  return spec(names, `it("works", () => {\n${body}\n})`)
}

const INLINE_SNAPSHOT_LINES = 52

describeRules(config, 'src/lint-text.test.ts', [
  {
    rule: 'vitest/consistent-each-for',
    invalid: [spec('expect, it', 'it.for([1])("is %s", (n) => {\n  expect(n).toBe(1)\n})')],
    valid: [spec('expect, it', 'it.each([1])("is %s", (n) => {\n  expect(n).toBe(1)\n})')],
  },
  {
    rule: 'vitest/consistent-test-it',
    invalid: [spec('expect, test', 'test("adds", () => {\n  expect(1).toBe(1)\n})')],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'vitest/consistent-vitest-vi',
    invalid: [
      inTest('const f = vitest.fn()\nexpect(f).not.toHaveBeenCalled()', 'expect, it, vitest'),
    ],
    valid: [inTest('const f = vi.fn()\nexpect(f).not.toHaveBeenCalled()', 'expect, it, vi')],
  },
  {
    rule: 'vitest/expect-expect',
    invalid: [inTest('console.info(1)')],
    valid: [
      spec(
        'expect, it',
        'function expectPositive(n: number): void {\n  expect(n).toBeGreaterThan(0)\n}\n\nit("is positive", () => {\n  expectPositive(1)\n})',
      ),
      // `settings.vitest.typecheck` counts type assertions.
      inTest('expectTypeOf(1).toEqualTypeOf<number>()', 'expectTypeOf, it'),
    ],
  },
  {
    rule: 'vitest/hoisted-apis-on-top',
    invalid: [inTest('vi.mock(import("./lint-text.ts"))\nexpect(1).toBe(1)', 'expect, it, vi')],
    valid: [
      spec(
        'expect, it, vi',
        'vi.mock(import("./lint-text.ts"))\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'vitest/max-expects',
    invalid: [],
    valid: [inTest(`const n = 1\n\n${'expect(n).toBe(1)\n'.repeat(6)}`)],
  },
  {
    rule: 'vitest/max-nested-describe',
    invalid: [],
    valid: [
      spec(
        'describe, expect, it',
        'describe("a", () => {\n  describe("b", () => {\n    describe("c", () => {\n      describe("d", () => {\n        it("works", () => {\n          expect(1).toBe(1)\n        })\n      })\n    })\n  })\n})',
      ),
    ],
  },
  {
    rule: 'vitest/no-alias-methods',
    invalid: [inTest('expect(() => 1).toThrowError("x")')],
    valid: [inTest('expect(() => 1).toThrow("x")')],
  },
  {
    rule: 'vitest/no-commented-out-tests',
    invalid: [spec('expect, it', '// it("works", () => {})')],
    valid: [spec('expect, it', '// The cases below cover rounding.')],
  },
  {
    rule: 'vitest/no-conditional-expect',
    invalid: [
      inTest('const n = Math.random()\n\nif (n > 0.5) {\n  expect(n).toBeGreaterThan(0.5)\n}'),
    ],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'vitest/no-conditional-in-test',
    invalid: [
      inTest('const n = Math.random()\n\nif (n > 0.5) {\n  expect(n).toBeGreaterThan(0.5)\n}'),
    ],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'vitest/no-conditional-tests',
    invalid: [
      spec(
        'expect, it',
        'declare const ci: boolean\n\nif (ci) {\n  it("works", () => {\n    expect(1).toBe(1)\n  })\n}',
      ),
    ],
    valid: [
      spec(
        'expect, it',
        'declare const ci: boolean\n\nit.skipIf(ci)("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'vitest/no-disabled-tests',
    invalid: [spec('expect, it', 'it.skip("works", () => {\n  expect(1).toBe(1)\n})')],
    valid: [
      spec('it', 'it.todo("rounds half up")'),
      spec(
        'expect, it',
        'declare const ci: boolean\n\nit.skipIf(ci)("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'vitest/no-duplicate-hooks',
    invalid: [
      spec(
        'beforeEach, expect, it, vi',
        'beforeEach(() => {\n  vi.useFakeTimers()\n})\n\nbeforeEach(() => {\n  vi.clearAllMocks()\n})\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'vitest/no-focused-tests',
    invalid: [spec('expect, it', 'it.only("works", () => {\n  expect(1).toBe(1)\n})')],
    valid: [],
  },
  {
    rule: 'vitest/no-identical-title',
    invalid: [`${inTest('expect(1).toBe(1)')}\nit("works", () => {\n  expect(2).toBe(2)\n})\n`],
    valid: [],
  },
  {
    rule: 'vitest/no-import-node-test',
    invalid: ['import { it } from "node:test"\n\nit("works", () => {})\n'],
    valid: [],
  },
  {
    rule: 'vitest/no-interpolation-in-snapshots',
    // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
    invalid: [inTest('const n = 1\n\nexpect({ n }).toMatchInlineSnapshot(`{ "n": ${n} }`)')],
    valid: [inTest('expect({ n: 1 }).toMatchInlineSnapshot(`{ "n": 1 }`)')],
  },
  {
    rule: 'vitest/no-large-snapshots',
    invalid: [
      inTest(`expect("a").toMatchInlineSnapshot(\`\n${'x\n'.repeat(INLINE_SNAPSHOT_LINES)}\`)`),
    ],
    valid: [inTest('expect("a").toMatchInlineSnapshot(`"a"`)')],
  },
  {
    rule: 'vitest/no-mocks-import',
    invalid: [
      spec(
        'expect, it',
        'import { db } from "./__mocks__/db"\n\nit("works", () => {\n  expect(db).toBe(1)\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'vitest/no-standalone-expect',
    invalid: [spec('describe, expect', 'describe("a", () => {\n  expect(1).toBe(1)\n})')],
    valid: [spec('expect', 'expect.extend({})')],
  },
  {
    rule: 'vitest/no-test-prefixes',
    invalid: [spec('expect, xit', 'xit("works", () => {\n  expect(1).toBe(1)\n})')],
    valid: [],
  },
  {
    rule: 'vitest/no-test-return-statement',
    invalid: [spec('it', 'it("works", () => {\n  return Promise.resolve(1)\n})')],
    valid: [],
  },
  {
    rule: 'vitest/no-unneeded-async-expect-function',
    invalid: [
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", async () => {\n  await expect(async () => await load()).rejects.toThrow("x")\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", async () => {\n  await expect(load()).rejects.toThrow("x")\n})',
      ),
    ],
  },
  {
    rule: 'vitest/padding-around-all',
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
    rule: 'vitest/prefer-called-exactly-once-with',
    invalid: [
      inTest(
        'const f = vi.fn()\n\nf(1)\n\nexpect(f).toHaveBeenCalledOnce()\nexpect(f).toHaveBeenCalledWith(1)',
        'expect, it, vi',
      ),
    ],
    valid: [
      inTest(
        'const f = vi.fn()\n\nf(1)\n\nexpect(f).toHaveBeenCalledExactlyOnceWith(1)',
        'expect, it, vi',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-called-once',
    invalid: [inTest('const f = vi.fn()\n\nexpect(f).toHaveBeenCalledTimes(1)', 'expect, it, vi')],
    valid: [inTest('const f = vi.fn()\n\nexpect(f).toHaveBeenCalledTimes(2)', 'expect, it, vi')],
  },
  {
    rule: 'konceptware-vitest/prefer-called-with',
    invalid: [inTest('const f = vi.fn()\n\nexpect(f).toHaveBeenCalled()', 'expect, it, vi')],
    valid: [inTest('const f = vi.fn()\n\nexpect(f).not.toHaveBeenCalled()', 'expect, it, vi')],
  },
  {
    rule: 'vitest/prefer-comparison-matcher',
    invalid: [inTest('const n = 2\n\nexpect(n > 1).toBe(true)')],
    valid: [inTest('const n = 2\n\nexpect(n).toBeGreaterThan(1)')],
  },
  {
    rule: 'vitest/prefer-describe-function-title',
    invalid: [
      spec(
        'describe, expect, it',
        'import { parse } from "./helpers"\n\ndescribe("parse", () => {\n  it("parses", () => {\n    expect(parse("1")).toBe(1)\n  })\n})',
      ),
    ],
    valid: [
      spec(
        'describe, expect, it',
        'import { parse } from "./helpers"\n\ndescribe(parse, () => {\n  it("parses", () => {\n    expect(parse("1")).toBe(1)\n  })\n})',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-each',
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
    rule: 'vitest/prefer-equality-matcher',
    invalid: [inTest('const n = 1\n\nexpect(n === 1).toBe(true)')],
    valid: [inTest('const n = 1\n\nexpect(n).toBe(1)')],
  },
  {
    rule: 'vitest/prefer-expect-assertions',
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
    rule: 'vitest/prefer-expect-resolves',
    invalid: [
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", async () => {\n  expect(await load()).toBe(1)\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-expect-type-of',
    invalid: [inTest('const s = "a"\n\nexpect(typeof s).toBe("string")')],
    valid: [inTest('const s = "a"\n\nexpect(s).toBeTypeOf("string")')],
  },
  {
    rule: 'vitest/prefer-hooks-in-order',
    invalid: [
      spec(
        'afterEach, beforeEach, expect, it, vi',
        'afterEach(() => {\n  vi.restoreAllMocks()\n})\n\nbeforeEach(() => {\n  vi.useFakeTimers()\n})\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'vitest/prefer-hooks-on-top',
    invalid: [
      spec(
        'afterEach, expect, it, vi',
        'it("works", () => {\n  expect(1).toBe(1)\n})\n\nafterEach(() => {\n  vi.restoreAllMocks()\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'vitest/prefer-import-in-mock',
    invalid: [
      spec(
        'expect, it, vi',
        'vi.mock("./lint-text.ts")\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it, vi',
        'vi.mock(import("./lint-text.ts"))\n\nit("works", () => {\n  expect(1).toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-importing-vitest-globals',
    invalid: ['import { expect } from "vitest"\n\nit("works", () => {\n  expect(1).toBe(1)\n})\n'],
    valid: [inTest('expect(1).toBe(1)')],
  },
  {
    rule: 'vitest/prefer-lowercase-title',
    invalid: [spec('expect, it', 'it("Works", () => {\n  expect(1).toBe(1)\n})')],
    valid: [
      spec(
        'describe, expect, it',
        'describe("Button", () => {\n  it("renders", () => {\n    expect(1).toBe(1)\n  })\n})',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-mock-promise-shorthand',
    invalid: [
      inTest(
        'const f = vi.fn().mockImplementation(() => Promise.resolve(1))\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, vi',
      ),
    ],
    valid: [
      inTest(
        'const f = vi.fn().mockResolvedValue(1)\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, vi',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-mock-return-shorthand',
    invalid: [
      inTest(
        'const f = vi.fn().mockImplementation(() => 1)\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, vi',
      ),
    ],
    valid: [
      inTest(
        'const f = vi.fn().mockReturnValue(1)\n\nexpect(f).not.toHaveBeenCalled()',
        'expect, it, vi',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-snapshot-hint',
    invalid: [inTest('expect({ a: 1 }).toMatchSnapshot()')],
    valid: [inTest('expect({ a: 1 }).toMatchSnapshot("shape")')],
  },
  {
    rule: 'vitest/prefer-spy-on',
    invalid: [
      inTest(
        'const o = { f: (): number => 1 }\n\no.f = vi.fn()\n\nexpect(o.f).not.toHaveBeenCalled()',
        'expect, it, vi',
      ),
    ],
    valid: [
      inTest(
        'const o = { f: (): number => 1 }\nconst spy = vi.spyOn(o, "f")\n\nexpect(spy).not.toHaveBeenCalled()',
        'expect, it, vi',
      ),
    ],
  },
  {
    rule: 'vitest/prefer-strict-boolean-matchers',
    invalid: [inTest('const ok = true\n\nexpect(ok).toBeTruthy()')],
    valid: [inTest('const ok = true\n\nexpect(ok).toBe(true)')],
  },
  {
    rule: 'vitest/prefer-strict-equal',
    invalid: [inTest('expect({ a: 1 }).toEqual({ a: 1 })')],
    valid: [inTest('expect({ a: 1 }).toStrictEqual({ a: 1 })')],
  },
  {
    rule: 'konceptware-vitest/prefer-to-be',
    invalid: [
      inTest('expect(1).toStrictEqual(1)'),
      inTest('const v = null\n\nexpect(v).toBe(null)'),
    ],
    valid: [inTest('const v = null\n\nexpect(v).toBeNull()')],
  },
  {
    rule: 'vitest/prefer-to-be-object',
    invalid: [inTest('expectTypeOf({}).toBeInstanceOf(Object)', 'expectTypeOf, it')],
    valid: [],
  },
  {
    rule: 'vitest/prefer-to-contain',
    invalid: [inTest('expect([1].includes(1)).toBe(true)')],
    valid: [inTest('expect([1]).toContain(1)')],
  },
  {
    rule: 'vitest/prefer-to-have-been-called-times',
    invalid: [
      inTest('const f = vi.fn()\n\nexpect(f.mock.calls).toHaveLength(2)', 'expect, it, vi'),
    ],
    valid: [inTest('const f = vi.fn()\n\nexpect(f).toHaveBeenCalledTimes(2)', 'expect, it, vi')],
  },
  {
    rule: 'vitest/prefer-to-have-length',
    invalid: [inTest('expect([1].length).toBe(1)')],
    valid: [inTest('expect([1]).toHaveLength(1)')],
  },
  {
    rule: 'vitest/prefer-todo',
    invalid: [spec('it', 'it("rounds half up", () => {})')],
    valid: [spec('it', 'it.todo("rounds half up")')],
  },
  {
    rule: 'vitest/prefer-vi-mocked',
    invalid: [
      spec(
        'expect, it, type Mock',
        'declare function load(): number\n\nit("works", () => {\n  expect(load as Mock).not.toHaveBeenCalled()\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it, vi',
        'declare function load(): number\n\nit("works", () => {\n  expect(vi.mocked(load)).not.toHaveBeenCalled()\n})',
      ),
    ],
  },
  {
    rule: 'vitest/require-awaited-expect-poll',
    invalid: [spec('expect, it', 'it("works", async () => {\n  expect.poll(() => 1).toBe(1)\n})')],
    valid: [
      spec('expect, it', 'it("works", async () => {\n  await expect.poll(() => 1).toBe(1)\n})'),
    ],
  },
  {
    rule: 'vitest/require-hook',
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
    rule: 'vitest/require-local-test-context-for-concurrent-snapshots',
    invalid: [
      spec('expect, it', 'it.concurrent("works", () => {\n  expect(1).toMatchSnapshot("one")\n})'),
    ],
    valid: [
      spec(
        'it',
        'it.concurrent("works", ({ expect }) => {\n  expect(1).toMatchSnapshot("one")\n})',
      ),
    ],
  },
  {
    rule: 'vitest/require-to-throw-message',
    invalid: [inTest('expect(() => JSON.parse("{")).toThrow()')],
    valid: [
      inTest('expect(() => JSON.parse("{")).toThrow(SyntaxError)'),
      inTest('expect(() => 1).not.toThrow()'),
    ],
  },
  {
    rule: 'vitest/unbound-method',
    invalid: [
      spec(
        'expect, it',
        'class Repo {\n  name = "r"\n  label(): string {\n    return this.name\n  }\n}\n\nit("works", () => {\n  const repo = new Repo()\n  const { label } = repo\n\n  expect(label()).toBe("r")\n})',
      ),
    ],
    // A spied method passed to `expect` is never called unbound.
    valid: [
      spec(
        'expect, it, vi',
        'class Repo {\n  name = "r"\n  label(): string {\n    return this.name\n  }\n}\n\nit("works", () => {\n  const repo = new Repo()\n\n  vi.spyOn(repo, "label")\n\n  expect(repo.label).not.toHaveBeenCalled()\n})',
      ),
    ],
  },
  {
    rule: 'vitest/valid-describe-callback',
    invalid: [
      spec(
        'describe, expect, it',
        'describe("a", (n: number) => {\n  it("works", () => {\n    expect(n).toBe(1)\n  })\n})',
      ),
      spec('describe', 'describe("a", () => {\n  return\n})'),
    ],
    valid: [
      spec(
        'describe, expect, it',
        'describe.each([1])("%s", (n) => {\n  it("works", () => {\n    expect(n).toBe(1)\n  })\n})',
      ),
    ],
  },
  {
    rule: 'vitest/valid-expect',
    invalid: [
      inTest('expect(1)'),
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", () => {\n  return expect(load()).resolves.toBe(1)\n})',
      ),
    ],
    valid: [
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", async () => {\n  await expect(load()).resolves.toBe(1)\n})',
      ),
    ],
  },
  {
    rule: 'vitest/valid-expect-in-promise',
    invalid: [
      spec(
        'expect, it',
        'declare function load(): Promise<number>\n\nit("works", () => {\n  load().then((n) => {\n    expect(n).toBe(1)\n  })\n})',
      ),
    ],
    valid: [],
  },
  {
    rule: 'vitest/valid-title',
    invalid: [
      spec('expect, it', 'it("should add", () => {\n  expect(1).toBe(1)\n})'),
      spec('expect, it', 'it(" adds", () => {\n  expect(1).toBe(1)\n})'),
      spec('expect, it', 'it("it adds", () => {\n  expect(1).toBe(1)\n})'),
    ],
    // `settings.vitest.typecheck` accepts a class as a `describe` title.
    valid: [
      spec(
        'describe, expect, it',
        'class Cart {}\n\ndescribe(Cart, () => {\n  it("is empty", () => {\n    expect(new Cart()).toStrictEqual(new Cart())\n  })\n})',
      ),
    ],
  },
])

describeRules(config, 'src/naming.spec.ts', [
  {
    rule: 'vitest/consistent-test-filename',
    invalid: [inTest('expect(1).toBe(1)')],
    valid: [],
  },
])

describeRules(config, 'src/naming.test.mts', [
  {
    rule: 'vitest/consistent-test-filename',
    invalid: [],
    valid: [inTest('expect(1).toBe(1)')],
  },
])

describe('konceptware-vitest/prefer-called-with', () => {
  const code = inTest('const f = vi.fn()\n\nf(1)\n\nexpect(f).toHaveBeenCalled()', 'expect, it, vi')

  it('reports without rewriting the assertion under --fix', async () => {
    const fixer = new ESLint({
      cwd: FIXTURE_DIR,
      overrideConfigFile: true,
      overrideConfig: config,
      fix: true,
    })
    const [result] = await fixer.lintText(code, { filePath: 'src/lint-text.test.ts' })

    expect(result?.output).toBeUndefined()
    expect(result?.messages.map((message) => message.ruleId)).toStrictEqual([
      'konceptware-vitest/prefer-called-with',
    ])
  })

  it('coexists with a consumer registering @vitest/eslint-plugin', async () => {
    const consumer = [...config, { files: ['**/*.test.ts'], plugins: { vitest: vitestPlugin } }]
    const [result] = await new ESLint({
      cwd: FIXTURE_DIR,
      overrideConfigFile: true,
      overrideConfig: consumer,
    }).lintText(code, { filePath: 'src/lint-text.test.ts' })

    expect(result?.messages.map((message) => message.ruleId)).toStrictEqual([
      'konceptware-vitest/prefer-called-with',
    ])
  })
})

describe('konceptware-vitest/prefer-to-be', () => {
  const fixer = new ESLint({
    cwd: FIXTURE_DIR,
    overrideConfigFile: true,
    overrideConfig: config,
    fix: true,
  })

  async function fixed(assertion: string): Promise<string | undefined> {
    const [result] = await fixer.lintText(inTest(`const v = undefined\n\n${assertion}`), {
      filePath: 'src/lint-text.test.ts',
    })
    return result?.output
  }

  it('reports `.not.toBe(undefined)` without inverting it under --fix', async () => {
    const [result] = await fixer.lintText(
      inTest('const v = undefined\n\nexpect(v).not.toBe(undefined)'),
      { filePath: 'src/lint-text.test.ts' },
    )

    expect(result?.output).toBeUndefined()
    expect(result?.messages.map((message) => message.ruleId)).toContain(
      'konceptware-vitest/prefer-to-be',
    )
  })

  it.each([
    ['expect(v).toBe(undefined)', 'expect(v).toBeUndefined()'],
    ['expect(v).not.toBeUndefined()', 'expect(v).toBeDefined()'],
  ])('still fixes %s', async (assertion, expected) => {
    await expect(fixed(assertion)).resolves.toContain(expected)
  })
})
