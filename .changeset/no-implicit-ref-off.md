---
'@konceptware/eslint-config': minor
---

`@eslint-react/no-implicit-ref` is off: it reports every spread carrying a non-React-typed `ref`, such as React Hook Form's `{...field}`, without checking whether the target accepts a ref. A target-aware replacement is tracked in konceptware/eslint-config#1.
