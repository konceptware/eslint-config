import type { Linter } from 'eslint'

/** Explicit decision for every `@typescript-eslint/*` rule. */
export const typescriptRules: Linter.RulesRecord = {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  // `Array<string | number>` reads better than `(string | number)[]`.
  '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
  '@typescript-eslint/await-thenable': ['error', { allowMixedPromiseArrays: false }],
  '@typescript-eslint/ban-ts-comment': [
    'error',
    {
      // Same `-- reason` form as eslint-disable directives; the length includes the ` -- `.
      'ts-expect-error': { descriptionFormat: String.raw`^ -- \S` },
      // `@ts-ignore` keeps silencing after the error is gone; `@ts-expect-error` fails instead.
      'ts-ignore': true,
      'ts-nocheck': true,
      'ts-check': false,
      minimumDescriptionLength: 10,
    },
  ],
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
  '@typescript-eslint/class-methods-use-this': [
    'error',
    {
      exceptMethods: [],
      enforceForClassFields: true,
      // An override's signature is fixed by the base class.
      ignoreOverrideMethods: true,
      // The implemented interface fixes the public members; private helpers are still checked.
      ignoreClassesThatImplementAnInterface: 'public-fields',
    },
  ],
  '@typescript-eslint/consistent-generic-constructors': ['error', 'constructor'],
  '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
  /*
   * tsconfig `noImplicitReturns` misses a bare `return;` next to `return value`, and is
   * off by default, so this rule is the guaranteed check.
   */
  '@typescript-eslint/consistent-return': ['error', { treatUndefinedAsUnspecified: false }],
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    {
      assertionStyle: 'as',
      // A cast object or array literal hides missing properties; annotate or use `satisfies`.
      objectLiteralTypeAssertions: 'never',
      arrayLiteralTypeAssertions: 'never',
    },
  ],
  /*
   * `type` everywhere is enforced by a `no-restricted-syntax` selector instead: this rule's 'type'
   * mode also reports interfaces that augment a module, and its --fix rewrites those inside
   * `declare module` into type aliases, which no longer merge.
   */
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/consistent-type-exports': [
    'error',
    { fixMixedExportsWithInlineTypeSpecifier: false },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      prefer: 'type-imports',
      /*
       * Under `verbatimModuleSyntax`, `import { type B } from 'x'` still loads `x`; `import type`
       * is erased.
       */
      fixStyle: 'separate-type-imports',
      disallowTypeAnnotations: true,
    },
  ],
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/dot-notation': [
    'error',
    {
      // tsc's `noPropertyAccessFromIndexSignature` requires brackets for index-signature keys.
      allowIndexSignaturePropertyAccess: true,
      allowKeywords: true,
      allowPattern: '',
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
    },
  ],
  // Inferred return types are trusted, exported or not.
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    {
      accessibility: 'no-public',
      // `constructor(public name: string)` is the only way to declare a public parameter property.
      overrides: { parameterProperties: 'explicit' },
    },
  ],
  // Return types are inferred; parameter types are already required by tsc's `noImplicitAny`.
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  // Forcing a placeholder value is worse than tsc's use-before-assign check (TS2454).
  '@typescript-eslint/init-declarations': 'off',
  // Count-based limit, off like core `max-params`.
  '@typescript-eslint/max-params': 'off',
  '@typescript-eslint/member-ordering': [
    'error',
    {
      // Getters and setters share a rank so `grouped-accessor-pairs` can keep each pair adjacent.
      default: [
        'signature',
        'call-signature',
        'field',
        'static-initialization',
        'constructor',
        ['get', 'set'],
        'method',
      ],
    },
  ],
  /*
   * Property signatures are checked contravariantly under `strictFunctionTypes`; method signatures
   * are bivariant.
   */
  '@typescript-eslint/method-signature-style': ['error', 'property'],
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'default',
      format: ['camelCase'],
      leadingUnderscore: 'forbid',
      trailingUnderscore: 'forbid',
    },
    // PascalCase for components and `as const` objects, UPPER_CASE for constants.
    { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
    { selector: ['function', 'import'], format: ['camelCase', 'PascalCase'] },
    // Matches `argsIgnorePattern: '^_'` in `no-unused-vars`.
    { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
    { selector: 'typeLike', format: ['PascalCase'] },
    /*
     * Destructured names and object keys mirror a shape defined elsewhere (DB columns, HTTP
     * headers, API payloads).
     */
    { selector: ['variable', 'parameter'], modifiers: ['destructured'], format: null },
    { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
  ],
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-array-delete': 'error',
  '@typescript-eslint/no-base-to-string': [
    'error',
    { checkUnknown: true, ignoredTypeNames: ['Error', 'RegExp', 'URL', 'URLSearchParams'] },
  ],
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': [
    'error',
    /*
     * A callback typed `() => void`, such as `onClick={() => setOpen(true)}`, may return a void
     * call.
     */
    { ignoreArrowShorthand: false, ignoreVoidOperator: false, ignoreVoidReturningFunctions: true },
  ],
  '@typescript-eslint/no-deprecated': ['error', { allow: [] }],
  // Reported by tsc.
  '@typescript-eslint/no-dupe-class-members': 'off',
  // Enums are banned by `no-restricted-syntax`.
  '@typescript-eslint/no-duplicate-enum-values': 'off',
  '@typescript-eslint/no-duplicate-type-constituents': [
    'error',
    { ignoreIntersections: false, ignoreUnions: false },
  ],
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-function': [
    'error',
    /*
     * Private/protected constructors (singletons, static-only classes) and no-op overrides are
     * empty by design.
     */
    { allow: ['private-constructors', 'protected-constructors', 'overrideMethods'] },
  ],
  '@typescript-eslint/no-empty-object-type': [
    'error',
    {
      // Registering custom matchers takes `interface Assertion<T> extends CustomMatchers<T> {}`.
      allowInterfaces: 'with-single-extends',
      allowObjectTypes: 'never',
    },
  ],
  // An automatic `unknown` changes what type-checks; the author picks the replacement type.
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: false, ignoreRestArgs: false }],
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-extraneous-class': [
    'error',
    {
      allowConstructorOnly: false,
      allowEmpty: false,
      allowStaticOnly: false,
      allowWithDecorator: false,
    },
  ],
  '@typescript-eslint/no-floating-promises': [
    'error',
    {
      allowForKnownSafeCalls: [],
      allowForKnownSafePromises: [],
      checkThenables: true,
      ignoreIIFE: false,
      // `void promise` marks a deliberately unawaited promise.
      ignoreVoid: true,
    },
  ],
  // `for…in` is banned by `no-restricted-syntax`.
  '@typescript-eslint/no-for-in-array': 'off',
  '@typescript-eslint/no-generated-empty-object-type': 'error',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/no-inferrable-types': [
    'error',
    { ignoreParameters: false, ignoreProperties: false },
  ],
  // Reported by tsc under `noImplicitThis`.
  '@typescript-eslint/no-invalid-this': 'off',
  '@typescript-eslint/no-invalid-void-type': [
    'error',
    /*
     * `Promise<void>` and `Map<string, void>` are idiomatic; a `this: void` parameter is not, since
     * `unbound-method` already guards receivers.
     */
    { allowInGenericTypeArguments: true, allowAsThisParameter: false },
  ],
  // Off for the same reason as core `no-magic-numbers`.
  '@typescript-eslint/no-magic-numbers': 'off',
  // `checkNever` also reports `void` on a call returning `never`, which never produces a value.
  '@typescript-eslint/no-meaningless-void-operator': ['error', { checkNever: true }],
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      // `strict` reports `Promise<T> | T` (a missing `await`) but not `Promise | undefined`.
      checksConditionals: { flagUnions: 'strict' },
      checksSpreads: true,
      checksVoidReturn: {
        arguments: true,
        attributes: true,
        inheritedMethods: true,
        properties: true,
        returns: true,
        variables: true,
      },
    },
  ],
  '@typescript-eslint/no-misused-spread': ['error', { allow: [] }],
  // Enums are banned by `no-restricted-syntax`.
  '@typescript-eslint/no-mixed-enums': 'off',
  /*
   * ES modules replace namespaces; `declare global { namespace Express }` augmentation stays
   * allowed.
   */
  '@typescript-eslint/no-namespace': [
    'error',
    { allowDeclarations: true, allowDefinitionFiles: true },
  ],
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  // `!` silences `strictNullChecks` without a runtime check; narrow or throw instead.
  '@typescript-eslint/no-non-null-assertion': 'error',
  // Off for the same reason as core `no-redeclare`.
  '@typescript-eslint/no-redeclare': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'error',
  /*
   * A local `const require = createRequire(import.meta.url)` is not reported; only the CommonJS
   * global is.
   */
  '@typescript-eslint/no-require-imports': ['error', { allow: [], allowAsImport: false }],
  /*
   * `no-wrapper-object-types`, `no-unsafe-function-type` and `no-empty-object-type` each own a
   * banned type; nothing is left to list here.
   */
  '@typescript-eslint/no-restricted-types': 'off',
  '@typescript-eslint/no-shadow': [
    'error',
    {
      /*
       * `globals.node` applies to every file and `globals.browser` to JSX, so `true` would
       * report `name`, `status`, `open`, `crypto` and `fetch` as ordinary identifiers.
       * `no-shadow-restricted-names` still guards `undefined`, `NaN`, `eval` and `arguments`.
       */
      builtinGlobals: false,
      hoist: 'all',
      allow: [],
      ignoreOnInitialization: false,
      // `const Role = {…} as const` next to `type Role = …` is the pattern that replaces enums.
      ignoreTypeValueShadow: true,
      ignoreFunctionTypeParameterNameValueShadow: true,
    },
  ],
  // `const { a, b } = this` reads fields; it doesn't keep a second name for `this`.
  '@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true, allowedNames: [] }],
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
    'error',
    {
      // On `boolean | undefined`, `flag === true` means "true, not merely present".
      allowComparingNullableBooleansToFalse: true,
      allowComparingNullableBooleansToTrue: true,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
    },
  ],
  '@typescript-eslint/no-unnecessary-condition': [
    'error',
    {
      // `while (true) { … break }` is a deliberate loop form, not a forgotten condition.
      allowConstantLoopConditions: 'only-allowed-literals',
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      checkTypePredicates: true,
    },
  ],
  '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-template-expression': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': [
    'error',
    /*
     * `const x = 'a' as const` already infers the literal type; the assertion reads as if it
     * mattered.
     */
    { typesToIgnore: [], checkLiteralConstAssertions: true },
  ],
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unnecessary-type-conversion': 'error',
  // A type parameter used once adds nothing over `unknown` and invites callers to cast through it.
  '@typescript-eslint/no-unnecessary-type-parameters': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  // Enums are banned here, but a dependency's enum (`ts.SyntaxKind`) can still reach the code.
  '@typescript-eslint/no-unsafe-enum-assignment': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',
  '@typescript-eslint/no-unsafe-function-type': 'error',
  // `?.` guards only null and undefined; the property read on `any` is just as unchecked.
  '@typescript-eslint/no-unsafe-member-access': ['error', { allowOptionalChaining: false }],
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unsafe-type-assertion': 'error',
  '@typescript-eslint/no-unsafe-unary-minus': 'error',
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
      enforceForJSX: false,
      /*
       * `'use strict'` / `'use client'` in a prologue parse as directives, not expressions, so
       * nothing needs ignoring.
       */
      ignoreDirectives: false,
    },
  ],
  // tsc's `noUnusedLocals` is not part of `strict`, so this is the guaranteed check.
  '@typescript-eslint/no-unused-private-class-members': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      vars: 'all',
      // Every unused parameter is reported, so a placeholder such as `_req` states the intent.
      args: 'all',
      argsIgnorePattern: '^_',
      // `catch {}` replaces an unused binding.
      caughtErrors: 'all',
      destructuredArrayIgnorePattern: '^_',
      // `const { password, ...safe } = user` is how a key is omitted.
      ignoreRestSiblings: true,
      ignoreClassWithStaticInitBlock: false,
      // A `using` declaration exists for its disposal and is never read.
      ignoreUsingDeclarations: true,
      reportUsedIgnorePattern: true,
      enableAutofixRemoval: { imports: true },
    },
  ],
  '@typescript-eslint/no-use-before-define': [
    'error',
    {
      /*
       * Function declarations are hoisted, and helpers below their caller is the `func-style`
       * layout.
       */
      functions: false,
      classes: true,
      variables: true,
      allowNamedExports: false,
      enums: true,
      // Types are hoisted in full; top-down order of type declarations reads naturally.
      typedefs: false,
      ignoreTypeReferences: true,
    },
  ],
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-useless-default-assignment': [
    'error',
    { allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false },
  ],
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/no-wrapper-object-types': 'error',
  // Prefers `x!`, which `no-non-null-assertion` bans.
  '@typescript-eslint/non-nullable-type-assertion-style': 'off',
  '@typescript-eslint/only-throw-error': [
    'error',
    {
      allow: [],
      // What a `catch` received is not ours to type.
      allowRethrowing: true,
      allowThrowingAny: false,
      allowThrowingUnknown: false,
    },
  ],
  /*
   * Parameter properties aren't erasable syntax: Node's type stripping and `erasableSyntaxOnly`
   * reject them.
   */
  '@typescript-eslint/parameter-properties': ['error', { prefer: 'class-property', allow: [] }],
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-destructuring': [
    'error',
    {
      VariableDeclarator: { object: true, array: true },
      /*
       * Destructuring into existing variables needs `({ x } = o)`, which reads worse than `x =
       * o.x`.
       */
      AssignmentExpression: { object: false, array: false },
    },
    // `const { id: userId } = user` reads worse than `const userId = user.id`.
    { enforceForRenamedProperties: false, enforceForDeclarationWithTypeAnnotation: false },
  ],
  /*
   * Enums are banned by `no-restricted-syntax`; `prefer-enum-initializers` and `prefer-literal-
   * enum-member` govern any enum a consumer re-allows.
   */
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-find': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-literal-enum-member': ['error', { allowBitwiseExpressions: false }],
  // tsc reports `module Foo {}` itself (TS1540).
  '@typescript-eslint/prefer-namespace-keyword': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': [
    'error',
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      ignoreBooleanCoercion: false,
      /*
       * In `if (a || b)` the `||` is boolean logic, and `??` would change the result for `''` or
       * `0`.
       */
      ignoreConditionalTests: true,
      ignoreIfStatements: false,
      ignoreMixedLogicalExpressions: false,
      // `count || 10` turning `0` into `10` is the bug this rule exists for.
      ignorePrimitives: { bigint: false, boolean: false, number: false, string: false },
      ignoreTernaryTests: false,
    },
  ],
  '@typescript-eslint/prefer-optional-chain': [
    'error',
    {
      allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
      checkAny: true,
      checkBigInt: true,
      checkBoolean: true,
      checkNumber: true,
      checkString: true,
      checkUnknown: true,
      requireNullish: false,
    },
  ],
  // Same settings as `only-throw-error`: a rejection reason must be an `Error`.
  '@typescript-eslint/prefer-promise-reject-errors': [
    'error',
    { allow: [], allowEmptyReject: false, allowThrowingAny: false, allowThrowingUnknown: false },
  ],
  '@typescript-eslint/prefer-readonly': ['error', { onlyInlineLambdas: false }],
  /*
   * Demands deeply readonly parameter types, so library types (`Linter.Config[]`,
   * `tsParser.ParserOptions`) and inferred callback parameters fail even with
   * `treatMethodsAsReadonly`; `no-param-reassign` with `props: true` already stops mutation.
   */
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-regexp-exec': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': [
    'error',
    { allowSingleElementEquality: 'never' },
  ],
  '@typescript-eslint/promise-function-async': [
    'error',
    {
      /*
       * `false` demands `async` on every function returning `unknown`, such as a `JSON.parse`
       * wrapper.
       */
      allowAny: true,
      allowedPromiseNames: [],
      checkArrowFunctions: true,
      checkFunctionDeclarations: true,
      checkFunctionExpressions: true,
      checkMethodDeclarations: true,
    },
  ],
  '@typescript-eslint/related-getter-setter-pairs': 'error',
  /*
   * Without a comparator strings sort by UTF-16 code unit (`'B' < 'a'`); the comparator states the
   * intended order.
   */
  '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: false }],
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/restrict-plus-operands': [
    'error',
    {
      allowAny: false,
      allowBoolean: false,
      allowNullish: false,
      allowNumberAndString: false,
      allowRegExp: false,
      skipCompoundAssignments: false,
    },
  ],
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    {
      allowAny: false,
      allowArray: false,
      allowBoolean: false,
      allowNever: false,
      allowNullish: false,
      /*
       * `${count} items` prints the number faithfully; `restrict-plus-operands` forbids `count + '
       * items'`, so the template is the only form left.
       */
      allowNumber: true,
      allowRegExp: false,
      allow: [{ name: ['Error', 'URL', 'URLSearchParams'], from: 'lib' }],
    },
  ],
  /*
   * `await` everywhere keeps the async stack frame and makes `return p` inside `try` skipping the
   * `catch` impossible.
   */
  '@typescript-eslint/return-await': ['error', 'always'],
  '@typescript-eslint/strict-boolean-expressions': [
    'error',
    {
      allowAny: false,
      allowNullableBoolean: false,
      allowNullableEnum: false,
      allowNullableNumber: false,
      // An object is always truthy, so `if (user)` can only mean "is present".
      allowNullableObject: true,
      allowNullableString: false,
      allowNumber: false,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      allowString: false,
    },
  ],
  '@typescript-eslint/strict-void-return': ['error', { allowReturnAny: false }],
  '@typescript-eslint/switch-exhaustiveness-check': [
    'error',
    {
      /*
       * Union members missing a `case` are still reported, so a `default: throw` guard hides
       * nothing.
       */
      allowDefaultCaseForExhaustiveSwitch: true,
      considerDefaultExhaustiveForUnions: false,
      // Replaces core `default-case`, which is off.
      requireDefaultForNonUnion: true,
    },
  ],
  /*
   * `types` stays `prefer-import`: `/// <reference types="vite/client" />` is how Vite projects
   * load its types.
   */
  '@typescript-eslint/triple-slash-reference': [
    'error',
    { lib: 'never', path: 'never', types: 'prefer-import' },
  ],
  '@typescript-eslint/unbound-method': ['error', { ignoreStatic: false }],
  '@typescript-eslint/unified-signatures': [
    'error',
    { ignoreDifferentlyNamedParameters: false, ignoreOverloadsWithDifferentJSDoc: false },
  ],
  '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
}
