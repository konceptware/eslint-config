/*
 * Not import-style on purpose: plugin-types.d.ts is an ambient declaration for
 * the untyped eslint-plugin-jsx-a11y. Consumers compile this file from source,
 * and only a reference directive carries the declaration into their programs —
 * an import would need a runtime module jiti cannot resolve, and augmentation
 * of an untyped module is a TS error.
 */
/* eslint-disable-next-line @typescript-eslint/triple-slash-reference */
/// <reference path="./plugin-types.d.ts" />
import type {
  ConfigObject,
  ConfigWithExtends,
  ExtensionConfigObject,
} from "@eslint/config-helpers";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { flatConfigs as importXConfigs } from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { configs as storybookConfigs } from "eslint-plugin-storybook";
import { defineConfig } from "eslint/config";
import globals from "globals";
import { configs as tseslintConfigs } from "typescript-eslint";

export interface BaselineOptions {
  /**
   * The consumer's `__dirname` (or `import.meta.dirname`). Anchors
   * `projectService` so type-aware rules resolve the right tsconfig.
   */
  tsconfigRootDir: string;
  /** Build outputs and vendored trees; becomes the bare global-ignores block. */
  ignores?: string[];
  /**
   * Globs of the type-aware source tree. Every glob must be covered by a
   * tsconfig project, or the run aborts. Default: `src/**\/*.{ts,tsx}`.
   */
  srcGlobs?: string[];
  /**
   * Where React lives. `true` applies the react/jsx-a11y/react-hooks presets
   * to all of `srcGlobs`; an array scopes them to a subtree (acrm:
   * `src/admin/**`). `false`/absent skips them.
   */
  react?: boolean | string[];
  /** Test-runner preset, applied to `testGlobs`. Follows the runner in use. */
  tests?: "vitest" | "jest" | false;
  /** Test-file globs. Default: `*.{test,spec}.*` plus `__tests__/`. */
  testGlobs?: string[];
  /** Extend `storybookConfigs["flat/recommended"]` (scopes itself to stories). */
  storybook?: boolean;
  /**
   * `strictTypeChecked` (the default) vs `recommendedTypeChecked`. Strict is
   * the measured monorepo-wide decision (docs/LINT-RULESET.md): consumers
   * adopt the full surface and triage findings per rule rather than migrating
   * twice. Opting down is itself a ledger-worthy divergence.
   */
  strict?: boolean;
  /**
   * Files outside every tsconfig project, added to the escape-hatch block. A
   * type-aware rule on such a file aborts the whole run rather than skipping
   * the file — that is the mechanism, not a stylistic choice.
   */
  untypedGlobs?: string[];
}

const DEFAULT_SRC_GLOBS = ["src/**/*.{ts,tsx}"];
const DEFAULT_TEST_GLOBS = [
  "**/*.{test,spec}.{ts,tsx}",
  "**/__tests__/**/*.{ts,tsx}",
];

/*
 * Every flat-config plugin compiles its exported configs against a different
 * eslint typing generation (typescript-eslint's own FlatConfig, storybook's
 * pre-eslint-10 RuleModule, react's @types/eslint 8), so no common supertype
 * exists and every cross-package spread fails to typecheck against eslint 10's
 * `Config`. The runtime shapes are the flat configs eslint executes — resolved
 * parity is asserted with `eslint --print-config` in CI — so this is the one
 * sanctioned seam; keep it the only assertion in the package.
 */
function compat(config: object | readonly object[]): ExtensionConfigObject[] {
  return (Array.isArray(config) ? config : [config]) as ExtensionConfigObject[];
}

/**
 * The shared baseline: identical rule activation for every consumer. A
 * consumer's config is `defineConfig([...baseline({...}), { OVERRIDES }])` —
 * anything it needs to differ on is a trailing override with a stated
 * mechanism, never a divergent baseline.
 */
export function baseline(options: BaselineOptions): ConfigObject[] {
  const {
    tsconfigRootDir,
    ignores = [],
    srcGlobs = DEFAULT_SRC_GLOBS,
    react: reactOption = false,
    tests = false,
    storybook: useStorybook = false,
    strict = true,
    untypedGlobs = [],
  } = options;
  const testGlobs = options.testGlobs ?? DEFAULT_TEST_GLOBS;
  const reactGlobs =
    reactOption === true
      ? srcGlobs
      : reactOption === false
        ? null
        : reactOption;

  /*
   * Shared between the srcGlobs block and reactBlock: eslint replaces (never
   * merges) a rule's options, and reactBlock comes later in the config array,
   * so its no-restricted-syntax must carry this entry too or react files
   * would lose the barrel ban.
   */
  const exportAllBan = {
    selector: "ExportAllDeclaration",
    message:
      "Barrel re-exports are not used in this repo — import from the concrete module instead.",
  };

  // Typed as a standalone value: inside the conditional spread below there is
  // no contextual type, so the "off" literals would widen to `string`.
  const reactBlock: ConfigWithExtends | null = reactGlobs
    ? {
        files: reactGlobs,
        extends: [
          compat(react.configs.flat.recommended),
          compat(jsxA11y.flatConfigs.recommended),
          compat(reactHooks.configs.flat.recommended),
        ],
        /*
         * Pinned, not "detect": eslint-plugin-react 7.37.5 sniffs the
         * version via `context.getFilename()`, removed in eslint 10 —
         * "detect" crashes the whole run before any rule executes.
         */
        settings: { react: { version: "19.0.4" } },
        rules: {
          // The new JSX transform makes the React import unnecessary, and
          // props are typed by TypeScript, not declared at runtime.
          "react/react-in-jsx-scope": "off",
          "react/prop-types": "off",
          /*
           * React 19 passes `ref` as a plain prop, and the repos migrated all
           * production forwardRef call sites; the wrapper only re-adds the
           * (props, ref) split and displayName boilerplate. Both spellings are
           * banned: the named import via a syntax selector (not
           * no-restricted-imports with importNames, which also flags every
           * `import * as React` namespace import), and the React.forwardRef
           * member via no-restricted-properties.
           */
          "no-restricted-syntax": [
            "error",
            exportAllBan,
            {
              selector:
                'ImportDeclaration[source.value="react"] ImportSpecifier[imported.name="forwardRef"]',
              message:
                "React 19: take `ref` as a regular prop instead of wrapping in forwardRef.",
            },
          ],
          "no-restricted-properties": [
            "error",
            {
              object: "React",
              property: "forwardRef",
              message:
                "React 19: take `ref` as a regular prop instead of wrapping in forwardRef.",
            },
          ],
        },
      }
    : null;

  return defineConfig([
    ...(ignores.length > 0 ? [{ ignores }] : []),

    compat(js.configs.recommended),
    compat(
      strict
        ? tseslintConfigs.strictTypeChecked
        : tseslintConfigs.recommendedTypeChecked,
    ),

    /*
     * Re-enabled against tseslint's eslintRecommended layer, which turns it
     * off as the compiler's job. It is not: `allowUnreachableCode` defaults to
     * undefined, so TS7027 is an editor suggestion and `tsc --noEmit` passes,
     * and no consumer's tsconfig sets it. Syntactic, so it needs no type
     * information and covers the untyped escape-hatch files too.
     */
    { rules: { "no-unreachable": "error" } },

    /*
     * On every file, not just srcGlobs: the tseslint 8.69 parser refuses to
     * run at all — even with projectService off — when it cannot infer a
     * unique root ("multiple candidate TSConfigRootDirs"), which is the
     * steady state in the editor repos once eslint-config nests inside them.
     */
    { languageOptions: { parserOptions: { tsconfigRootDir } } },

    {
      files: srcGlobs,
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            // `const { drop, ...rest } = x` is the idiomatic way to omit a key.
            ignoreRestSiblings: true,
          },
        ],
        /*
         * Barrels were removed from these repos deliberately; `export *` is
         * the construct that reintroduces them, and no stock rule bans it.
         */
        "no-restricted-syntax": ["error", exportAllBan],
        /*
         * `ignoreArrowShorthand`: `onClick={() => apply(x)}` is the idiomatic
         * React handler, and its void return is never mistaken for a value —
         * 589 of the 595 findings across the seven consumers were that one
         * shape. What the rule is worth keeping for is the other six:
         * `return someVoidCall()` in a block body, and a void call placed
         * inside a larger expression, both of which read as producing a value.
         */
        "@typescript-eslint/no-confusing-void-expression": [
          "error",
          { ignoreArrowShorthand: true },
        ],
        /*
         * `allowNumber`: a number stringifies unambiguously, so `${count}` cannot
         * produce the output this rule exists to prevent. The other five are
         * spelled out because an options object REPLACES the one
         * strictTypeChecked set, and this rule's own defaults turn allowAny,
         * allowBoolean, allowNullish and allowRegExp back on — a nullish value
         * reaching output as "undefined" is the exact defect being guarded
         * against, so each of those needs an explicit conversion at the site.
         */
        "@typescript-eslint/restrict-template-expressions": [
          "error",
          {
            allowNumber: true,
            allowAny: false,
            allowBoolean: false,
            allowNever: false,
            allowNullish: false,
            allowRegExp: false,
          },
        ],
        // No bundle here enables these; they are pinned so a wider bundle
        // later cannot. An inferred return type is not a defect.
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },

    {
      files: srcGlobs,
      extends: [
        compat(importXConfigs.recommended),
        compat(importXConfigs.typescript),
      ],
      /*
       * flatConfigs.typescript sets the LEGACY `import-x/resolver: {typescript:
       * true}`, which looks the resolver package up from the consumer — where
       * it may be absent or an incompatible major ("invalid interface loaded
       * as resolver"). resolver-next takes precedence and binds the resolver
       * instance this package ships, so resolution cannot vary by consumer.
       */
      settings: {
        "import-x/resolver-next": [createTypeScriptImportResolver()],
      },
    },

    ...(reactBlock ? [reactBlock] : []),

    ...(useStorybook ? [compat(storybookConfigs["flat/recommended"])] : []),

    ...(tests === "vitest"
      ? [{ files: testGlobs, extends: [compat(vitest.configs.recommended)] }]
      : []),
    ...(tests === "jest"
      ? [
          {
            files: testGlobs,
            extends: [compat(jest.configs["flat/recommended"])],
          },
        ]
      : []),

    {
      files: [
        "**/*.{js,cjs,mjs}",
        "eslint.config.ts",
        "eslint.config.mjs",
        ...untypedGlobs,
      ],
      /*
       * `disableTypeChecked` carries its own `languageOptions`, so it must be
       * extended here (merged first) rather than spread after `globals` — the
       * other order silently drops the node globals.
       */
      extends: [compat(tseslintConfigs.disableTypeChecked)],
      languageOptions: { globals: globals.node },
      // These are CommonJS tooling configs; `require` is the correct form there.
      rules: { "@typescript-eslint/no-require-imports": "off" },
    },
  ]);
}
