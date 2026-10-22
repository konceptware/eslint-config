import type { Rule } from 'eslint'

/**
 * `rule` with the same reports and suggestions, minus the autofix of every report
 * `dropsFix` selects, or of all reports without it. With `dropsFix` some fixes
 * survive, so `meta.fixable` stays: ESLint throws on a fix from a rule that doesn't
 * declare it.
 */
export function withoutAutofix(
  rule: Rule.RuleModule,
  dropsFix?: (descriptor: Rule.ReportDescriptor) => boolean,
): Rule.RuleModule {
  const { fixable, ...rest } = rule.meta ?? {}
  return {
    ...rule,
    meta: dropsFix === undefined ? rest : { ...rest, fixable },
    create(context) {
      /*
       * `context.report` is a read-only, non-configurable property, so a Proxy can't
       * swap it; an object inheriting from `context` can shadow it.
       */
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- lib.es5 types Object.create as returning `any`; the result inherits every RuleContext member from `context`
      const reportOnly: Rule.RuleContext = Object.create(context, {
        report: {
          value(descriptor: Rule.ReportDescriptor): void {
            const drops = dropsFix?.(descriptor) ?? true
            context.report(drops ? { ...descriptor, fix: null } : descriptor)
          },
        },
      })
      return rule.create(reportOnly)
    },
  }
}
