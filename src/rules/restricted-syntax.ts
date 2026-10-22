/**
 * Entries of our `no-restricted-syntax` setting. A consumer who sets the rule replaces the
 * whole list, so they spread this in to keep ours.
 */
export const restrictedSyntax = [
  {
    selector: 'ForInStatement',
    message: 'for…in also walks inherited keys; use Object.keys/Object.entries or for…of.',
  },
  {
    selector: 'TSEnumDeclaration',
    message:
      'Enums are runtime code that Node type stripping rejects; use an `as const` object and derive its type.',
  },
  {
    /*
     * Ambient `declare module`/`declare global` blocks augment existing interfaces, which only
     * `interface` can do.
     */
    selector:
      'TSInterfaceDeclaration:not(TSModuleDeclaration[declare=true] TSInterfaceDeclaration)',
    message:
      'Use a `type` alias; `interface` is reserved for augmenting declarations inside `declare module`/`declare global`.',
  },
  {
    selector: 'ExportAllDeclaration',
    message:
      'Name each re-exported member (`export { a, b } from …`); `export *` hides what the module exposes and where it comes from.',
  },
  {
    // Relative, `@/`, `~/` and `#` subpath specifiers are the repo's own modules.
    selector: String.raw`ImportDeclaration[source.value=/^(\.|[@~]\/|#)/] > ImportNamespaceSpecifier`,
    message: 'Import the members you use by name; `import * as` is reserved for external packages.',
  },
] as const
