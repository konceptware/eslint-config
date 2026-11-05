---
'@konceptware/eslint-config': minor
---

New `createStylelintConfig({ tokenPrefix })` in `@konceptware/eslint-config/stylelint`: `stylelint-config-standard` (now installed with this package), the design-token rule, `--<tokenPrefix>-…` custom property names and CSS-modules allowances in one call. The `stylelint` peer dependency narrows to `^18.0.0`, which `stylelint-config-standard` 41 requires.
