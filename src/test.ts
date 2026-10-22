import type { Linter } from 'eslint'

import { testRelaxations } from './rules/test-relaxations.ts'

/**
 * Runner-agnostic relaxations of the base preset. Sets no `files`: scope it to your test
 * files with `{ files, extends: [test] }`, or it relaxes every file. Place after the
 * base preset.
 */
const test: Linter.Config[] = [{ name: 'konceptware/test', rules: testRelaxations }]

export default test
