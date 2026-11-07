---
'@konceptware/eslint-config': minor
---

`object-shorthand` no longer rewrites a block-bodied arrow property into a method (`avoidExplicitReturnArrows: false`). The method form gains its own `this`, so `@typescript-eslint/unbound-method` then reported every such function once destructured or passed on, such as a hook's returned handlers.
