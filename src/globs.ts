/*
 * Globs here describe syntax, never project layout: which files a rule can parse or
 * type-check. Which files are tests, e2e specs or build output is the consumer's call.
 */
export const TS_FILES = ['**/*.{ts,tsx,mts,cts}']
export const JS_FILES = ['**/*.{js,jsx,mjs,cjs}']
export const SOURCE_FILES = [...TS_FILES, ...JS_FILES]
export const DECLARATION_FILES = ['**/*.d.{ts,mts,cts}']

export const REACT_FILES = ['**/*.{tsx,jsx}']
