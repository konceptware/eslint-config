import type { Linter } from 'eslint'

import { restrictedSyntax } from './restricted-syntax.ts'

/**
 * Explicit decision for every core ESLint rule.
 * Rules with a typescript-eslint extension are `off` here and decided in `typescript.ts`.
 * Rules marked "Reported by tsc" are `off` because the TypeScript compiler already
 * reports the same problem; plain JS files get no check for them.
 */
export const coreRules: Linter.RulesRecord = {
  'accessor-pairs': [
    'error',
    {
      setWithoutGet: true,
      // A read-only getter is a normal API; only write-only properties are flagged.
      getWithoutSet: false,
      enforceForClassMembers: true,
      enforceForTSTypes: true,
    },
  ],
  'array-callback-return': [
    'error',
    { allowImplicit: false, checkForEach: true, allowVoid: false },
  ],
  'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
  // `no-var` removes the `var` declarations this rule checks.
  'block-scoped-var': 'off',
  // Naming is enforced per identifier kind by `@typescript-eslint/naming-convention`.
  camelcase: 'off',
  'capitalized-comments': 'off',
  // Replaced by `@typescript-eslint/class-methods-use-this`.
  'class-methods-use-this': 'off',
  // Count-based limits are off: size and nesting are judged in review, not failed in CI.
  complexity: 'off',
  /*
   * Replaced by `@typescript-eslint/consistent-return`, which allows `Promise<void>` functions to
   * end without a value.
   */
  'consistent-return': 'off',
  /*
   * `@typescript-eslint/no-this-alias` bans aliasing `this` at all, which makes the alias name
   * moot.
   */
  'consistent-this': 'off',
  // Reported by tsc.
  'constructor-super': 'off',
  /*
   * A single one-line statement stays bare wherever it sits; braces mark a body of several
   * statements or one that wraps, and `consistent` makes every clause of a chain match.
   */
  curly: ['error', 'multi-or-nest', 'consistent'],
  /*
   * Replaced by `@typescript-eslint/switch-exhaustiveness-check`; a forced `default` would swallow
   * union members added later.
   */
  'default-case': 'off',
  'default-case-last': 'error',
  /*
   * Replaced by `@typescript-eslint/default-param-last`, which also understands optional
   * parameters.
   */
  'default-param-last': 'off',
  // Replaced by `@typescript-eslint/dot-notation`.
  'dot-notation': 'off',
  // `null` comparisons are left to `no-eq-null`, which reports `== null` with its own message.
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'for-direction': 'error',
  'func-name-matching': [
    'error',
    'always',
    { considerPropertyDescriptor: true, includeCommonJSModuleExports: true },
  ],
  'func-names': ['error', 'as-needed', { generators: 'as-needed' }],
  'func-style': ['error', 'declaration', { allowArrowFunctions: false, allowTypeAnnotation: true }],
  // Reported by tsc.
  'getter-return': 'off',
  'grouped-accessor-pairs': ['error', 'getBeforeSet', { enforceForTSTypes: true }],
  // `no-restricted-syntax` bans `for…in` outright, so a guard would never be needed.
  'guard-for-in': 'off',
  'id-denylist': 'off',
  // A length floor can't tell a vague name from a clear one; `x` passes as easily as `data`.
  'id-length': 'off',
  // Naming is enforced per identifier kind by `@typescript-eslint/naming-convention`.
  'id-match': 'off',
  // Replaced by `@typescript-eslint/init-declarations`.
  'init-declarations': 'off',
  'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
  // Count-based limits, like `complexity`.
  'max-classes-per-file': 'off',
  'max-depth': 'off',
  'max-lines': 'off',
  'max-lines-per-function': 'off',
  'max-nested-callbacks': 'off',
  'max-params': 'off',
  'max-statements': 'off',
  'new-cap': [
    'error',
    {
      newIsCap: true,
      /*
       * tsc reports calling a class without `new`; this half would only flag decorators
       * (`@Injectable()`) and factories (`Type.String()`).
       */
      capIsNew: false,
      newIsCapExceptions: [],
      /*
       * Only local names are checked, e.g. `import { Client as client }`; a library's member naming
       * isn't ours to fix.
       */
      properties: false,
    },
  ],
  'no-alert': 'error',
  // Replaced by `@typescript-eslint/no-array-constructor`.
  'no-array-constructor': 'off',
  'no-async-promise-executor': 'error',
  // Sequential awaits that are intended (rate limits, ordered steps) carry a `-- reason` disable.
  'no-await-in-loop': 'error',
  'no-bitwise': ['error', { allow: [], int32Hint: false }],
  'no-caller': 'error',
  'no-case-declarations': 'error',
  // Reported by tsc.
  'no-class-assign': 'off',
  'no-compare-neg-zero': 'error',
  // `for (const m of s.matchAll(re))` replaces the `while ((m = re.exec(s)))` idiom.
  'no-cond-assign': ['error', 'always'],
  /*
   * Logging goes through a logging library; a script that must print gets a `files` override in the
   * consumer's config.
   */
  'no-console': 'error',
  // Reported by tsc.
  'no-const-assign': 'off',
  'no-constant-binary-expression': ['error', { checkRelationalComparisons: true }],
  'no-constant-condition': ['error', { checkLoops: 'allExceptWhileTrue' }],
  'no-constructor-return': 'error',
  // A guard clause with `continue` reads better than nesting the rest of the loop body.
  'no-continue': 'off',
  // Intentional control characters (e.g. stripping ANSI codes) carry a `-- reason` disable.
  'no-control-regex': 'error',
  'no-debugger': 'error',
  // Reported by tsc (TS1102, TS2703).
  'no-delete-var': 'off',
  'no-div-regex': 'error',
  // Reported by tsc.
  'no-dupe-args': 'off',
  // Reported by tsc; `@typescript-eslint/no-dupe-class-members` stays off for the same reason.
  'no-dupe-class-members': 'off',
  'no-dupe-else-if': 'error',
  // Reported by tsc.
  'no-dupe-keys': 'off',
  'no-duplicate-case': 'error',
  /*
   * Replaced by `import-x/no-duplicates`, which compares resolved paths and merges imports on
   * `--fix`.
   */
  'no-duplicate-imports': 'off',
  'no-else-return': ['error', { allowElseIf: false }],
  /*
   * A block holding only a comment counts as non-empty, so an intentional empty `catch` states its
   * reason.
   */
  'no-empty': ['error', { allowEmptyCatch: false }],
  'no-empty-character-class': 'error',
  // Replaced by `@typescript-eslint/no-empty-function`.
  'no-empty-function': 'off',
  'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: false }],
  'no-empty-static-block': 'error',
  'no-eq-null': 'error',
  'no-eval': ['error', { allowIndirect: false }],
  'no-ex-assign': 'error',
  'no-extend-native': ['error', { exceptions: [] }],
  'no-extra-bind': 'error',
  'no-extra-boolean-cast': ['error', { enforceForInnerExpressions: true }],
  'no-extra-label': 'error',
  // tsconfig `noFallthroughCasesInSwitch` is off by default, so this is the guaranteed check.
  'no-fallthrough': ['error', { allowEmptyCase: false, reportUnusedFallthroughComment: true }],
  // Reported by tsc.
  'no-func-assign': 'off',
  'no-global-assign': ['error', { exceptions: [] }],
  'no-implicit-coercion': [
    'error',
    { boolean: true, number: true, string: true, disallowTemplateShorthand: true, allow: [] },
  ],
  // ES module and CommonJS scope never create globals, and those are the only kinds of file linted.
  'no-implicit-globals': 'off',
  // Replaced by `@typescript-eslint/no-implied-eval`, which also catches strings held in variables.
  'no-implied-eval': 'off',
  // Reported by tsc.
  'no-import-assign': 'off',
  /*
   * A trailing `// why` on a parameter or object key explains that one line; moving it above
   * detaches it from its referent and costs a line for nothing.
   */
  'no-inline-comments': 'off',
  // In strict-mode code a function declared in a block is block-scoped, and `no-var` bans `var`.
  'no-inner-declarations': 'off',
  'no-invalid-regexp': ['error', {}],
  /*
   * Reported by tsc under `noImplicitThis` (part of `strict`); `@typescript-eslint/no-invalid-this`
   * stays off too.
   */
  'no-invalid-this': 'off',
  // Invisible characters are written as escapes (`'\u00a0'`, `&nbsp;`) so readers can see them.
  'no-irregular-whitespace': [
    'error',
    {
      skipStrings: false,
      skipComments: false,
      skipTemplates: false,
      skipRegExps: false,
      skipJSXText: false,
    },
  ],
  'no-iterator': 'error',
  'no-label-var': 'error',
  // Breaking out of nested loops reads better as a `return` from an extracted function.
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'no-lone-blocks': 'error',
  'no-lonely-if': 'error',
  'no-loop-func': 'error',
  // tsc reports this only as suggestion TS80008, never as a compile error.
  'no-loss-of-precision': 'error',
  /*
   * Can't tell a meaningful number (`404`, a timeout) from arithmetic (`% 2`, `* 100`), so most
   * reports are noise.
   */
  'no-magic-numbers': 'off',
  // Surrogate-pair escapes like `[\uD83D\uDC4D]` are only ever written on purpose.
  'no-misleading-character-class': ['error', { allowEscape: true }],
  'no-multi-assign': ['error', { ignoreNonDeclaration: false }],
  'no-multi-str': 'error',
  'no-negated-condition': 'error',
  // Has no option for a nesting limit, and an occasional nested ternary is accepted.
  'no-nested-ternary': 'off',
  'no-new': 'error',
  /*
   * Overlaps `@typescript-eslint/no-implied-eval` on `Function(…)`; only this rule covers
   * `Function.call(…)` and JS files.
   */
  'no-new-func': 'error',
  // Reported by tsc (TS7009 under `strict`).
  'no-new-native-nonconstructor': 'off',
  'no-new-wrappers': 'error',
  // Reported by tsc (TS1488).
  'no-nonoctal-decimal-escape': 'off',
  // Reported by tsc (TS2349).
  'no-obj-calls': 'off',
  'no-object-constructor': 'error',
  // Reported by tsc (TS1121).
  'no-octal': 'off',
  // Reported by tsc (TS1487).
  'no-octal-escape': 'off',
  'no-param-reassign': [
    'error',
    { props: true, ignorePropertyModificationsFor: [], ignorePropertyModificationsForRegex: [] },
  ],
  // Bans an operator rather than a bug; `no-unexpected-multiline` covers the ASI case.
  'no-plusplus': 'off',
  'no-promise-executor-return': ['error', { allowVoid: false }],
  // Reported by tsc (TS2339) on typed values.
  'no-proto': 'off',
  'no-prototype-builtins': 'error',
  /*
   * tsc reports redeclared `let`/`const` (TS2451) and TS functions (TS2393), and `no-var`
   * removes `var`; `@typescript-eslint/no-redeclare` stays off for the same reason.
   */
  'no-redeclare': 'off',
  'no-regex-spaces': 'error',
  /*
   * A default-export policy is decided with `import-x/no-default-export`, which supports per-glob
   * exceptions.
   */
  'no-restricted-exports': 'off',
  'no-restricted-globals': [
    'error',
    {
      globals: [
        { name: 'isNaN', message: 'Use Number.isNaN; the global coerces its argument first.' },
        {
          name: 'isFinite',
          message: 'Use Number.isFinite; the global coerces its argument first.',
        },
      ],
      checkGlobalObject: true,
    },
  ],
  // No module is banned company-wide; a consumer's own setting would replace this one anyway.
  'no-restricted-imports': 'off',
  // `Math.pow` is covered by `prefer-exponentiation-operator`, `.only` by the runner presets.
  'no-restricted-properties': 'off',
  'no-restricted-syntax': ['error', ...restrictedSyntax],
  'no-return-assign': ['error', 'always'],
  'no-script-url': 'error',
  'no-self-assign': ['error', { props: true }],
  'no-self-compare': 'error',
  // A comma in a `for` header stays allowed regardless of this option.
  'no-sequences': ['error', { allowInParentheses: false }],
  // Reported by tsc (TS2408).
  'no-setter-return': 'off',
  // Replaced by `@typescript-eslint/no-shadow`.
  'no-shadow': 'off',
  'no-shadow-restricted-names': ['error', { reportGlobalThis: true }],
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'no-ternary': 'off',
  // Reported by tsc (TS17009).
  'no-this-before-super': 'off',
  // Replaced by `@typescript-eslint/only-throw-error`, which checks the thrown value's type.
  'no-throw-literal': 'off',
  // tsc (TS2454) misses this when the type allows `undefined` or the `let` has no annotation.
  'no-unassigned-vars': 'error',
  // Reported by tsc (TS2304).
  'no-undef': 'off',
  'no-undef-init': 'error',
  // Bans comparing with and returning `undefined`, which TS code does routinely.
  'no-undefined': 'off',
  /*
   * Naming is enforced per identifier kind by `@typescript-eslint/naming-convention`; this
   * rule would also flag access to external data such as `doc._id` and `obj.__typename`.
   */
  'no-underscore-dangle': 'off',
  'no-unexpected-multiline': 'error',
  'no-unmodified-loop-condition': ['error', { checkConditionalExpressions: true }],
  /*
   * The `!!x` its autofix produces is then reported by `no-implicit-coercion`; `Boolean(x)`
   * satisfies both.
   */
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  // tsc reports unreachable code (TS7027) only under `allowUnreachableCode: false`.
  'no-unreachable': 'error',
  'no-unreachable-loop': ['error', { ignore: [] }],
  'no-unsafe-finally': 'error',
  // Reported by tsc (TS2322, TS2358, TS2365).
  'no-unsafe-negation': 'off',
  // Reported by tsc under `strict` (TS2722, TS2488, TS18048, TS2339).
  'no-unsafe-optional-chaining': 'off',
  /*
   * Replaced by `@typescript-eslint/no-unused-expressions`, which understands `x!` and type
   * assertions.
   */
  'no-unused-expressions': 'off',
  // `no-labels` bans every label, so an unused one is already reported.
  'no-unused-labels': 'off',
  /*
   * Replaced by `@typescript-eslint/no-unused-private-class-members`, which also covers TS
   * `private`.
   */
  'no-unused-private-class-members': 'off',
  // Replaced by `@typescript-eslint/no-unused-vars`.
  'no-unused-vars': 'off',
  // Replaced by `@typescript-eslint/no-use-before-define`.
  'no-use-before-define': 'off',
  'no-useless-assignment': 'error',
  'no-useless-backreference': 'error',
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-computed-key': ['error', { enforceForClassMembers: true }],
  'no-useless-concat': 'error',
  /*
   * Replaced by `@typescript-eslint/no-useless-constructor`, which accepts parameter properties and
   * access modifiers.
   */
  'no-useless-constructor': 'off',
  'no-useless-escape': ['error', { allowRegexCharacters: [] }],
  'no-useless-rename': [
    'error',
    { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false },
  ],
  'no-useless-return': 'error',
  'no-var': 'error',
  // `void promise()` marks a deliberately un-awaited promise, which `no-floating-promises` accepts.
  'no-void': ['error', { allowAsStatement: true }],
  // A TODO stating its open problem and removal condition is legitimate.
  'no-warning-comments': 'off',
  // Reported by tsc (TS1101, TS2410).
  'no-with': 'off',
  'object-shorthand': [
    'error',
    'always',
    {
      // A quoted key such as `'my-key'` keeps the long form.
      avoidQuotes: true,
      ignoreConstructors: false,
      // An arrow that uses `this` is left alone; as a method, `this` would change meaning.
      avoidExplicitReturnArrows: true,
    },
  ],
  'one-var': ['error', 'never'],
  'operator-assignment': ['error', 'always'],
  // A callback that uses `this` is left alone; as an arrow, `this` would change meaning.
  'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
  // `all` keeps `let { a, b } = o` together when only `a` is reassigned.
  'prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: false }],
  /*
   * Replaced by `@typescript-eslint/prefer-destructuring`, which knows when an index is an array
   * index.
   */
  'prefer-destructuring': 'off',
  'prefer-exponentiation-operator': 'error',
  'prefer-named-capture-group': 'error',
  'prefer-numeric-literals': 'error',
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  // Replaced by `@typescript-eslint/prefer-promise-reject-errors`, which checks the reason's type.
  'prefer-promise-reject-errors': 'off',
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'prefer-template': 'error',
  // A project lists its own error classes in `errorClassNames`.
  'preserve-caught-error': ['error', { requireCatchParameter: true, errorClassNames: [] }],
  // Without a radix, `parseInt('0x1f')` parses hex.
  radix: ['error', 'always'],
  'require-atomic-updates': ['error', { allowProperties: false }],
  // Replaced by `@typescript-eslint/require-await`, which understands returned promises.
  'require-await': 'off',
  'require-unicode-regexp': 'error',
  'require-yield': 'error',
  // Only names inside `{ … }` are sorted; `import-x/order` owns the order of import declarations.
  'sort-imports': [
    'error',
    {
      ignoreCase: false,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      allowSeparatedGroups: true,
    },
  ],
  // Alphabetical order would break meaningful key order such as `{ id, name, email }`.
  'sort-keys': 'off',
  // `one-var: never` leaves no multi-variable declaration to sort.
  'sort-vars': 'off',
  // Flags a redundant directive in ES modules and requires one in CommonJS files.
  strict: ['error', 'safe'],
  'symbol-description': 'error',
  'unicode-bom': ['error', 'never'],
  // tsc reports `x === NaN` (TS2845) but not `case NaN:` or `indexOf(NaN)`.
  'use-isnan': ['error', { enforceForSwitchCase: true, enforceForIndexOf: true }],
  // Reported by tsc (TS2367) for misspelled type names.
  'valid-typeof': 'off',
  // `no-var` bans `var`.
  'vars-on-top': 'off',
  yoda: ['error', 'never', { exceptRange: true, onlyEquality: false }],
}
