/*
 * eslint-plugin-jsx-a11y 6.10.2 ships no type declarations at all (TS7016).
 * Only the surface this package reads is declared; widen here if more of the
 * plugin is ever consumed.
 */
declare module "eslint-plugin-jsx-a11y" {
  import type { Linter } from "eslint";

  const plugin: {
    flatConfigs: {
      recommended: Linter.Config;
      strict: Linter.Config;
    };
  };
  export default plugin;
}
