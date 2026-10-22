import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import { lintSnippet } from '../../scripts/eslint-for.ts'

export type RuleCases = {
  rule: string
  invalid: string[]
  valid: string[]
}

/** Asserts that `config` reports `rule` for every `invalid` snippet and for none of the `valid` ones. */
export function describeRules(config: Linter.Config[], filePath: string, cases: RuleCases[]): void {
  describe.each(cases)('$rule', ({ rule, invalid, valid }) => {
    it.each(invalid)('reports %s', async (code) => {
      expect(await lintSnippet(config, code, filePath)).toContain(rule)
    })
    it.each(valid)('allows %s', async (code) => {
      const ids = await lintSnippet(config, code, filePath)
      expect(ids).not.toContain('<parse error>')
      expect(ids).not.toContain(rule)
    })
  })
}
