import * as tsParser from '@typescript-eslint/parser'

type Comment = ReturnType<typeof tsParser.parseForESLint>['ast']['comments'][number]

/**
 * `@typescript-eslint/parser` minus the nested comments that type-aware parsing reports inside
 * JSDoc.
 *
 * With a project service, typescript-estree parses JSDoc (`jsDocParsingMode: 'all'`) and then
 * collects comment trivia after every token, including tokens inside a JSDoc comment. In
 * `@types/*` the trivia after the tag name `types` starts with `/*`, so the rest of the JSDoc
 * comes back as a second comment nested inside the real one, which `no-inline-comments` and
 * `@stylistic/multiline-comment-style` then report (and the latter's --fix garbles the comment).
 * Real comments never overlap, so a comment starting inside another one is always nested.
 *
 * TODO: remove once typescript-estree stops emitting nested comments; the scope-glob JSDoc
 * cases in `tests/rules/comments.test.ts` pass on the plain parser then.
 */
export const parser = {
  meta: { name: '@konceptware/eslint-config/parser', version: tsParser.meta.version },
  parseForESLint(
    code: string,
    options?: tsParser.ParserOptions,
  ): ReturnType<typeof tsParser.parseForESLint> {
    const result = tsParser.parseForESLint(code, options)
    result.ast.comments = withoutNestedComments(result.ast.comments)
    return result
  },
}

function withoutNestedComments(comments: Comment[]): Comment[] {
  const kept: Comment[] = []
  for (const comment of comments.toSorted((a, b) => a.range[0] - b.range[0])) {
    const previous = kept.at(-1)
    if (previous === undefined || comment.range[0] >= previous.range[1]) kept.push(comment)
  }
  return kept
}
