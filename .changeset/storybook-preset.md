---
'@konceptware/eslint-config': minor
---

New `/storybook` preset for story files, with `storybookMain` for `.storybook/main.*`. Requires the optional peer `eslint-plugin-storybook`. Every rule is decided explicitly: `context-in-play-function` is off, and `use-storybook-testing-library` runs as `konceptware-storybook/use-storybook-testing-library` without its autofix.
