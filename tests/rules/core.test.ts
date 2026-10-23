import { UNIT_TEST_FILES, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import react from '../../src/react.ts'
import test from '../../src/test.ts'

import { describeRules } from './cases.ts'

const BACKSLASH = '\\'

function line(code: string): string {
  return `${code}\n`
}

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'accessor-pairs',
    invalid: [
      'export const o = { set x(v: number) { void v } }',
      'export interface I { set x(v: number) }',
    ],
    valid: ['export const o = { get x() { return 1 } }'],
  },
  {
    rule: 'array-callback-return',
    invalid: [
      'export const a = [1].map((x) => { if (x) return x })',
      'const s = new Set<number>(); [1].forEach((x) => s.add(x))',
    ],
    valid: ['const s = new Set<number>(); [1].forEach((x) => { s.add(x) })'],
  },
  {
    rule: 'arrow-body-style',
    invalid: ['export const f = (x: number) => { return x }'],
    valid: ['export const f = (x: number) => x', 'export const g = () => ({ a: 1 })'],
  },
  {
    rule: 'complexity',
    invalid: [],
    valid: [
      `export function f(n: number) {\n${Array.from({ length: 15 }, (_, i) => `  if (n === ${String(i)}) return ${String(i)}`).join('\n')}\n  return -1\n}`,
    ],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'curly',
    invalid: [
      'declare const x: boolean\ndeclare function g(...a: number[]): void\nif (x)\n  g(\n    1,\n  )\n',
      'declare const x: boolean\nif (x) {\n  console.info(1)\n  console.info(2)\n} else console.info(3)\n',
      'declare const x: boolean\nif (x) {\n  console.info(1)\n}\n',
    ],
    valid: [
      'declare const x: boolean\nif (x) console.info(1)\n',
      'declare const x: boolean\nif (x)\n  console.info(1)\n',
      'declare const x: boolean\nif (x) console.info(1)\nelse if (!x) console.info(2)\nelse console.info(3)\n',
      'declare const x: boolean\nif (x) {\n  console.info(1)\n} else {\n  console.info(2)\n  console.info(3)\n}\n',
    ],
  },
  {
    rule: 'default-case-last',
    invalid: [
      'declare const n: number\nswitch (n) {\n  default:\n    break\n  case 1:\n    break\n}\n',
    ],
    valid: [
      'declare const n: number\nswitch (n) {\n  case 1:\n    break\n  default:\n    break\n}\n',
    ],
  },
  {
    rule: 'eqeqeq',
    invalid: ['declare const a: unknown\nexport const b = a == 1\n'],
    valid: ['declare const a: unknown\nexport const b = a == null\n'],
  },
  {
    rule: 'no-eq-null',
    invalid: [
      'declare const a: unknown\nexport const b = a == null\n',
      'declare const a: unknown\nexport const b = null != a\n',
    ],
    valid: ['declare const a: unknown\nexport const b = a === null || a === undefined\n'],
  },
  {
    rule: 'for-direction',
    invalid: ['for (let i = 0; i < 10; i--) console.info(i)\n'],
    valid: ['for (let i = 0; i < 10; i++) console.info(i)\n'],
  },
  {
    rule: 'func-name-matching',
    invalid: ['export const foo = function bar() {}\n'],
    valid: ['export const foo = function foo() {}\n'],
  },
  {
    rule: 'func-names',
    invalid: ['export const xs = [1].map(function (x) {\n  return x\n})\n'],
    valid: ['export const foo = function () {}\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'func-style',
    invalid: [
      'export const add = (a: number, b: number) => a + b\n',
      'export const f = function () {}\n',
    ],
    valid: [
      'export function add(a: number, b: number) {\n  return a + b\n}\n',
      'type Handler = (n: number) => number\nexport const double: Handler = (n) => n * 2\n',
      'export const xs = [1].map((x) => x * 2)\n',
    ],
  },
  {
    rule: 'grouped-accessor-pairs',
    invalid: [
      'export const o = {\n  get a() {\n    return 1\n  },\n  b: 2,\n  set a(v: number) {\n    void v\n  },\n}\n',
      'export const o = {\n  set a(v: number) {\n    void v\n  },\n  get a() {\n    return 1\n  },\n}\n',
    ],
    valid: [
      'export const o = {\n  get a() {\n    return 1\n  },\n  set a(v: number) {\n    void v\n  },\n}\n',
    ],
  },
  {
    rule: 'logical-assignment-operators',
    invalid: [
      'let a: number | undefined\na = a ?? 1\nexport { a }\n',
      'let a: number | undefined\nif (!a) a = 1\nexport { a }\n',
    ],
    valid: ['let a: number | undefined\na ??= 1\nexport { a }\n'],
  },
])

function longBody(lines: number): string {
  return Array.from({ length: lines }, (_, i) => `  console.info(${String(i)})`).join('\n')
}

function params(count: number): string {
  return Array.from({ length: count }, (_, i) => `p${String(i)}: number`).join(', ')
}

function nested(depth: number): string {
  return `${'void [1].map(() => '.repeat(depth)}1${')'.repeat(depth)}\n`
}

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'max-depth',
    invalid: [],
    valid: [
      'declare const x: boolean\nif (x) { if (x) { if (x) { if (x) { if (x) { console.info(1) } } } } }\n',
    ],
  },
  {
    rule: 'max-lines',
    invalid: [],
    valid: [`${longBody(301)}\n`],
  },
  {
    rule: 'max-lines-per-function',
    invalid: [],
    valid: [`export function f() {\n${longBody(49)}\n}\n`],
  },
  {
    rule: 'max-nested-callbacks',
    invalid: [],
    valid: [nested(11), `void new Promise(() => { ${nested(10)} })\n`],
  },
  {
    rule: 'max-params',
    invalid: [],
    valid: [`export function f(${params(9)}) {}\n`],
  },
  {
    rule: 'new-cap',
    invalid: [
      'declare const foo: new () => object\nexport const a = new foo()\n',
      "import { ESLint as eslint } from 'eslint'\nexport const a = new eslint()\n",
    ],
    valid: [
      'declare function Injectable(): ClassDecorator\n@Injectable()\nexport class A {}\n',
      'declare const Type: { String(): void }\nType.String()\n',
      'declare const lib: { client: new () => object }\nexport const a = new lib.client()\n',
    ],
  },
  {
    rule: 'no-alert',
    invalid: ['alert("x")\n'],
    valid: [],
  },
  {
    rule: 'no-async-promise-executor',
    invalid: [
      'export const p = new Promise<void>(async (resolve) => {\n  await Promise.resolve()\n  resolve()\n})\n',
    ],
    valid: ['export const p = new Promise<void>((resolve) => {\n  resolve()\n})\n'],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  {
    rule: 'no-param-reassign',
    invalid: [],
    valid: ['export function setup(mock: { calls: number }) {\n  mock.calls = 0\n}\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'no-await-in-loop',
    invalid: ['for (const x of [1]) await Promise.resolve(x)\n'],
    valid: ['await Promise.all([1].map((x) => Promise.resolve(x)))\n'],
  },
  {
    rule: 'no-bitwise',
    invalid: [
      'declare const a: number\nexport const b = a | 1\n',
      'declare const a: number\nexport const b = a | 0\n',
    ],
    valid: [],
  },
  {
    rule: 'no-caller',
    invalid: ['export function f() {\n  return arguments.callee\n}\n'],
    valid: [],
  },
  {
    rule: 'no-case-declarations',
    invalid: [
      'declare const n: number\nswitch (n) {\n  case 1:\n    const x = 1\n    console.info(x)\n}\n',
    ],
    valid: [
      'declare const n: number\nswitch (n) {\n  case 1: {\n    const x = 1\n    console.info(x)\n  }\n}\n',
    ],
  },
  {
    rule: 'no-compare-neg-zero',
    invalid: ['declare const x: number\nexport const b = x === -0\n'],
    valid: ['declare const x: number\nexport const b = Object.is(x, -0)\n'],
  },
  {
    rule: 'no-cond-assign',
    invalid: ['let a = 0\ndeclare const b: number\nif ((a = b)) console.info(a)\n'],
    valid: [],
  },
  {
    rule: 'no-console',
    invalid: ['console.log(1)\n', 'console.error(1)\n'],
    valid: [],
  },
  {
    rule: 'no-constant-binary-expression',
    invalid: [
      'declare const a: number\ndeclare const c: number\nexport const b = a + 1 ?? c\n',
      'declare const x: unknown\nexport const b = x === []\n',
      'export const b = 1 < 2\n',
    ],
    valid: [
      'declare const a: number | null\nexport const b = a ?? 1\n',
      'declare const x: number\nexport const b = x < 2\n',
    ],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  { rule: 'no-console', invalid: ['console.log(1)\n'], valid: [] },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'no-constant-condition',
    invalid: [
      'if (true) console.info(1)\n',
      'for (;;) {\n  if (Math.random()) break\n}\nwhile (1) break\n',
    ],
    valid: ['while (true) {\n  if (Math.random()) break\n}\n'],
  },
  {
    rule: 'no-constructor-return',
    invalid: ['export class A {\n  constructor() {\n    return { a: 1 }\n  }\n}\n'],
    valid: [
      'export class A {\n  constructor(x: boolean) {\n    if (x) return\n    console.info(1)\n  }\n}\n',
    ],
  },
  {
    rule: 'no-control-regex',
    invalid: ['export const r = /\\x1f/\n'],
    valid: ['export const r = /\\x20/\n'],
  },
  {
    rule: 'no-debugger',
    invalid: ['debugger\n'],
    valid: [],
  },
  {
    rule: 'no-div-regex',
    invalid: ['export const r = /=foo/\n'],
    valid: ['export const r = /[=]foo/\n'],
  },
  {
    rule: 'no-dupe-else-if',
    invalid: [
      'declare const a: boolean\ndeclare const b: boolean\nif (a) console.info(1)\nelse if (b) console.info(2)\nelse if (a) console.info(3)\n',
    ],
    valid: [],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  { rule: 'no-debugger', invalid: ['debugger\n'], valid: [] },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'no-duplicate-case',
    invalid: [
      'declare const n: number\nswitch (n) {\n  case 1:\n    break\n  case 1:\n    break\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-else-return',
    invalid: [
      'export function f(a: boolean) {\n  if (a) {\n    return 1\n  } else {\n    return 2\n  }\n}\n',
      'export function f(a: boolean, b: boolean) {\n  if (a) {\n    return 1\n  } else if (b) {\n    return 2\n  }\n  return 3\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-empty',
    invalid: ['try {\n  console.info(1)\n} catch {}\n'],
    valid: [
      'try {\n  console.info(1)\n} catch {\n  // Logging is best-effort; a failed write must not break the caller.\n}\n',
    ],
  },
  {
    rule: 'no-empty-character-class',
    invalid: ['export const r = /a[]/\n'],
    valid: ['export const r = /a[b]/\n'],
  },
  {
    rule: '@typescript-eslint/no-empty-function',
    invalid: ['export function f() {}\n', 'export class A {\n  constructor() {}\n}\n'],
    valid: [
      'export class A {\n  private constructor() {}\n}\n',
      'class Base {\n  run() {\n    return 1\n  }\n}\nexport class A extends Base {\n  override run() {}\n}\n',
      'export class A {\n  constructor(private readonly x: number) {}\n}\n',
    ],
  },
  {
    rule: 'no-empty-pattern',
    invalid: ['declare const o: object\nconst {} = o\n', 'export function f({}: object) {}\n'],
    valid: [],
  },
  {
    rule: 'no-empty-static-block',
    invalid: ['export class A {\n  static {}\n}\n'],
    valid: [],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  {
    rule: '@typescript-eslint/no-empty-function',
    invalid: [],
    valid: ['export const stub = () => {}\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  { rule: 'no-eval', invalid: ['eval("1")\n', ';(0, eval)("1")\n'], valid: [] },
  {
    rule: 'no-ex-assign',
    invalid: [
      'try {\n  console.info(1)\n} catch (error) {\n  error = 1\n  console.info(error)\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-extend-native',
    invalid: ['Object.defineProperty(Array.prototype, "last", { value: 1 })\n'],
    valid: [],
  },
  {
    rule: 'no-extra-bind',
    invalid: ['export const f = (() => 1).bind(null)\n'],
    valid: [],
  },
  {
    rule: 'no-extra-boolean-cast',
    invalid: ['declare const a: number\ndeclare const b: boolean\nif (!!a || b) console.info(1)\n'],
    valid: [],
  },
  {
    rule: 'no-extra-label',
    invalid: ['outer: for (const x of [1]) {\n  if (x) break outer\n}\n'],
    valid: [],
  },
  {
    rule: 'no-fallthrough',
    invalid: [
      'declare const n: number\nswitch (n) {\n  case 1:\n    console.info(1)\n  case 2:\n    console.info(2)\n}\n',
      'declare const n: number\nswitch (n) {\n  case 1:\n    console.info(1)\n    break\n  // falls through\n  case 2:\n    console.info(2)\n}\n',
    ],
    valid: [
      'declare const n: number\nswitch (n) {\n  case 1:\n    console.info(1)\n  // falls through\n  case 2:\n    console.info(2)\n}\n',
      'declare const n: number\nswitch (n) {\n  case 1:\n  case 2:\n    console.info(2)\n}\n',
    ],
  },
  {
    rule: 'no-global-assign',
    invalid: ['// @ts-expect-error -- assigning a global is the case under test\nObject = null\n'],
    valid: [],
  },
  {
    rule: 'no-implicit-coercion',
    invalid: [
      'declare const x: number\nexport const a = !!x\n',
      'declare const x: string\nexport const a = +x\n',
      "declare const x: number\nexport const a = '' + x\n",
      // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
      'declare const x: number\nexport const a = `${x}`\n',
    ],
    // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
    valid: ['declare const x: number\nexport const a = `id-${String(x)}`\n'],
  },
])

// Built from an escape so this test file itself contains no irregular whitespace.
const NBSP = '\u00a0'

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'no-implicit-globals',
    invalid: [],
    valid: ['var a = 1\nfunction b() {\n  return a\n}\nexport { b }\n'],
  },
  {
    rule: 'no-invalid-regexp',
    invalid: ["export const r = new RegExp('[')\n"],
    valid: ["export const r = new RegExp('[a]')\n"],
  },
  {
    rule: 'no-irregular-whitespace',
    invalid: [
      `export const a = 'x${NBSP}y'\n`,
      `// x${NBSP}y\nexport const a = 1\n`,
      `export const a = \`x${NBSP}y\`\n`,
    ],
    valid: ["export const a = 'x\\u00a0y'\n"],
  },
  {
    rule: 'no-iterator',
    invalid: ['declare const o: { __iterator__: unknown }\nexport const i = o.__iterator__\n'],
    valid: [],
  },
  {
    rule: 'no-label-var',
    invalid: ['const x = 1\nx: for (const y of [x]) {\n  if (y) break x\n}\n'],
    valid: [],
  },
  {
    rule: 'no-labels',
    invalid: [
      'outer: for (const a of [1]) {\n  for (const b of [a]) {\n    if (b) break outer\n  }\n}\n',
      'declare const k: string\nsw: switch (k) {\n  case "a":\n    break sw\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-lone-blocks',
    invalid: ['export function f(): void {\n  {\n    f()\n  }\n}\n'],
    valid: ['{\n  const scoped = 1\n  console.info(scoped)\n}\n'],
  },
  {
    rule: 'no-lonely-if',
    invalid: [
      'declare const a: boolean\ndeclare const b: boolean\nif (a) {\n  a.valueOf()\n} else {\n  if (b) b.valueOf()\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-loop-func',
    invalid: [
      'let i = 0\nexport const fns: (() => number)[] = []\nwhile (i < 2) {\n  fns.push(function f() {\n    return i\n  })\n  i += 1\n}\n',
    ],
    valid: [
      'export const fns: (() => number)[] = []\nfor (let i = 0; i < 2; i += 1) {\n  fns.push(function f() {\n    return i\n  })\n}\n',
    ],
  },
  {
    rule: 'no-loss-of-precision',
    invalid: ['export const a = 9007199254740993\n'],
    valid: ['export const a = 9007199254740991\n'],
  },
  {
    rule: 'no-misleading-character-class',
    invalid: ['export const r = /[👍]/\n'],
    // The snippet must contain the escape text itself; a `\u` escape in this string would be decoded to the emoji.
    valid: [
      `export const r = /[${BACKSLASH}uD83D${BACKSLASH}uDC4D]/\n`,
      'export const r = /[👍]/u\n',
    ],
  },
  {
    rule: 'no-multi-assign',
    invalid: ['let a = 0\nlet b = 0\na = b = 1\nexport { a, b }\n'],
    valid: [],
  },
  {
    rule: 'no-multi-str',
    invalid: ["export const s = 'one \\\ntwo'\n"],
    valid: [],
  },
  {
    rule: 'no-negated-condition',
    invalid: [
      'declare const a: boolean\nexport const x = !a ? 1 : 2\n',
      'declare const a: boolean\nif (!a) {\n  a.valueOf()\n} else {\n  a.toString()\n}\n',
    ],
    valid: ['export function f(a: boolean): number {\n  if (!a) return 1\n  return 2\n}\n'],
  },
  {
    rule: 'no-new',
    invalid: ['class A {}\nnew A()\n'],
    valid: ['class A {}\nexport const a = new A()\n'],
  },
  {
    rule: 'no-new-func',
    invalid: [
      'export const f = new Function("a", "return a")\n',
      'export const g = Function.call(null, "a", "return a")\n',
    ],
    valid: [],
  },
  {
    rule: 'no-new-wrappers',
    invalid: ['export const s = new String("a")\n'],
    valid: ['export const s = String(1)\n'],
  },
  {
    rule: 'no-object-constructor',
    invalid: ['export const o = new Object()\n'],
    valid: ['export const o = {}\n'],
  },
  {
    rule: 'no-param-reassign',
    invalid: [
      'export function f(a: number) {\n  a = 2\n  return a\n}\n',
      'export function f(user: { name: string }) {\n  user.name = "x"\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-promise-executor-return',
    invalid: ['export const p = new Promise((r) => setTimeout(r, 100))\n'],
    valid: ['export const p = new Promise((r) => {\n  setTimeout(r, 100)\n})\n'],
  },
  {
    rule: 'no-prototype-builtins',
    invalid: ['const o = { a: 1 }\nexport const h = o.hasOwnProperty("a")\n'],
    valid: ['const o = { a: 1 }\nexport const h = Object.hasOwn(o, "a")\n'],
  },
  {
    rule: 'no-regex-spaces',
    invalid: ['export const r = /a   b/\n'],
    valid: ['export const r = /a {3}b/\n'],
  },
  {
    rule: 'no-restricted-globals',
    invalid: ['export const n = isNaN(1)\n', 'export const n = globalThis.isFinite(1)\n'],
    valid: ['export const n = Number.isNaN(1)\n'],
  },
  {
    rule: 'no-restricted-syntax',
    invalid: [
      'declare const o: Record<string, number>\nfor (const k in o) {\n  if (Object.hasOwn(o, k)) console.info(k)\n}\n',
      'export enum Role {\n  Admin = "admin",\n}\n',
      'export interface User {\n  id: number\n}\n',
      'export namespace N {\n  export interface U {\n    id: number\n  }\n}\n',
      'export * from "./helpers.ts"\n',
      'export * as helpers from "./helpers.ts"\n',
      'import * as helpers from "./helpers.ts"\nexport const p = helpers.parse\n',
      'import * as utils from "@/utils"\nexport const u = utils\n',
      'import * as utils from "~/utils"\nexport const u = utils\n',
      'import * as utils from "#utils"\nexport const u = utils\n',
    ],
    valid: [
      'export const Role = { Admin: "admin", User: "user" } as const\nexport type Role = (typeof Role)[keyof typeof Role]\n',
      'export type User = { id: number }\n',
      // Augmenting a module's interface only works with `interface`.
      'declare module "node:http" {\n  interface IncomingMessage {\n    user?: string\n  }\n}\nexport {}\n',
      'declare global {\n  interface Window {\n    flag?: boolean\n  }\n}\nexport {}\n',
      'export { parse } from "./helpers.ts"\n',
      'import * as path from "node:path"\nexport const j = path.join\n',
      // A scoped package starts with `@scope/`, not the `@/` alias.
      'import * as stylistic from "@stylistic/eslint-plugin"\nexport const s = stylistic\n',
    ],
  },
  {
    rule: 'no-return-assign',
    invalid: ['let a = 0\nexport function f() {\n  return (a = 1)\n}\nexport { a }\n'],
    valid: [],
  },
  {
    rule: 'no-script-url',
    invalid: ['export const u = "javascript:void(0)"\n'],
    valid: [],
  },
  {
    rule: 'no-self-assign',
    invalid: ['let a = 0\na = a\nexport { a }\n', 'const o = { b: 1 }\no.b = o.b\n'],
    valid: [],
  },
  {
    rule: 'no-self-compare',
    invalid: ['declare const a: number\nexport const b = a === a\n'],
    valid: [],
  },
  {
    rule: 'no-sequences',
    invalid: ['declare function f(): void\nexport const a = (f(), 1)\n'],
    valid: ['for (let i = 0, j = 1; i < j; i += 1, j -= 1) console.info(i)\n'],
  },
  {
    rule: '@typescript-eslint/no-shadow',
    invalid: [
      'declare const users: { id: number }[]\nexport const user = users.find((user) => user.id)\n',
    ],
    valid: [
      'export function f() {\n  const URL = 1\n  return URL\n}\n',
      'export function g(name: string) {\n  return name\n}\n',
      'export const Role = { Admin: "admin" } as const\nexport type Role = (typeof Role)[keyof typeof Role]\n',
      'const value = 1\nexport type F = (value: string) => void\nexport { value }\n',
    ],
  },
  {
    rule: 'no-shadow-restricted-names',
    invalid: ['export function f(undefined: number) {\n  return undefined\n}\n'],
    valid: [],
  },
  {
    rule: 'no-sparse-arrays',
    invalid: ['export const a = [1, , 2]\n'],
    valid: [],
  },
  {
    rule: 'no-template-curly-in-string',
    // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
    invalid: ['export const s = "Hello ${name}"\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/only-throw-error',
    invalid: [
      'export function f() {\n  throw "oops"\n}\n',
      'declare const e: unknown\nexport function f() {\n  throw e\n}\n',
    ],
    valid: [
      'export function f() {\n  throw new Error("oops")\n}\n',
      'export function f(g: () => void) {\n  try {\n    g()\n  } catch (error) {\n    throw error\n  }\n}\n',
    ],
  },
  {
    rule: 'no-unassigned-vars',
    invalid: ['let x: string | undefined\nexport const y = x\n'],
    valid: [],
  },
  {
    rule: 'no-undef-init',
    invalid: ['let a: string | undefined = undefined\nexport { a }\n'],
    valid: [],
  },
  {
    rule: 'no-unexpected-multiline',
    invalid: [
      'declare const b: (x: number) => number\ndeclare const c: number\nconst a = b\n(c)\nexport { a }\n',
    ],
    valid: [],
  },
  {
    rule: 'no-unmodified-loop-condition',
    invalid: [
      'let a = 1\nconst b = 2\nwhile (a ? b : 0) {\n  a = 0\n}\n',
      'declare const n: { next?: unknown }\nwhile (n.next !== undefined && n) console.info(n)\n',
    ],
    valid: ['let a = 1\nconst b = 2\nwhile (a < b) {\n  a += 1\n}\n'],
  },
  {
    rule: 'no-unneeded-ternary',
    invalid: [
      'declare const x: boolean\nexport const y = x ? true : false\n',
      'declare const x: number\nexport const y = x ? x : 2\n',
    ],
    valid: [],
  },
  {
    rule: 'no-unreachable',
    invalid: ['export function f() {\n  return 1\n  console.info(2)\n}\n'],
    valid: [],
  },
  {
    rule: 'no-unreachable-loop',
    invalid: ['export function f(xs: number[]) {\n  for (const x of xs) return x\n  return 0\n}\n'],
    valid: [],
  },
  {
    rule: 'no-unsafe-finally',
    invalid: [
      'export function f() {\n  try {\n    return 1\n  } finally {\n    return 2\n  }\n}\n',
    ],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-unused-expressions',
    invalid: [
      'declare const a: number\na + 1\n',
      'declare const a: boolean\ndeclare function f(): void\na && f()\n',
    ],
    valid: ['declare const a: boolean\ndeclare function f(): void\nif (a) f()\n'],
  },
  {
    rule: '@typescript-eslint/no-unused-private-class-members',
    invalid: ['export class A {\n  private x = 1\n}\n', 'export class A {\n  #x = 1\n}\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-unused-vars',
    invalid: [
      'const a = 1\n',
      'export function f(req: string, res: string) {\n  return res\n}\n',
      'export function f(g: () => void) {\n  try {\n    g()\n  } catch (error) {\n    g()\n  }\n}\n',
      'export function f(_x: number) {\n  return _x\n}\n',
    ],
    valid: [
      'export function f(_req: string, res: string) {\n  return res\n}\n',
      'declare const pair: [number, number]\nconst [_first, second] = pair\nexport { second }\n',
      'declare const user: { password: string; name: string }\nconst { password, ...safe } = user\nexport { safe }\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-use-before-define',
    invalid: [
      'export function f() {\n  return CONFIG\n}\nconst CONFIG = 1\n',
      'export const a = new A()\nclass A {}\n',
    ],
    valid: [
      'export function main() {\n  return helper()\n}\nfunction helper() {\n  return 1\n}\n',
      'export type A = { b: B }\ntype B = number\n',
    ],
  },
  {
    rule: 'no-useless-assignment',
    invalid: [
      'declare function load(): number\nexport function f() {\n  let x = load()\n  x = 2\n  return x\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-useless-backreference',
    invalid: [line(String.raw`export const r = /(a)|\1/`)],
    valid: [],
  },
  {
    rule: 'no-useless-call',
    invalid: ['declare function f(a: number): void\nf.call(undefined, 1)\n'],
    valid: [],
  },
  {
    rule: 'no-useless-catch',
    invalid: [
      'export function f(g: () => void) {\n  try {\n    g()\n  } catch (error) {\n    throw error\n  }\n}\n',
    ],
    valid: [],
  },
  {
    rule: 'no-useless-computed-key',
    invalid: ['export const o = { ["a"]: 1 }\n', 'export class A {\n  ["b"] = 1\n}\n'],
    valid: [],
  },
  {
    rule: 'no-useless-concat',
    invalid: ['export const s = "a" + "b"\n'],
    valid: ['export const s =\n  "a long line of text " +\n  "continued here"\n'],
  },
  {
    rule: '@typescript-eslint/no-useless-constructor',
    invalid: ['export class A {\n  constructor() {}\n}\n'],
    valid: [
      'export class A {\n  constructor(private readonly db: string) {}\n  get name() {\n    return this.db\n  }\n}\n',
    ],
  },
  {
    rule: 'no-useless-escape',
    invalid: [line(String.raw`export const r = /\:/`)],
    valid: [],
  },
  {
    rule: 'no-useless-rename',
    invalid: [
      'const o = { a: 1 }\nconst { a: a } = o\nexport { a }\n',
      'const a = 1\nexport { a as a }\n',
    ],
    valid: [],
  },
  {
    rule: 'no-useless-return',
    invalid: ['export function f() {\n  console.info(1)\n  return\n}\n'],
    valid: [],
  },
  {
    rule: 'no-var',
    invalid: ['var a = 1\nexport { a }\n'],
    valid: [],
  },
  {
    rule: 'no-void',
    invalid: ['export const u = void 0\n'],
    valid: ['declare function send(): Promise<void>\nvoid send()\n'],
  },
  {
    rule: 'object-shorthand',
    invalid: [
      'export const obj = { property: function () {\n  return 1\n} }\n',
      'export const obj = { property: () => {\n  return 1\n} }\n',
      'const property = 1\nexport const obj = { property: property }\n',
    ],
    valid: [
      'export const obj = {\n  property() {\n    return 1\n  },\n}\n',
      'function foo() {\n  return 1\n}\nexport const obj = { property: foo }\n',
      'function property() {\n  return 1\n}\nexport const obj = { property }\n',
      'export const obj = {\n  "my-key": function () {\n    return 1\n  },\n}\n',
    ],
  },
  {
    rule: 'one-var',
    invalid: ['let a = 1, b = 2\nexport { a, b }\n'],
    valid: ['for (let i = 0, j = 1; i < j; i += 1) console.info(i, j)\n'],
  },
  {
    rule: 'operator-assignment',
    invalid: ['let x = 1\nx = x + 1\nexport { x }\n'],
    valid: [],
  },
  {
    rule: 'prefer-arrow-callback',
    invalid: ['export const a = [1].map(function (x) {\n  return x\n})\n'],
    valid: ['function double(x: number) {\n  return x * 2\n}\nexport const a = [1].map(double)\n'],
  },
  {
    rule: 'prefer-const',
    invalid: ['let a = 1\nexport { a }\n'],
    valid: ['const o = { a: 1, b: 2 }\nlet { a, b } = o\na += b\nexport { a, b }\n'],
  },
  {
    rule: '@typescript-eslint/prefer-destructuring',
    invalid: [
      'const o = { x: 1 }\nexport const x = o.x\n',
      'const xs = [1, 2]\nexport const first = xs[0]\n',
    ],
    valid: [
      'const user = { id: 1 }\nexport const userId = user.id\n',
      'const o = { x: 1 }\nlet x = 0\nx = o.x\nexport { x }\n',
    ],
  },
  {
    rule: 'prefer-exponentiation-operator',
    invalid: ['export const a = Math.pow(2, 8)\n'],
    valid: [],
  },
  {
    rule: 'prefer-named-capture-group',
    invalid: [line(String.raw`export const r = /(\d{4})/`)],
    valid: [
      line(String.raw`export const r = /(?<year>\d{4})/`),
      line(String.raw`export const r = /(?:\d{4})/`),
    ],
  },
  {
    rule: 'prefer-numeric-literals',
    invalid: ['export const a = Number.parseInt("111", 2)\n'],
    valid: [],
  },
  {
    rule: 'prefer-object-has-own',
    invalid: [
      'const o = { a: 1 }\nexport const h = Object.prototype.hasOwnProperty.call(o, "a")\n',
    ],
    valid: [],
  },
  {
    rule: 'prefer-object-spread',
    invalid: ['const a = { x: 1 }\nexport const b = Object.assign({}, a, { y: 2 })\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/prefer-promise-reject-errors',
    invalid: [
      'export const p = new Promise((_resolve, reject) => {\n  reject("failed")\n})\n',
      'export const p = Promise.reject("failed")\n',
    ],
    valid: ['export const p = Promise.reject(new Error("failed"))\n'],
  },
  {
    rule: 'prefer-regex-literals',
    invalid: ['export const r = new RegExp("abc")\n', 'export const r = new RegExp(/abc/)\n'],
    valid: [],
  },
  {
    rule: 'prefer-rest-params',
    invalid: ['export function f() {\n  return arguments[0]\n}\n'],
    // The rule exempts `arguments.length` by design.
    valid: ['export function f() {\n  return arguments.length\n}\n'],
  },
  {
    rule: 'prefer-spread',
    invalid: [
      'declare function f(...a: number[]): void\ndeclare const args: number[]\nf.apply(null, args)\n',
    ],
    valid: [],
  },
  {
    rule: 'prefer-template',
    invalid: ['declare const x: string\nexport const a = "id-" + x\n'],
    valid: [],
  },
  {
    rule: 'preserve-caught-error',
    invalid: [
      'export function h(f: () => void) {\n  try {\n    f()\n  } catch (error) {\n    console.info(error)\n    throw new Error("load failed")\n  }\n}\n',
      'export function h(f: () => void) {\n  try {\n    f()\n  } catch {\n    throw new Error("load failed")\n  }\n}\n',
    ],
    valid: [
      'export function h(f: () => void) {\n  try {\n    f()\n  } catch (error) {\n    throw new Error("load failed", { cause: error })\n  }\n}\n',
      'export function h(f: () => number) {\n  try {\n    return f()\n  } catch {\n    return 1\n  }\n}\n',
    ],
  },
  {
    rule: 'radix',
    invalid: ['export const n = Number.parseInt("08")\n'],
    valid: [],
  },
  {
    rule: 'require-atomic-updates',
    invalid: [
      'declare function g(x: number): Promise<number>\nexport async function f(xs: number[]) {\n  let total = 0\n  await Promise.all(\n    xs.map(async (x) => {\n      total += await g(x)\n    }),\n  )\n  return total\n}\n',
    ],
    valid: [],
  },
  {
    rule: '@typescript-eslint/require-await',
    invalid: ['export async function f() {\n  return 1\n}\n'],
    valid: [],
  },
  {
    rule: 'require-unicode-regexp',
    invalid: ['export const r = /a/\n'],
    valid: ['export const r = /a/u\n', 'export const r = /a/v\n'],
  },
  {
    rule: 'require-yield',
    invalid: ['export function* g() {\n  return 1\n}\n'],
    valid: [],
  },
  {
    rule: 'sort-imports',
    invalid: ['import { join, dirname } from "node:path"\nexport { dirname, join }\n'],
    valid: [
      'import { readFile } from "node:fs/promises"\nimport { dirname, join } from "node:path"\nexport { dirname, join, readFile }\n',
    ],
  },
  {
    rule: 'strict',
    invalid: ['"use strict"\nexport const a = 1\n'],
    valid: [],
  },
  {
    rule: 'symbol-description',
    invalid: ['export const s = Symbol()\n'],
    valid: ['export const s = Symbol("cache-key")\n'],
  },
  {
    rule: 'unicode-bom',
    invalid: [`${String.fromCodePoint(0xfeff)}export const a = 1\n`],
    valid: [],
  },
  {
    rule: 'use-isnan',
    invalid: [
      'declare const x: number\nswitch (x) {\n  case NaN:\n    break\n}\n',
      'declare const xs: number[]\nexport const i = xs.indexOf(NaN)\n',
    ],
    valid: ['declare const xs: number[]\nexport const i = xs.findIndex(Number.isNaN)\n'],
  },
  {
    rule: 'yoda',
    invalid: [
      'declare const color: string\nexport const red = "red" === color\n',
      // `exceptRange` only covers a range directly inside parentheses, such as an `if` condition.
      'declare const x: number\nexport const inRange = 0 <= x && x < 10\n',
    ],
    valid: ['declare const x: number\nif (0 <= x && x < 10) console.info(x)\n'],
  },
])

describeRules([...base, ...react], 'src/lint-jsx.tsx', [
  {
    rule: 'no-irregular-whitespace',
    invalid: [`export const A = () => <p>a${NBSP}b</p>\n`],
    valid: ['export const A = () => <p>a&nbsp;b</p>\n'],
  },
])
