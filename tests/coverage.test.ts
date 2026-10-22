import { describe, expect, it } from 'vitest'

import { resolvedRules, severity } from '../scripts/eslint-for.ts'
import { REVIEWED_SOURCES, SOURCES, isDeprecated } from '../scripts/rule-sources.ts'

// `it.todo` must be declared synchronously, so the resolved rules are computed before the suites are.
const RESOLVED = new Map(
  await Promise.all(
    SOURCES.map(
      async (source) => [source.name, await resolvedRules(source.config, source.sample)] as const,
    ),
  ),
)

describe.each(SOURCES)('rule coverage: $name', (source) => {
  const rules = RESOLVED.get(source.name) ?? {}
  const ids = Object.keys(source.rules).map((rule) => source.prefix + rule)
  const deprecated = new Set(
    Object.entries(source.rules)
      .filter(([, rule]) => isDeprecated(rule))
      .map(([rule]) => source.prefix + rule),
  )
  const undecided = ids.filter((id) => !deprecated.has(id) && !(id in rules))

  it('uses only error or off, never warn', () => {
    expect(Object.keys(rules).filter((id) => severity(rules[id]) === 'warn')).toStrictEqual([])
  })

  it('enables no deprecated rule', () => {
    expect([...deprecated].filter((id) => severity(rules[id]) === 'error')).toStrictEqual([])
  })

  const reviewed = REVIEWED_SOURCES.has(source.name)

  it.skipIf(!reviewed)('decides every non-deprecated rule explicitly', () => {
    expect(undecided).toStrictEqual([])
  })

  // The todo list is the review backlog; a reviewed source must have none.
  // eslint-disable-next-line vitest/prefer-each -- vitest types `it.todo.each(…)(title)` as requiring a callback, which a todo has none of
  for (const id of reviewed ? [] : undecided) it.todo(`review ${id}`)
})
