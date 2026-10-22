import { UNIT_TEST_FILES, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import test from '../../src/test.ts'

import { describeRules } from './cases.ts'

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/consistent-return',
    invalid: [
      'export function f(x: boolean) {\n  if (x) return 1\n  return\n}\n',
      'export function f(x: boolean) {\n  if (x) return 1\n}\n',
    ],
    valid: [
      'export async function f(x: boolean): Promise<void> {\n  if (x) return\n  await Promise.resolve()\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-implied-eval',
    invalid: [
      "setTimeout('alert(1)')\n",
      'declare const code: string\nsetTimeout(code)\n',
      "export const f = new Function('return 1')\n",
    ],
    valid: ['setTimeout(() => {\n  console.info(1)\n})\n'],
  },
])

const WRONG = 'export const a: number = "x"\n'

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/adjacent-overload-signatures',
    invalid: ['export interface A {\n  f(x: string): void\n  g(): void\n  f(x: number): void\n}\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/array-type',
    invalid: ['export type A = (string | number)[]\n', 'export type B = Array<string>\n'],
    valid: ['export type A = Array<string | number>\nexport type B = string[]\n'],
  },
  {
    rule: '@typescript-eslint/await-thenable',
    invalid: ['export async function f() {\n  return await 5\n}\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/ban-ts-comment',
    invalid: [
      `// @ts-expect-error: the fixture types this as string\n${WRONG}`,
      `// @ts-expect-error -- short\n${WRONG}`,
      `// @ts-expect-error\n${WRONG}`,
      `// @ts-ignore -- the fixture types this as string\n${WRONG}`,
      `// @ts-nocheck -- the whole file is generated\n${WRONG}`,
    ],
    valid: [`// @ts-expect-error -- the fixture types this as string\n${WRONG}`],
  },
  {
    rule: '@typescript-eslint/ban-tslint-comment',
    invalid: ['// tslint:disable-next-line\nexport const a = 1\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/class-literal-property-style',
    invalid: ['export class A {\n  get kind() {\n    return "user"\n  }\n}\n'],
    valid: ['export class A {\n  readonly kind = "user"\n}\n'],
  },
  {
    rule: '@typescript-eslint/class-methods-use-this',
    invalid: ['export class A {\n  f() {\n    return 1\n  }\n}\n'],
    valid: [
      'interface Runner {\n  run(): number\n}\nexport class A implements Runner {\n  run() {\n    return 1\n  }\n}\n',
      'class Base {\n  n = 0\n  f() {\n    return this.n\n  }\n}\nexport class A extends Base {\n  override f() {\n    return 1\n  }\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/consistent-generic-constructors',
    invalid: ['export const m: Map<string, number> = new Map()\n'],
    valid: ['export const m = new Map<string, number>()\n'],
  },
  {
    rule: '@typescript-eslint/consistent-indexed-object-style',
    invalid: ['export type A = { [key: string]: number }\n'],
    valid: ['export type A = Record<string, number>\n'],
  },
  {
    rule: '@typescript-eslint/consistent-type-assertions',
    invalid: [
      'type Foo = { a: number }\nexport const x = { a: 1 } as Foo\n',
      'export const xs = [1] as number[]\n',
    ],
    valid: [
      'type Foo = { a: number }\nexport const x = { a: 1 } satisfies Foo\n',
      'export const x = { a: 1 } as const\n',
    ],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  {
    rule: '@typescript-eslint/consistent-type-assertions',
    invalid: ['export const xs = [1] as number[]\n'],
    valid: ['type User = { id: number; name: string }\nexport const u = { id: 1 } as User\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/consistent-type-imports',
    invalid: ['import { Linter } from "eslint"\nexport type C = Linter.Config\n'],
    valid: ['import type { Linter } from "eslint"\nexport type C = Linter.Config\n'],
  },
  {
    rule: '@typescript-eslint/default-param-last',
    invalid: ['export function f(a = 1, b: number) {\n  return a + b\n}\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/dot-notation',
    invalid: ['const o = { a: 1 }\nexport const v = o["a"]\n'],
    valid: ['declare const o: Record<string, number>\nexport const v = o["key"]\n'],
  },
  {
    rule: '@typescript-eslint/explicit-member-accessibility',
    invalid: ['export class A {\n  public f(): number {\n    return 1\n  }\n}\n'],
    valid: ['export class A {\n  constructor(public readonly name: string) {}\n}\n'],
  },
  {
    rule: '@typescript-eslint/method-signature-style',
    invalid: ['export type A = {\n  f(x: number): void\n}\n'],
    valid: ['export type A = {\n  f: (x: number) => void\n}\n'],
  },
  {
    rule: '@typescript-eslint/naming-convention',
    invalid: [
      'export const user_name = "a"\n',
      'export const _hidden = 1\n',
      'export function get_user(): number {\n  return 1\n}\n',
      'export type userId = string\n',
      'export class A {\n  my_field = 1\n}\n',
      'export function f(user_id: number): number {\n  return user_id\n}\n',
    ],
    valid: [
      'export const userName = "a"\nexport const MAX_SIZE = 10\nexport const Role = { Admin: "admin" } as const\n',
      'export function Button(): null {\n  return null\n}\n',
      'export type UserId = string\n',
      'export function f(_unused: number, used: number): number {\n  return used\n}\n',
      'declare const row: { created_at: string }\nexport const { created_at } = row\n',
      'export const headers = { "Content-Type": "json", user_id: 1 }\nexport type Row = { created_at: string }\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-array-constructor',
    invalid: [
      'export const xs = new Array(1, 2)\n',
      'export const ys = Array(0, 1)\n',
      'export const zs = new Array()\n',
    ],
    // A single argument is a length, which an array literal can't express.
    valid: ['export const xs = [1, 2]\nexport const ys = Array(3)\n'],
  },
  {
    rule: '@typescript-eslint/no-array-delete',
    invalid: ['const xs = [1, 2]\ndelete xs[0]\nexport { xs }\n'],
    valid: ['const xs = [1, 2]\nxs.splice(0, 1)\nexport { xs }\n'],
  },
  {
    rule: '@typescript-eslint/no-base-to-string',
    invalid: [
      'const o = { a: 1 }\nexport const s = String(o)\n',
      'declare const u: unknown\nexport const s = String(u)\n',
    ],
    valid: [
      'export const s = String(new Error("x"))\nexport const t = String(new URL("https://a.b"))\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-confusing-non-null-assertion',
    invalid: ['declare const a: number | undefined\nexport const b = a! == 1\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-confusing-void-expression',
    invalid: [
      'declare function log(): void\nexport const x = log()\n',
      'declare function log(): void\nexport function f(): number {\n  return log()\n}\n',
    ],
    valid: [
      'declare function on(cb: () => void): void\nexport function f(set: (v: boolean) => void): void {\n  on(() => set(true))\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-deprecated',
    invalid: [
      '/** @deprecated Use `next` instead. */\nfunction old(): number {\n  return 1\n}\nexport const v = old()\n',
    ],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-duplicate-type-constituents',
    invalid: ['export type A = string | string\n', 'export type B = { a: 1 } & { a: 1 }\n'],
    valid: ['export type A = string | number\n'],
  },
  {
    rule: '@typescript-eslint/no-dynamic-delete',
    invalid: [
      'declare const key: string\nconst o: Record<string, number> = {}\ndelete o[key]\nexport { o }\n',
    ],
    valid: ['const o: { a?: number } = {}\ndelete o["a"]\nexport { o }\n'],
  },
  {
    rule: '@typescript-eslint/no-empty-object-type',
    invalid: ['export type A = {}\n', 'export const f = (x: {}): unknown => x\n'],
    valid: [
      'type Custom<R> = { toBeFoo: () => R }\ndeclare module "vitest" {\n  interface Assertion<T> extends Custom<T> {}\n}\nexport {}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-explicit-any',
    invalid: [
      'export const f = (x: any): unknown => x\n',
      'export function g(...xs: any[]): number {\n  return xs.length\n}\n',
    ],
    valid: ['export const f = (x: unknown): unknown => x\n'],
  },
  {
    rule: '@typescript-eslint/no-extra-non-null-assertion',
    invalid: ['declare const a: { b: number } | undefined\nexport const c = a!!.b\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-extraneous-class',
    invalid: [
      'export class Empty {}\n',
      'export class Util {\n  static double(n: number): number {\n    return n * 2\n  }\n}\n',
      'export class OnlyCtor {\n  constructor() {\n    console.info("x")\n  }\n}\n',
    ],
    valid: ['export class Counter {\n  count = 0\n}\n'],
  },
  {
    rule: '@typescript-eslint/no-floating-promises',
    invalid: [
      'declare function load(): Promise<number>\nexport function f(): void {\n  load()\n}\n',
      // Reported only with `checkThenables`: a `PromiseLike` is not a `Promise`.
      'declare function query(): PromiseLike<number>\nexport function f(): void {\n  query()\n}\n',
    ],
    valid: [
      'declare function load(): Promise<number>\nexport function f(): void {\n  void load()\n}\n',
      'declare function load(): Promise<number>\nexport async function f(): Promise<void> {\n  await load()\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-generated-empty-object-type',
    invalid: ['type User = { id: number }\nexport type None = Omit<User, "id">\n'],
    valid: ['type User = { id: number; name: string }\nexport type NameOnly = Omit<User, "id">\n'],
  },
  {
    rule: '@typescript-eslint/no-import-type-side-effects',
    invalid: ['import { type Linter } from "eslint"\nexport type C = Linter.Config\n'],
    valid: ['import type { Linter } from "eslint"\nexport type C = Linter.Config\n'],
  },
  {
    rule: '@typescript-eslint/no-inferrable-types',
    invalid: [
      'export const n: number = 1\n',
      'export function f(a: number = 1): number {\n  return a\n}\n',
    ],
    valid: ['export const n = 1\n'],
  },
  {
    rule: '@typescript-eslint/member-ordering',
    invalid: ['export class A {\n  f(): number {\n    return this.x\n  }\n  x = 1\n}\n'],
    valid: [
      'export class A {\n  #v = 1\n  get v(): number {\n    return this.#v\n  }\n  set v(n: number) {\n    this.#v = n\n  }\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-invalid-void-type',
    invalid: [
      'export type A = string | void\n',
      'export function f(this: void): number {\n  return 1\n}\n',
    ],
    valid: ['export type A = Promise<void>\n'],
  },
  {
    rule: '@typescript-eslint/no-meaningless-void-operator',
    invalid: [
      'declare function log(): void\nexport function f(): void {\n  void log()\n}\n',
      'declare function fail(): never\nexport function f(): void {\n  void fail()\n}\n',
    ],
    valid: [
      'declare function load(): Promise<number>\nexport function f(): void {\n  void load()\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-misused-new',
    invalid: [
      'export type A = {\n  new (): A\n}\nexport declare class B {\n  constructor(): void\n  new(): B\n}\n',
    ],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-misused-promises',
    invalid: [
      'declare function load(): Promise<boolean>\nexport function f(): number {\n  if (load()) return 1\n  return 0\n}\n',
      // `flagUnions: 'strict'`: a maybe-promise of the same type is a missing `await`.
      'declare const ready: Promise<boolean> | boolean\nexport const n = ready ? 1 : 0\n',
      'declare function load(): Promise<number>\nexport const xs = [1].forEach(async () => {\n  await load()\n})\n',
      'declare const p: Promise<{ a: number }>\nexport const o = { ...p }\n',
    ],
    // Checking whether a promise is pending is not a missing `await`.
    valid: [
      'declare const pending: Promise<void> | undefined\nexport const busy = pending ? 1 : 0\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-misused-spread',
    invalid: [
      'export const chars = [..."abc"]\n',
      'declare const m: Map<string, number>\nexport const o = { ...m }\n',
    ],
    valid: ['export const o = { ...{ a: 1 } }\n'],
  },
  {
    rule: '@typescript-eslint/no-namespace',
    invalid: ['export namespace Util {\n  export const a = 1\n}\n'],
    valid: [
      'declare global {\n  namespace Express {\n    type Locals = { userId: string }\n  }\n}\nexport {}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-non-null-asserted-nullish-coalescing',
    /*
     * A bare identifier is reported only after a write to it, so `let x!: T` patterns
     * aren't flagged; a call result has no such exemption.
     */
    invalid: ['declare function find(): string | undefined\nexport const b = find()! ?? "x"\n'],
    valid: ['declare function find(): string | undefined\nexport const b = find() ?? "x"\n'],
  },
  {
    rule: '@typescript-eslint/no-non-null-asserted-optional-chain',
    invalid: ['declare const a: { b: string } | undefined\nexport const c = a?.b!\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-non-null-assertion',
    invalid: ['declare const a: string | undefined\nexport const b = a!\n'],
    valid: [],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  {
    rule: '@typescript-eslint/no-non-null-assertion',
    invalid: [],
    valid: ['declare const a: string | undefined\nexport const b = a!\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/no-redundant-type-constituents',
    invalid: ['export type A = "a" | string\n', 'export type B = unknown | number\n'],
    valid: ['export type A = "a" | "b"\n'],
  },
  {
    rule: '@typescript-eslint/no-require-imports',
    invalid: ['export const fs: unknown = require("node:fs")\n'],
    valid: [
      'import { createRequire } from "node:module"\nconst require = createRequire(import.meta.url)\nexport const pkg: unknown = require("./package.json")\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-this-alias',
    invalid: [
      'export class A {\n  n = 1\n  f(): () => number {\n    const self = this\n    return () => self.n\n  }\n}\n',
    ],
    valid: [
      'export class A {\n  n = 1\n  f(): number {\n    const { n } = this\n    return n\n  }\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-boolean-literal-compare',
    invalid: ['declare const ready: boolean\nexport const ok = ready === true\n'],
    // On a nullable boolean the comparison distinguishes `true` from absent.
    valid: ['declare const ready: boolean | undefined\nexport const ok = ready === true\n'],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-condition',
    invalid: [
      'declare const s: string\nexport const n = s ?? "x"\n',
      'declare const o: { a: number }\nexport const a = o?.a\n',
      // `checkTypePredicates`: the argument is already a string.
      'declare function isString(x: unknown): x is string\ndeclare const s: string\nexport const ok = isString(s)\n',
    ],
    valid: [
      'declare function next(): number | undefined\nexport function drain(): void {\n  while (true) {\n    if (next() === undefined) break\n  }\n}\n',
      'declare const s: string | undefined\nexport const n = s ?? "x"\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-parameter-property-assignment',
    invalid: ['export class A {\n  constructor(public n: number) {\n    this.n = n\n  }\n}\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-qualifier',
    invalid: [
      'declare global {\n  namespace App {\n    type Id = string\n    type User = { id: App.Id }\n  }\n}\nexport {}\n',
    ],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-template-expression',
    // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
    invalid: ['declare const name: string\nexport const s = `${name}`\n'],
    // eslint-disable-next-line no-template-curly-in-string -- snippet is source code holding a template literal
    valid: ['declare const name: string\nexport const s = `hi ${name}`\n'],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-type-arguments',
    invalid: ['declare function f<T = string>(): T\nexport const v = f<string>()\n'],
    valid: ['declare function f<T = string>(): T\nexport const v = f<number>()\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/no-unnecessary-type-assertion',
    invalid: [
      'declare const s: string\nexport const t = s as string\n',
      // `checkLiteralConstAssertions`
      'export const a = "a" as const\n',
    ],
    valid: ['export const o = { a: "a" } as const\n'],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-type-constraint',
    invalid: ['export function f<T extends unknown>(x: T): T {\n  return x\n}\n'],
    valid: ['export function f<T>(x: T): T {\n  return x\n}\n'],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-type-conversion',
    invalid: ['declare const s: string\nexport const t = String(s)\n'],
    valid: ['declare const n: number\nexport const t = String(n)\n'],
  },
  {
    rule: '@typescript-eslint/no-unnecessary-type-parameters',
    invalid: ['export function f<T>(x: T): void {\n  console.info(x)\n}\n'],
    valid: ['export function f<T>(x: T): T {\n  return x\n}\n'],
  },
  {
    rule: '@typescript-eslint/no-unsafe-argument',
    invalid: ['declare const raw: any\ndeclare function f(n: number): void\nf(raw)\n'],
    valid: ['declare const raw: unknown\ndeclare function f(n: unknown): void\nf(raw)\n'],
  },
  {
    rule: '@typescript-eslint/no-unsafe-assignment',
    invalid: ['export const data: { id: number } = JSON.parse("{}")\n'],
    valid: ['export const data: unknown = JSON.parse("{}")\n'],
  },
  {
    rule: '@typescript-eslint/no-unsafe-call',
    invalid: ['declare const raw: any\nraw()\n'],
    valid: [],
  },
  {
    rule: '@typescript-eslint/no-unsafe-declaration-merging',
    invalid: [
      'declare global {\n  interface Store {\n    size: number\n  }\n  class Store {}\n}\nexport {}\n',
    ],
    valid: [],
  },
])

// Enums are banned locally, so these run against a dependency's enum.
describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/no-unsafe-enum-assignment',
    invalid: ['import ts from "typescript"\nexport const kind: ts.SyntaxKind = 80\n'],
    valid: [
      'import ts from "typescript"\nexport const kind: ts.SyntaxKind = ts.SyntaxKind.Identifier\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-unsafe-enum-comparison',
    invalid: [
      'import ts from "typescript"\ndeclare const kind: ts.SyntaxKind\nexport const isId = kind === 80\n',
    ],
    valid: [
      'import ts from "typescript"\ndeclare const kind: ts.SyntaxKind\nexport const isId = kind === ts.SyntaxKind.Identifier\n',
    ],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/no-unsafe-function-type',
    invalid: ['export type Handler = Function\n'],
    valid: ['export type Handler = () => void\n'],
  },
  {
    rule: '@typescript-eslint/no-unsafe-member-access',
    invalid: [
      'declare const raw: any\nexport const id = raw.id\n',
      'declare const raw: any\nexport const id = raw?.id\n',
    ],
    valid: ['declare const raw: { id: number }\nexport const id = raw.id\n'],
  },
  {
    rule: '@typescript-eslint/no-unsafe-return',
    invalid: ['export function parse(s: string): { id: number } {\n  return JSON.parse(s)\n}\n'],
    valid: ['export function parse(s: string): unknown {\n  return JSON.parse(s)\n}\n'],
  },
  {
    rule: '@typescript-eslint/no-unsafe-type-assertion',
    invalid: [
      'type User = { id: number }\ntype Admin = User & { root: true }\ndeclare const user: User\nexport const admin = user as Admin\n',
      'export const data = JSON.parse("{}") as { id: number }\n',
    ],
    valid: [
      'type User = { id: number }\ntype Admin = User & { root: true }\ndeclare const admin: Admin\nexport const user = admin as User\n',
      'export const roles = ["admin", "user"] as const\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-unsafe-unary-minus',
    invalid: ['declare const s: string\nexport const n = -s\n'],
    valid: ['declare const n: number\nexport const m = -n\n'],
  },
  {
    rule: '@typescript-eslint/no-useless-default-assignment',
    invalid: ['declare const o: { a: number }\nexport const { a = 1 } = o\n'],
    valid: ['declare const o: { a?: number }\nexport const { a = 1 } = o\n'],
  },
  {
    rule: '@typescript-eslint/no-useless-empty-export',
    invalid: ['export const a = 1\nexport {}\n'],
    valid: ['export const a = 1\n', 'export {}\n'],
  },
  {
    rule: '@typescript-eslint/no-wrapper-object-types',
    invalid: ['export type S = String\n', 'export type Boxed = Number\n'],
    // Only type positions are checked; the conversion functions are values.
    valid: ['export const id = Symbol("sth")\nexport const n = Number("42")\n'],
  },
  {
    rule: '@typescript-eslint/non-nullable-type-assertion-style',
    invalid: [],
    valid: ['declare const s: string | undefined\nexport const t = s as string\n'],
  },
  {
    rule: '@typescript-eslint/parameter-properties',
    invalid: [
      'export class Repo {\n  constructor(private readonly db: string) {}\n}\n',
      'export class Repo {\n  constructor(readonly db: string) {}\n}\n',
    ],
    valid: [
      'export class Repo {\n  readonly #db: string\n  constructor(db: string) {\n    this.#db = db\n  }\n  get name(): string {\n    return this.#db\n  }\n}\n',
    ],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/prefer-as-const',
    invalid: ['export const mode: "dark" = "dark"\n', 'export const mode = "dark" as "dark"\n'],
    valid: ['export const modes = ["dark", "light"] as const\n'],
  },
  {
    rule: '@typescript-eslint/prefer-enum-initializers',
    invalid: ['export enum Status {\n  Open,\n  Closed,\n}\n'],
    valid: ['export enum Status {\n  Open = "open",\n  Closed = "closed",\n}\n'],
  },
  {
    rule: '@typescript-eslint/prefer-find',
    invalid: ['declare const xs: number[]\nexport const first = xs.filter((x) => x > 1)[0]\n'],
    valid: ['declare const xs: number[]\nexport const first = xs.find((x) => x > 1)\n'],
  },
  {
    rule: '@typescript-eslint/prefer-for-of',
    invalid: [
      'declare const xs: number[]\nfor (let i = 0; i < xs.length; i++) {\n  console.info(xs[i])\n}\n',
    ],
    // `i` is used for more than indexing.
    valid: [
      'declare const xs: number[]\nfor (let i = 0; i < xs.length; i++) {\n  console.info(i, xs[i])\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/prefer-function-type',
    invalid: ['export type Format = { (n: number): string }\n'],
    valid: ['export type Format = { (n: number): string; locale: string }\n'],
  },
  {
    rule: '@typescript-eslint/prefer-includes',
    invalid: [
      'declare const s: string\nexport const has = s.indexOf("a") !== -1\n',
      'declare const s: string\nexport const has = /abc/.test(s)\n',
    ],
    valid: ['declare const s: string\nexport const has = s.includes("a")\n'],
  },
  {
    rule: '@typescript-eslint/prefer-literal-enum-member',
    invalid: ['export enum Access {\n  Read = 1 << 0,\n}\n'],
    valid: ['export enum Access {\n  Read = 1,\n}\n'],
  },
  {
    rule: '@typescript-eslint/prefer-namespace-keyword',
    invalid: [],
    valid: ['declare module Legacy {\n  const version: string\n}\nexport {}\n'],
  },
  {
    rule: '@typescript-eslint/prefer-nullish-coalescing',
    invalid: [
      'declare const count: number | undefined\nexport const n = count || 10\n',
      'declare const name: string | undefined\nexport const label = name !== undefined ? name : "anonymous"\n',
    ],
    valid: [
      'declare const a: string | undefined\ndeclare const b: boolean\nif (a || b) console.info(a)\n',
    ],
  },
  {
    rule: '@typescript-eslint/prefer-optional-chain',
    invalid: [
      'declare const user: { address?: { city: string } } | undefined\nexport const city = user && user.address && user.address.city\n',
    ],
    valid: [
      'declare const user: { address?: { city: string } } | undefined\nexport const city = user?.address?.city\n',
    ],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/prefer-readonly',
    invalid: [
      'export class Counter {\n  #step = 1\n  next(n: number): number {\n    return n + this.#step\n  }\n}\n',
    ],
    valid: [
      'export class Counter {\n  readonly #step = 1\n  next(n: number): number {\n    return n + this.#step\n  }\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/prefer-readonly-parameter-types',
    invalid: [],
    valid: ['export function total(xs: number[]): number {\n  return xs.length\n}\n'],
  },
  {
    rule: '@typescript-eslint/prefer-reduce-type-parameter',
    invalid: [
      'declare const xs: number[]\nexport const s = xs.reduce((acc, x) => [...acc, String(x)], [] as string[])\n',
    ],
    valid: [
      'declare const xs: number[]\nexport const s = xs.reduce<string[]>((acc, x) => [...acc, String(x)], [])\n',
    ],
  },
  {
    rule: '@typescript-eslint/prefer-regexp-exec',
    invalid: ['declare const s: string\nexport const m = s.match(/a(b)/)\n'],
    valid: ['declare const s: string\nexport const m = /a(b)/.exec(s)\n'],
  },
  {
    rule: '@typescript-eslint/prefer-return-this-type',
    invalid: [
      'export class Builder {\n  #parts: string[] = []\n  add(p: string): Builder {\n    this.#parts.push(p)\n    return this\n  }\n}\n',
    ],
    valid: [
      'export class Builder {\n  #parts: string[] = []\n  add(p: string): this {\n    this.#parts.push(p)\n    return this\n  }\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/prefer-string-starts-ends-with',
    invalid: [
      'declare const s: string\nexport const a = s.indexOf("x") === 0\n',
      'declare const s: string\nexport const a = s[0] === "x"\n',
    ],
    valid: ['declare const s: string\nexport const a = s.startsWith("x")\n'],
  },
  {
    rule: '@typescript-eslint/promise-function-async',
    invalid: [
      'declare function load(): Promise<number>\nexport function f() {\n  return load()\n}\n',
      'declare function load(): Promise<number>\nexport const all = Promise.all([1, 2].map(() => load()))\n',
    ],
    valid: [
      'declare function load(): Promise<number>\nexport async function f(): Promise<number> {\n  return load()\n}\n',
      // `allowAny: true`: a sync function returning `unknown` stays sync.
      'export function parse(s: string): unknown {\n  return JSON.parse(s)\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/related-getter-setter-pairs',
    invalid: [
      'export class Box {\n  #v = 0\n  get v(): string {\n    return String(this.#v)\n  }\n  set v(n: number) {\n    this.#v = n\n  }\n}\n',
    ],
    valid: [
      'export class Box {\n  #v = 0\n  get v(): number {\n    return this.#v\n  }\n  set v(n: number) {\n    this.#v = n\n  }\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/require-array-sort-compare',
    invalid: [
      'declare const ns: number[]\nexport const s = ns.toSorted()\n',
      'declare const names: string[]\nexport const s = names.toSorted()\n',
    ],
    valid: [
      'declare const names: string[]\nexport const s = names.toSorted((a, b) => a.localeCompare(b))\n',
    ],
  },
  {
    rule: '@typescript-eslint/restrict-plus-operands',
    invalid: [
      'declare const n: number\nexport const s = "n=" + n\n',
      'declare const s: string | undefined\nexport const t = "x" + s\n',
    ],
    valid: ['declare const a: string\ndeclare const b: string\nexport const s = a + b\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  /* eslint-disable no-template-curly-in-string -- the snippets are source code holding template literals */
  {
    rule: '@typescript-eslint/restrict-template-expressions',
    invalid: [
      'declare const name: string | undefined\nexport const s = `hi ${name}`\n',
      'declare const ids: number[]\nexport const s = `ids ${ids}`\n',
      'declare const ok: boolean\nexport const s = `ok ${ok}`\n',
    ],
    valid: [
      'declare const count: number\nexport const s = `${count} items`\n',
      'declare const url: URL\nexport const s = `see ${url}`\n',
    ],
  },
  /* eslint-enable no-template-curly-in-string */
  {
    rule: '@typescript-eslint/return-await',
    invalid: [
      'declare function load(): Promise<number>\nexport async function f(): Promise<number> {\n  return load()\n}\n',
    ],
    valid: [
      'declare function load(): Promise<number>\nexport async function f(): Promise<number> {\n  return await load()\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/strict-boolean-expressions',
    invalid: [
      'declare const s: string\nif (s) console.info(s)\n',
      'declare const xs: number[]\nif (xs.length) console.info(xs)\n',
      'declare const flag: boolean | undefined\nif (flag) console.info(flag)\n',
    ],
    valid: [
      'declare const user: { id: number } | undefined\nif (user) console.info(user.id)\n',
      'declare const s: string\nif (s !== "") console.info(s)\n',
    ],
  },
  {
    rule: '@typescript-eslint/strict-void-return',
    invalid: [
      'declare const xs: number[]\nconst out: number[] = []\nxs.forEach((x) => out.push(x))\n',
    ],
    valid: [
      'declare const xs: number[]\nconst out: number[] = []\nxs.forEach((x) => {\n  out.push(x)\n})\n',
    ],
  },
  {
    rule: '@typescript-eslint/switch-exhaustiveness-check',
    invalid: [
      'declare const k: "a" | "b"\nswitch (k) {\n  case "a":\n    break\n  default:\n    break\n}\n',
      'declare const n: number\nswitch (n) {\n  case 1:\n    break\n}\n',
    ],
    valid: [
      'declare const k: "a" | "b"\nswitch (k) {\n  case "a":\n    break\n  case "b":\n    break\n  default:\n    throw new Error("unreachable")\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/triple-slash-reference',
    invalid: [
      '/// <reference lib="dom" />\nexport {}\n',
      '/// <reference path="./a.ts" />\nexport {}\n',
    ],
    valid: ['/// <reference types="node" />\nexport {}\n'],
  },
  {
    rule: '@typescript-eslint/unbound-method',
    invalid: [
      'class Repo {\n  save(): void {\n    console.info(this)\n  }\n}\nexport const save = new Repo().save\n',
    ],
    valid: [
      'class Repo {\n  save(): void {\n    console.info(this)\n  }\n}\nconst repo = new Repo()\nexport const save = (): void => {\n  repo.save()\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/unified-signatures',
    invalid: [
      'export function f(a: string): void\nexport function f(a: number): void\nexport function f(a: unknown): void {\n  console.info(a)\n}\n',
    ],
    valid: ['export function f(a: string | number): void {\n  console.info(a)\n}\n'],
  },
  {
    rule: '@typescript-eslint/use-unknown-in-catch-callback-variable',
    invalid: [
      'declare const p: Promise<number>\nexport const q = p.catch((err) => {\n  console.error(err)\n})\n',
    ],
    valid: [
      'declare const p: Promise<number>\nexport const q = p.catch((err: unknown) => {\n  console.error(err)\n})\n',
    ],
  },
])
