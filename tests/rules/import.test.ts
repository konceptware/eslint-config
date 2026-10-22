import { UNIT_TEST_FILES, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import test from '../../src/test.ts'

import { describeRules } from './cases.ts'

const ELEVEN_BUILTINS = [
  'fs',
  'path',
  'os',
  'url',
  'util',
  'events',
  'stream',
  'crypto',
  'zlib',
  'http',
  'https',
]

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'import-x/consistent-type-specifier-style',
    invalid: [
      'import { type Linter, ESLint } from "eslint"\nexport const x: Linter.Config = {}\nexport const y = ESLint\n',
    ],
    valid: [
      'import { ESLint } from "eslint"\nimport type { Linter } from "eslint"\nexport const x: Linter.Config = {}\nexport const y = ESLint\n',
    ],
  },
  // Off in TS files: tsc reports a missing default or named export and duplicate export names.
  {
    rule: 'import-x/default',
    invalid: [],
    valid: ['import parse from "./helpers.ts"\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/named',
    invalid: [],
    valid: ['import { nope } from "./helpers.ts"\nexport const n = nope\n'],
  },
  {
    rule: 'import-x/export',
    invalid: [],
    valid: ['export const y = 1\nconst z = 2\nexport { z as y }\n'],
  },
  {
    rule: 'import-x/dynamic-import-chunkname',
    invalid: [],
    valid: ['export const load = async (): Promise<unknown> => await import("./helpers.ts")\n'],
  },
  {
    rule: 'import-x/exports-last',
    invalid: [],
    valid: [
      'export function f(): number {\n  return g()\n}\n\nfunction g(): number {\n  return 1\n}\n',
    ],
  },
  {
    rule: 'import-x/extensions',
    invalid: [],
    valid: ['import { parse } from "./helpers"\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/first',
    invalid: ['console.info("x")\nimport { parse } from "./helpers.ts"\nexport const n = parse\n'],
    valid: ['import { parse } from "./helpers.ts"\nconsole.info("x")\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/group-exports',
    invalid: [],
    valid: ['export const a = 1\nexport const b = 2\n'],
  },
  {
    rule: 'import-x/max-dependencies',
    invalid: [],
    valid: [`${ELEVEN_BUILTINS.map((name) => `import "node:${name}"`).join('\n')}\nexport {}\n`],
  },
])

// JS files get no tsc checking, so the export-existence rules run there.
describeRules(base, 'src/lint-text.js', [
  // Off in JS too: under the fixture's implied `esModuleInterop` every module gets a synthetic default.
  {
    rule: 'import-x/default',
    invalid: [],
    valid: ['import parse from "./helpers.ts"\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/named',
    invalid: ['import { nope } from "./helpers.ts"\nexport const n = nope\n'],
    valid: ['import { parse } from "./helpers.ts"\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/export',
    invalid: ['export const y = 1\nconst z = 2\nexport { z as y }\n'],
    valid: ['export const y = 1\n'],
  },
  {
    rule: 'import-x/namespace',
    invalid: ['import * as helpers from "./helpers.ts"\nexport const n = helpers.nope\n'],
    valid: ['import * as helpers from "./helpers.ts"\nexport const n = helpers.parse\n'],
  },
  {
    rule: 'import-x/no-deprecated',
    invalid: ['import { parseLegacy } from "./helpers.ts"\nexport const n = parseLegacy\n'],
    valid: ['import { parse } from "./helpers.ts"\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/no-named-as-default-member',
    invalid: ['import greeter from "./greeter.ts"\n\nexport const g = greeter.greet\n'],
    valid: ['import { greet } from "./greeter.ts"\n\nexport const g = greet\n'],
  },
])

describeRules(base, 'scripts/lint-text.cjs', [
  {
    rule: 'import-x/named',
    invalid: ['const { nope } = require("../src/helpers.ts")\n\nmodule.exports = { nope }\n'],
    valid: ['const { parse } = require("../src/helpers.ts")\n\nmodule.exports = { parse }\n'],
  },
  {
    rule: 'import-x/no-commonjs',
    invalid: [],
    valid: ['const { parse } = require("../src/helpers.ts")\n\nmodule.exports = { parse }\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  // Off in TS files: tsc reports a missing namespace member.
  {
    rule: 'import-x/namespace',
    invalid: [],
    valid: ['import * as helpers from "./helpers.ts"\n\nexport const n = helpers.nope\n'],
  },
  {
    rule: 'import-x/newline-after-import',
    invalid: [
      'import { parse } from "./helpers.ts"\nexport const n = parse\n',
      'import { parse } from "./helpers.ts"\n\n\nexport const n = parse\n',
      'import { parse } from "./helpers.ts"\n// parses input\nexport const n = parse\n',
    ],
    valid: ['import { parse } from "./helpers.ts"\n\n// parses input\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/no-absolute-path',
    invalid: ['import { parse } from "/src/helpers.ts"\n\nexport const n = parse\n'],
    valid: ['import { parse } from "./helpers.ts"\n\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/no-amd',
    invalid: [
      'declare function define(deps: string[], f: () => void): void\ndefine(["a"], () => {})\n',
    ],
    valid: [],
  },
  {
    rule: 'import-x/no-anonymous-default-export',
    invalid: ['export default () => 1\n', 'export default [1]\n', 'export default class {}\n'],
    valid: [
      'declare function defineConfig(c: object): object\nexport default defineConfig({})\n',
      'const config = [1]\nexport default config\n',
    ],
  },
  {
    rule: 'import-x/no-commonjs',
    invalid: ['module.exports = { a: 1 }\n'],
    valid: ['export const a = 1\n'],
  },
  {
    rule: 'import-x/no-cycle',
    // `src/cycle.ts` imports `src/lint-text.ts` back.
    invalid: ['import { cycle } from "./cycle.ts"\n\nexport const lintText = cycle\n'],
    valid: [
      'import { parse } from "./helpers.ts"\n\nexport const n = parse\n',
      // Type-only imports vanish at runtime, so they can't form an initialisation cycle.
      'import type { cycle } from "./cycle.ts"\n\nexport type LintText = typeof cycle\n',
    ],
  },
  {
    rule: 'import-x/no-default-export',
    invalid: [],
    valid: ['const config = 1\nexport default config\n'],
  },
  {
    rule: 'import-x/no-deprecated',
    invalid: [],
    valid: ['import { parseLegacy } from "./helpers.ts"\n\nexport const n = parseLegacy\n'],
  },
  {
    rule: 'import-x/no-duplicates',
    invalid: [
      'import { parse } from "./helpers.ts"\nimport { parseLegacy } from "./helpers.ts"\n\nexport const n = [parse, parseLegacy]\n',
    ],
    valid: [
      'import { ESLint } from "eslint"\nimport type { Linter } from "eslint"\n\nexport const c: Linter.Config = {}\nexport const e = ESLint\n',
      // The query only separates modules that resolve: an unresolved specifier is compared as text.
      'import raw from "./helpers.ts?raw"\nimport { parse } from "./helpers.ts"\n\nexport const x = [raw, parse]\n',
    ],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'import-x/no-dynamic-require',
    invalid: ['declare const path: string\n\nexport const m: unknown = await import(path)\n'],
    valid: ['export const m: unknown = await import("./helpers.ts")\n'],
  },
  {
    rule: 'import-x/no-empty-named-blocks',
    invalid: ['import {} from "./helpers.ts"\n\nexport const n = 1\n'],
    valid: ['import "./helpers.ts"\n\nexport const n = 1\n'],
  },
  {
    rule: 'import-x/no-extraneous-dependencies',
    // The fixture has no package.json, so the repo's own is read: `prettier` is a devDependency.
    invalid: [
      'import { format } from "prettier"\n\nexport const f = format\n',
      'import type { Options } from "prettier"\n\nexport type O = Options\n',
    ],
    // `globals` is a dependency and `eslint` a peerDependency.
    valid: [
      'import globals from "globals"\nimport type { Linter } from "eslint"\n\nexport const g: Linter.Globals = globals.node\n',
    ],
  },
  {
    rule: 'import-x/no-import-module-exports',
    invalid: ['import { parse } from "./helpers.ts"\n\nmodule.exports = { parse }\n'],
    valid: ['import { parse } from "./helpers.ts"\n\nexport { parse }\n'],
  },
  {
    rule: 'import-x/no-internal-modules',
    invalid: [],
    valid: ['import { defineConfig } from "eslint/config"\n\nexport const d = defineConfig\n'],
  },
  {
    rule: 'import-x/no-mutable-exports',
    invalid: ['export let n = 1\n'],
    valid: ['export const n = 1\n'],
  },
  {
    rule: 'import-x/no-named-as-default',
    invalid: ['import greet from "./greeter.ts"\n\nexport const g = greet\n'],
    valid: ['import greeter from "./greeter.ts"\n\nexport const g = greeter\n'],
  },
  // Off in TS files: tsc reports a property the default export doesn't have.
  {
    rule: 'import-x/no-named-as-default-member',
    invalid: [],
    valid: ['import greeter from "./greeter.ts"\n\nexport const g = greeter.greet\n'],
  },
  {
    rule: 'import-x/no-named-default',
    invalid: ['import { default as greeter } from "./greeter.ts"\n\nexport const g = greeter\n'],
    valid: ['import greeter from "./greeter.ts"\n\nexport const g = greeter\n'],
  },
  {
    rule: 'import-x/no-named-export',
    invalid: [],
    valid: ['export const n = 1\n'],
  },
])

describeRules([...base, ...scoped(UNIT_TEST_FILES, test)], 'src/lint-text.test.ts', [
  {
    rule: 'import-x/no-extraneous-dependencies',
    invalid: [],
    valid: ['import { format } from "prettier"\n\nexport const f = format\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'import-x/no-namespace',
    invalid: [],
    valid: ['import * as path from "node:path"\n\nexport const j = path.join\n'],
  },
  {
    rule: 'import-x/no-nodejs-modules',
    invalid: [],
    valid: ['import { join } from "node:path"\n\nexport const j = join\n'],
  },
  {
    rule: 'import-x/no-relative-packages',
    // `packages/ui` has its own package.json.
    invalid: ['import { button } from "../packages/ui/index.ts"\n\nexport const b = button\n'],
    valid: ['import { parse } from "./helpers.ts"\n\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/no-relative-parent-imports',
    invalid: [],
    valid: ['import { button } from "../packages/ui/index.ts"\n\nexport const b = button\n'],
  },
  {
    rule: 'import-x/no-self-import',
    invalid: ['import { lintText } from "./lint-text.ts"\n\nexport const self = lintText\n'],
    valid: ['import { parse } from "./helpers.ts"\n\nexport const n = parse\n'],
  },
  {
    rule: 'import-x/no-unassigned-import',
    invalid: [],
    valid: ['import "./helpers.ts"\n\nexport const n = 1\n'],
  },
  // Off in TS files: tsc reports an unresolvable module.
  {
    rule: 'import-x/no-unresolved',
    invalid: [],
    valid: ['import { x } from "./missing.ts"\n\nexport const n = x\n'],
  },
  {
    rule: 'import-x/no-useless-path-segments',
    invalid: ['import { parse } from "./../src/helpers.ts"\n\nexport const n = parse\n'],
    valid: [
      'import { parse } from "./helpers.ts"\n\nexport const n = parse\n',
      'import { widget } from "./widgets/index.ts"\n\nexport const w = widget\n',
    ],
  },
])

describeRules(base, 'src/lint-text.js', [
  {
    rule: 'import-x/no-unresolved',
    invalid: [
      'import { x } from "./missing.ts"\n\nexport const n = x\n',
      // Resolves on a case-insensitive disk, then fails on Linux CI.
      'import { parse } from "./Helpers.ts"\n\nexport const n = parse\n',
    ],
    valid: ['import { parse } from "./helpers.ts"\n\nexport const n = parse\n'],
  },
])

describeRules(base, 'scripts/lint-text.cjs', [
  {
    rule: 'import-x/no-useless-path-segments',
    invalid: ['const { parse } = require("./../src/helpers.ts")\n\nmodule.exports = { parse }\n'],
    valid: ['const { parse } = require("../src/helpers.ts")\n\nmodule.exports = { parse }\n'],
  },
])

describeRules(base, 'src/lint-text.ts', [
  {
    rule: 'import-x/no-webpack-loader-syntax',
    invalid: ['import css from "style-loader!./a.css"\n\nexport const c = css\n'],
    valid: ['import raw from "./helpers.ts?raw"\n\nexport const r = raw\n'],
  },
  {
    rule: 'import-x/order',
    invalid: [
      'import { parse } from "./helpers.ts"\n\nimport { join } from "node:path"\n\nexport const x = [parse, join]\n',
      'import { join } from "node:path"\nimport { parse } from "./helpers.ts"\n\nexport const x = [parse, join]\n',
      'import { ESLint } from "eslint"\n\nimport globals from "globals"\n\nexport const x = [ESLint, globals]\n',
      'import globals from "globals"\nimport { ESLint } from "eslint"\n\nexport const x = [ESLint, globals]\n',
      'import type { Linter } from "eslint"\nimport { ESLint } from "eslint"\n\nexport const x: Linter.Config = { plugins: { e: ESLint } }\n',
    ],
    valid: [
      'import { join } from "node:path"\n\nimport { ESLint } from "eslint"\nimport type { Linter } from "eslint"\nimport globals from "globals"\n\nimport { parse } from "./helpers.ts"\n\nexport const x: Linter.Config = { plugins: { e: ESLint } }\nexport const y = [join, globals, parse]\n',
      // A side-effect import keeps its position.
      'import "./helpers.ts"\nimport { join } from "node:path"\n\nexport const j = join\n',
      // Names inside `{ … }` are `sort-imports`' job.
      'import { parseLegacy, parse } from "./helpers.ts"\n\nexport const x = [parse, parseLegacy]\n',
    ],
  },
  {
    rule: 'import-x/prefer-default-export',
    invalid: [],
    valid: ['export const n = 1\n'],
  },
  {
    rule: 'import-x/unambiguous',
    invalid: ['const n = 1\nconsole.info(n)\n'],
    valid: ['export const n = 1\n'],
  },
])

describeRules(base, 'src/env.d.ts', [
  {
    rule: 'import-x/unambiguous',
    invalid: [],
    valid: ["declare module '*.svg' {\n  const src: string\n  export default src\n}\n"],
  },
])

describeRules(base, 'scripts/lint-text.cjs', [
  {
    rule: 'import-x/unambiguous',
    invalid: [],
    valid: ['const n = 1\nconsole.info(n)\n'],
  },
])
