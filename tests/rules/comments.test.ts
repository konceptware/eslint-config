import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { FIXTURE_DIR } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import react from '../../src/react.ts'

import { describeRules } from './cases.ts'

// A scope glob after `@word` inside JSDoc made type-aware parsing emit a second, nested comment.
const SCOPE_GLOB_JSDOC = [
  '/** Ambient types come from @types/* packages. */\nexport const a = 1\n',
  '/** Explicit decision for every @typescript-eslint/* rule. */\nexport const a = 1\n',
  '/**\n * Ambient types come from @types/* packages.\n */\nexport const a = 1\n',
  '/**\n * @see @types/* for ambient declarations\n */\nexport const a = 1\n',
]

describeRules(base, 'src/lint-text.ts', [
  {
    rule: '@stylistic/multiline-comment-style',
    invalid: ['// line one\n// line two\nexport const a = 1\n'],
    valid: [
      '/*\n * line one\n * line two\n */\nexport const a = 1\n',
      '// one remark\n\n// another remark\nexport const a = 1\n',
      '// eslint-disable-next-line no-console -- reason\n// another remark\nconsole.log(1)\n',
      ...SCOPE_GLOB_JSDOC,
    ],
  },
  {
    rule: '@stylistic/spaced-comment',
    invalid: ['//no space\nexport const a = 1\n', '/* unbalanced*/\nexport const a = 1\n'],
    valid: ['/// <reference types="node" />\nexport const a = 1\n'],
  },
  {
    rule: '@stylistic/lines-between-class-members',
    invalid: ['export class A {\n  f() {\n    return 1\n  }\n  g() {\n    return 2\n  }\n}\n'],
    valid: [
      // `exceptAfterSingleLine` lets one-line members sit together.
      'export class A {\n  x = 1\n  y = 2\n  f() {}\n}\n',
    ],
  },
  {
    rule: '@eslint-community/eslint-comments/require-description',
    invalid: ['// eslint-disable-next-line no-console\nconsole.log(1)\n'],
    valid: ['// eslint-disable-next-line no-console -- reason\nconsole.log(1)\n'],
  },
  {
    rule: '@eslint-community/eslint-comments/no-unlimited-disable',
    invalid: ['console.log(1) // eslint-disable-line -- reason\n'],
    valid: ['console.log(1) // eslint-disable-line no-console -- reason\n'],
  },
  {
    rule: '@eslint-community/eslint-comments/disable-enable-pair',
    invalid: ['/* eslint-disable no-console -- reason */\nconsole.log(1)\n'],
    valid: [
      '/* eslint-disable no-console -- reason */\nconsole.log(1)\n/* eslint-enable no-console */\n',
    ],
  },
  {
    rule: '@eslint-community/eslint-comments/no-aggregating-enable',
    invalid: [
      '/* eslint-disable no-console -- a */\n/* eslint-disable no-debugger -- b */\nconsole.log(1)\ndebugger\n/* eslint-enable no-console, no-debugger */\n',
    ],
    valid: [],
  },
  {
    rule: '@eslint-community/eslint-comments/no-duplicate-disable',
    invalid: [
      '/* eslint-disable no-console -- a */\n// eslint-disable-next-line no-console -- b\nconsole.log(1)\n/* eslint-enable no-console */\n',
    ],
    valid: [],
  },
  {
    // `reportUnusedDisableDirectives` reports unused disables and enables in place of the eslint-comments rules.
    rule: '<unused directive>',
    invalid: [
      '// eslint-disable-next-line no-console -- reason\nexport const a = 1\n',
      '/* eslint-enable no-console */\nexport const a = 1\n',
    ],
    valid: [],
  },
])

describe('scope glob in JSDoc', () => {
  const fixer = new ESLint({
    cwd: FIXTURE_DIR,
    overrideConfigFile: true,
    overrideConfig: base,
    fix: true,
  })

  it.each(SCOPE_GLOB_JSDOC)('--fix leaves %s unchanged', async (code) => {
    const [result] = await fixer.lintText(code, { filePath: 'src/lint-text.ts' })

    expect(result?.output).toBeUndefined()
    expect(result?.messages).toStrictEqual([])
  })
})

describeRules([...base, ...react], 'src/lint-jsx.tsx', [
  {
    rule: '@stylistic/jsx-self-closing-comp',
    invalid: ['export const A = () => <div></div>\n'],
    valid: ['export const A = () => <div />\n'],
  },
  {
    rule: '@stylistic/jsx-curly-brace-presence',
    invalid: [
      'export const A = () => <a title={"x"} />\n',
      'export const A = () => <p>{"text"}</p>\n',
    ],
    valid: ['export const A = () => <a title="x" />\n'],
  },
  {
    rule: '@stylistic/jsx-pascal-case',
    invalid: ['const My_thing = () => null\nexport const A = () => <My_thing />\n'],
    valid: ['const MyThing = () => null\nexport const A = () => <MyThing />\n'],
  },
])
