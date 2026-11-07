import type { Linter } from 'eslint'

/** Explicit decision for every `storybook/*` rule that runs on story files. */
export const storybookRules: Linter.RulesRecord = {
  /*
   * Silent unless the file's last import is from the legacy `@storybook/test` or
   * `@storybook/testing-library`: it never recognises `storybook/test`. In TS, `@typescript-eslint/no-floating-promises` reports an
   * un-awaited interaction anyway.
   */
  'storybook/await-interactions': 'error',
  /*
   * Reported by tsc on a `StoryObj`-typed story: `play` takes a required context. The rule only
   * finds the context parameter on an arrow function, so it reports a `play` method even when
   * the context is passed.
   */
  'storybook/context-in-play-function': 'off',
  // A story without one component (a composition) takes a disable with its reason.
  'storybook/csf-component': 'error',
  'storybook/default-exports': 'error',
  'storybook/hierarchy-separator': 'error',
  // `csfVersion` is accepted by the schema but never read by the rule.
  'storybook/meta-inline-properties': 'error',
  // `const meta: Meta<…>` widens the type, so `StoryObj<typeof meta>` loses the meta's `args`.
  'storybook/meta-satisfies-type': 'error',
  'storybook/no-redundant-story-name': 'error',
  // Matches `import type` too; Storybook's own docs take types from the framework package.
  'storybook/no-renderer-packages': 'error',
  'storybook/no-stories-of': 'error',
  // Autotitle derives the sidebar path from the file's location, so a moved file can't keep a stale title.
  'storybook/no-title-property-in-meta': 'error',
  // Checks `.storybook/main.*`, which `storybookMain` covers.
  'storybook/no-uninstalled-addons': 'off',
  'storybook/prefer-pascal-case': 'error',
  'storybook/story-exports': 'error',
  'storybook/use-storybook-expect': 'error',
  // Replaced by `konceptware-storybook/use-storybook-testing-library`, the same check without the autofix.
  'storybook/use-storybook-testing-library': 'off',
}

/** Rules for `.storybook/main.*`. */
export const storybookMainRules: Linter.RulesRecord = {
  /*
   * `packageJsonLocation` resolves against the process cwd, not this config, so a monorepo
   * linted from its root checks the root `package.json` unless the consumer passes a path.
   */
  'storybook/no-uninstalled-addons': ['error', { packageJsonLocation: '', ignore: [] }],
}
