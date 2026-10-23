import react from '@eslint-react/eslint-plugin'
import type { Linter } from 'eslint'

/*
 * @eslint-react reimplements the react-hooks rules (exhaustive-deps, rules-of-hooks, …) and
 * reports each problem under the rule it belongs to, so @eslint-react owns them and the
 * react-hooks copies are off: each problem reports once.
 */

const REACT_ELEMENT = {
  message:
    'Type renderable values as `ReactNode`; `ReactElement` rejects the strings, numbers, `null` and arrays React renders.',
  suggest: ['ReactNode'],
}

/**
 * Types the React preset bans through `@typescript-eslint/no-restricted-types`, which is
 * off in the base preset. Setting that rule replaces this list, so spread it in to extend it.
 */
export const restrictedReactTypes = {
  ReactElement: REACT_ELEMENT,
  'React.ReactElement': REACT_ELEMENT,
}

/*
 * Every `@eslint-react/x-foo` is the same rule object as `@eslint-react/foo`; enabling both reports
 * twice.
 */
const aliases: Linter.RulesRecord = Object.fromEntries(
  Object.keys(react.rules ?? {})
    .filter((name) => name.startsWith('x-'))
    .map((name) => [`@eslint-react/${name}`, 'off']),
)

/** Explicit decision for every `@eslint-react/*` rule that needs JSX to apply. */
export const reactRules: Linter.RulesRecord = {
  ...aliases,
  '@eslint-react/error-boundaries': 'error',
  /*
   * React 19 passes `ref` to function components as a prop and its docs plan to deprecate
   * `forwardRef`. The rule detects the installed React and is silent below 19, where
   * `forwardRef` is still required.
   */
  '@eslint-react/no-forward-ref': 'error',
  /*
   * React 19 renders `<Context>` as its own provider; `.Provider` is slated for deprecation. Silent
   * below 19.
   */
  '@eslint-react/no-context-provider': 'error',
  '@eslint-react/static-components': 'error',
  /*
   * React 18 replaced these with `createRoot` and `hydrateRoot`, React 19 removed them. Silent
   * below 18.
   */
  '@eslint-react/dom-no-hydrate': 'error',
  '@eslint-react/dom-no-render': 'error',
  /*
   * Error boundaries can only be classes, so `no-class-component` exempts them; the class
   * rules below hold that one class, and any legacy code that turns the ban off, to the
   * same standard.
   */
  '@eslint-react/no-class-component': 'error',
  '@eslint-react/no-access-state-in-setstate': 'error',
  '@eslint-react/no-component-will-mount': 'error',
  '@eslint-react/no-component-will-receive-props': 'error',
  '@eslint-react/no-component-will-update': 'error',
  '@eslint-react/no-direct-mutation-state': 'error',
  '@eslint-react/no-set-state-in-component-did-mount': 'error',
  '@eslint-react/no-set-state-in-component-did-update': 'error',
  '@eslint-react/no-set-state-in-component-will-update': 'error',
  '@eslint-react/no-unsafe-component-will-mount': 'error',
  '@eslint-react/no-unsafe-component-will-receive-props': 'error',
  '@eslint-react/no-unsafe-component-will-update': 'error',
  '@eslint-react/no-unused-class-component-members': 'error',
  '@eslint-react/dom-no-find-dom-node': 'error',
  '@eslint-react/dom-no-render-return-value': 'error',
  '@eslint-react/jsx-no-key-after-spread': 'error',
  '@eslint-react/no-array-index-key': 'error',
  '@eslint-react/no-duplicate-key': 'error',
  // Type-aware: it recognises a spread `key` by React's `Key` type from `@types/react`.
  '@eslint-react/no-implicit-key': 'error',
  '@eslint-react/no-missing-key': 'error',
  // React's docs file `Children` under legacy APIs: wrapping a child changes what it sees.
  '@eslint-react/no-children-count': 'error',
  '@eslint-react/no-children-for-each': 'error',
  '@eslint-react/no-children-map': 'error',
  '@eslint-react/no-children-only': 'error',
  '@eslint-react/no-children-to-array': 'error',
  '@eslint-react/no-clone-element': 'error',
  // Type-aware, like `no-implicit-key`: a spread `children` typed `ReactNode` is deliberate.
  '@eslint-react/no-implicit-children': 'error',
  /*
   * TODO(https://github.com/konceptware/eslint-config/issues/1): replace with a target-aware
   * local rule. The upstream rule reports any spread whose type has a `ref` not typed with one
   * of React's own ref types and never checks whether the receiving component accepts a ref, so
   * `<Input {...field} />` with React Hook Form's `RefCallBack` is reported on every React
   * version while the only real bug, a ref dropped by a plain React 18 function component,
   * cannot be told apart from it.
   */
  '@eslint-react/no-implicit-ref': 'off',
  '@eslint-react/jsx-no-children-prop': 'error',
  '@eslint-react/jsx-no-children-prop-with-children': 'error',
  '@eslint-react/jsx-no-comment-textnodes': 'error',
  '@eslint-react/jsx-no-leaked-dollar': 'error',
  '@eslint-react/jsx-no-leaked-semicolon': 'error',
  // tsc rejects `<svg:rect />` in TS files (TS2339); `reactJsRules` covers JS.
  '@eslint-react/jsx-no-namespace': 'off',
  '@eslint-react/jsx-no-useless-fragment': [
    'error',
    // `return null` renders nothing, and a component can return an expression unwrapped.
    { allowEmptyFragment: false, allowExpressions: false },
  ],
  // Type-aware: `{count && <Badge />}` renders a literal `0` only when `count` can be a number.
  '@eslint-react/no-leaked-conditional-rendering': 'error',
  // Type-aware: it compares the props type against the props the component reads.
  '@eslint-react/no-unused-props': 'error',
  '@eslint-react/no-unstable-context-value': 'error',
  '@eslint-react/no-unstable-default-props': ['error', { safeDefaultProps: [] }],
  '@eslint-react/no-missing-component-display-name': 'error',
  /*
   * Overlaps `static-components` on a component defined in another's body, which then
   * reports twice; only this rule catches a nested component passed as a prop.
   */
  '@eslint-react/no-nested-component-definitions': 'error',
  // Sanitised HTML that must be injected takes a disable comment with its reason.
  '@eslint-react/dom-no-dangerously-set-innerhtml': 'error',
  '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
  // Forces a synchronous render; the rare legitimate use takes a disable comment with its reason.
  '@eslint-react/dom-no-flush-sync': 'error',
  '@eslint-react/dom-no-missing-button-type': 'error',
  '@eslint-react/dom-no-missing-iframe-sandbox': 'error',
  '@eslint-react/dom-no-unsafe-iframe-sandbox': 'error',
  '@eslint-react/dom-no-script-url': 'error',
  // tsc rejects a string `style` in TS files (TS2559); `reactJsRules` covers JS.
  '@eslint-react/dom-no-string-style-prop': 'off',
  // tsc rejects unknown props (TS2322) and accepts any `data-*` name; `reactJsRules` covers JS.
  '@eslint-react/dom-no-unknown-property': 'off',
  // `noreferrer` also withholds the `Referer` header from the opened site.
  '@eslint-react/dom-no-unsafe-target-blank': ['error', { allowReferrer: false }],
  '@eslint-react/dom-no-void-elements-with-children': 'error',
}

/**
 * `@eslint-react/*` rules about hooks. They also run on `.ts` files, where custom hooks
 * live without JSX.
 */
export const reactHookRules: Linter.RulesRecord = {
  '@eslint-react/exhaustive-deps': [
    'error',
    {
      // Adding a dependency can make an effect loop, so the fix stays a suggestion.
      enableDangerousAutofixThisMayCauseInfiniteLoops: false,
      // An effect that runs after every render says so with an explicit `undefined`.
      requireExplicitEffectDeps: true,
      experimental_autoDependenciesHooks: [],
    },
  ],
  '@eslint-react/globals': 'error',
  '@eslint-react/immutability': 'error',
  '@eslint-react/purity': 'error',
  '@eslint-react/refs': 'error',
  '@eslint-react/rules-of-hooks': 'error',
  '@eslint-react/set-state-in-effect': 'error',
  '@eslint-react/set-state-in-render': 'error',
  '@eslint-react/unsupported-syntax': 'error',
  '@eslint-react/use-memo': 'error',
  // React 19 renamed it `useActionState`, exported from `react`. Silent below 19.
  '@eslint-react/dom-no-use-form-state': 'error',
  // `use(Ctx)` replaces `useContext` and may run inside a condition. Silent below 19.
  '@eslint-react/no-use-context': 'error',
  // `createRef()` in a function body makes a new ref every render; `useRef` keeps one.
  '@eslint-react/no-create-ref': 'error',
  // A `useState` value nobody reads re-renders for nothing; it belongs in a ref or nowhere.
  '@eslint-react/no-unused-state': 'error',
  '@eslint-react/no-unnecessary-use-prefix': 'error',
  '@eslint-react/use-state': [
    'error',
    { enforceAssignment: true, enforceLazyInitialization: true, enforceSetterName: true },
  ],
  // Contexts are often created in `.ts` modules with no JSX.
  '@eslint-react/no-missing-context-display-name': 'error',
  '@eslint-react/no-nested-lazy-component-declarations': 'error',
  '@eslint-react/no-misused-capture-owner-stack': 'error',
  // Server action modules are often plain `.ts`.
  '@eslint-react/rsc-function-definition': 'error',
  // Aborting in the cleanup also stops a slow response from overwriting a newer one.
  '@eslint-react/web-api-no-leaked-fetch': 'error',
  '@eslint-react/web-api-no-leaked-event-listener': 'error',
  '@eslint-react/web-api-no-leaked-intersection-observer': 'error',
  '@eslint-react/web-api-no-leaked-interval': 'error',
  '@eslint-react/web-api-no-leaked-resize-observer': 'error',
  '@eslint-react/web-api-no-leaked-timeout': 'error',
  // `no-context-provider` recognises a context only by the `Context` suffix.
  '@eslint-react/naming-convention-context-name': 'error',
  '@eslint-react/naming-convention-id-name': 'error',
  '@eslint-react/naming-convention-ref-name': 'error',
  '@typescript-eslint/no-restricted-types': ['error', { types: restrictedReactTypes }],
}

/**
 * `@eslint-react/*` and `jsx-a11y-x/*` rules for JS files. The type-aware ones are off: the
 * base preset gives JS no type information, and without it they throw on every `.jsx` file.
 * The rest are problems tsc reports in TS files.
 */
export const reactJsRules: Linter.RulesRecord = {
  '@eslint-react/no-implicit-children': 'off',
  '@eslint-react/no-implicit-key': 'off',
  '@eslint-react/no-implicit-ref': 'off',
  '@eslint-react/no-leaked-conditional-rendering': 'off',
  '@eslint-react/no-unused-props': 'off',
  '@eslint-react/jsx-no-namespace': 'error',
  '@eslint-react/dom-no-string-style-prop': 'error',
  // HTML lowercases attribute names, so `data-fooBar` is unreachable as `dataset.fooBar`.
  '@eslint-react/dom-no-unknown-property': ['error', { ignore: [], requireDataLowercase: true }],
  'jsx-a11y-x/aria-proptypes': 'error',
}

/** Explicit decision for every `react-hooks/*` rule. */
export const reactHooksRules: Linter.RulesRecord = {
  // The @eslint-react versions own these.
  'react-hooks/error-boundaries': 'off',
  'react-hooks/exhaustive-deps': 'off',
  'react-hooks/globals': 'off',
  'react-hooks/immutability': 'off',
  'react-hooks/purity': 'off',
  'react-hooks/refs': 'off',
  'react-hooks/rules-of-hooks': 'off',
  'react-hooks/set-state-in-effect': 'off',
  'react-hooks/set-state-in-render': 'off',
  'react-hooks/static-components': 'off',
  'react-hooks/unsupported-syntax': 'off',
  'react-hooks/use-memo': 'off',
  /*
   * The next five are covered by `@eslint-react/rules-of-hooks`, `use-memo`, `exhaustive-deps`
   * and `set-state-in-effect`.
   */
  'react-hooks/hooks': 'off',
  'react-hooks/void-use-memo': 'off',
  'react-hooks/memo-dependencies': 'off',
  'react-hooks/no-deriving-state-in-effects': 'off',
  'react-hooks/exhaustive-effect-dependencies': 'off',
  // The compiler never raises the `EffectDependencies` category this rule reports.
  'react-hooks/memoized-effect-dependencies': 'off',
  // With the plugin's default compiler options the compiler collects no suppression comments.
  'react-hooks/rule-suppression': 'off',
  // Compiler bugs and features it doesn't support yet, reported on correct code.
  'react-hooks/invariant': 'off',
  'react-hooks/todo': 'off',
  // Invalid identifiers and function bodies, which the parser and tsc already reject.
  'react-hooks/syntax': 'off',
  // Off: targets Meta's `fbt` i18n library.
  'react-hooks/fbt': 'off',
  'react-hooks/capitalized-calls': 'error',
  'react-hooks/incompatible-library': 'error',
  'react-hooks/preserve-manual-memoization': 'error',
  /*
   * Silent unless a consumer passes compiler options: `config` reports a missing filename
   * under `sources`, `gating` a malformed `'use memo if(…)'` directive under `dynamicGating`.
   */
  'react-hooks/config': 'error',
  'react-hooks/gating': 'error',
}

/*
 * The `components` lists in the jsx-a11y-x options stay empty: a consumer maps its own
 * wrappers to the HTML they render with `settings['jsx-a11y-x'].components`, which every
 * rule reads.
 */

/** Explicit decision for every `jsx-a11y-x/*` rule. */
export const jsxA11yRules: Linter.RulesRecord = {
  'jsx-a11y-x/alt-text': [
    'error',
    {
      elements: ['img', 'object', 'area', 'input[type="image"]'],
      img: [],
      object: [],
      area: [],
      'input[type="image"]': [],
    },
  ],
  // `words` adds to the built-in `image`, `photo` and `picture`.
  'jsx-a11y-x/img-redundant-alt': ['error', { components: [], words: [] }],
  'jsx-a11y-x/media-has-caption': ['error', { audio: [], video: [], track: [] }],
  'jsx-a11y-x/iframe-has-title': 'error',
  'jsx-a11y-x/anchor-has-content': ['error', { components: [] }],
  'jsx-a11y-x/anchor-is-valid': [
    'error',
    { components: [], specialLink: [], aspects: ['noHref', 'invalidHref', 'preferButton'] },
  ],
  'jsx-a11y-x/anchor-ambiguous-text': 'error',
  'jsx-a11y-x/label-has-associated-control': [
    'error',
    {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: 'either',
      // 25 is the schema's maximum, so deeply nested label text is still found.
      depth: 25,
    },
  ],
  /*
   * It skips `<button><Icon /></button>`, assuming a component child holds text, yet reports
   * `<td>`, `<video>` and the inputs `label-has-associated-control` already covers.
   */
  'jsx-a11y-x/control-has-associated-label': 'off',
  'jsx-a11y-x/heading-has-content': ['error', { components: [] }],
  'jsx-a11y-x/html-has-lang': 'error',
  'jsx-a11y-x/lang': 'error',
  'jsx-a11y-x/autocomplete-valid': ['error', { inputComponents: [] }],
  // tsc doesn't check hyphenated JSX attribute names, so a misspelled `aria-*` passes it.
  'jsx-a11y-x/aria-props': 'error',
  /*
   * tsc rejects invalid literal `aria-*` values (TS2322) and the rule skips expressions;
   * `reactJsRules` covers JS.
   */
  'jsx-a11y-x/aria-proptypes': 'off',
  // Components are checked too: a business prop named `role` gets spread onto DOM elements as ARIA.
  'jsx-a11y-x/aria-role': ['error', { allowedInvalidRoles: [], ignoreNonDOM: false }],
  'jsx-a11y-x/aria-unsupported-elements': 'error',
  'jsx-a11y-x/role-has-required-aria-props': 'error',
  'jsx-a11y-x/role-supports-aria-props': 'error',
  'jsx-a11y-x/aria-activedescendant-has-tabindex': 'error',
  // Safari drops list semantics from a list styled `list-style: none`; `role="list"` restores them.
  'jsx-a11y-x/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
  'jsx-a11y-x/no-aria-hidden-on-focusable': 'error',
  /*
   * It judges the role alone, so `<canvas role="img">`, a hand-built `<ul role="listbox">`
   * and a focusable `role="region"` take a disable comment with their reason.
   */
  'jsx-a11y-x/prefer-tag-over-role': 'error',
  /*
   * No element exceptions: `prefer-tag-over-role` reports the upstream ones (`canvas` → `img`, `ul`
   * → `listbox`) anyway.
   */
  'jsx-a11y-x/no-interactive-element-to-noninteractive-role': ['error', {}],
  'jsx-a11y-x/no-noninteractive-element-to-interactive-role': ['error', {}],
  // The default `handlers` cover every focus, keyboard and mouse handler.
  'jsx-a11y-x/no-static-element-interactions': 'error',
  // `onLoad`/`onError` on these elements report loading, not user interaction.
  'jsx-a11y-x/no-noninteractive-element-interactions': [
    'error',
    { body: ['onError', 'onLoad'], iframe: ['onError', 'onLoad'], img: ['onError', 'onLoad'] },
  ],
  'jsx-a11y-x/click-events-have-key-events': 'error',
  /*
   * Any `tabIndex` satisfies it; `tabbable` picks the roles whose message and fix say
   * `tabIndex={0}`.
   */
  'jsx-a11y-x/interactive-supports-focus': [
    'error',
    {
      tabbable: [
        'button',
        'checkbox',
        'link',
        'progressbar',
        'searchbox',
        'slider',
        'spinbutton',
        'switch',
        'textbox',
      ],
    },
  ],
  // React code hovers with `onMouseEnter`/`onMouseLeave`, which the defaults leave out.
  'jsx-a11y-x/mouse-events-have-key-events': [
    'error',
    {
      hoverInHandlers: ['onMouseOver', 'onMouseEnter'],
      hoverOutHandlers: ['onMouseOut', 'onMouseLeave'],
    },
  ],
  // The ARIA tabs pattern makes each tab panel focusable.
  'jsx-a11y-x/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel'] }],
  'jsx-a11y-x/tabindex-no-positive': 'error',
  'jsx-a11y-x/no-autofocus': ['error', { ignoreNonDOM: false }],
  'jsx-a11y-x/no-access-key': 'error',
  'jsx-a11y-x/no-distracting-elements': ['error', { elements: ['marquee', 'blink'] }],
  // On in TS too: tsc accepts `scope` on `<td>`, the usual misuse.
  'jsx-a11y-x/scope': 'error',
}
