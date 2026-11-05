import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import type { Linter } from 'eslint'
import { defineConfig } from 'eslint/config'

export const FIXTURE_DIR = fileURLToPath(new URL('../tests/fixtures/project', import.meta.url))

/*
 * The fixture project's layout: unit tests and stories sit next to the sources, e2e specs
 * under `e2e/`.
 */
export const UNIT_TEST_FILES = ['src/**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}']
export const E2E_TEST_FILES = ['e2e/**/*.{ts,js,mts,mjs}']
export const STORY_FILES = ['src/**/*.stories.{ts,tsx}']
export const STORYBOOK_MAIN_FILES = ['.storybook/main.ts']

/** `presets` limited to `files`, the way a consumer scopes the file-agnostic presets. */
export function scoped(files: string[], ...presets: Linter.Config[][]): Linter.Config[] {
  return defineConfig({ files, extends: presets })
}

export function eslintFor(config: Linter.Config[]): ESLint {
  return new ESLint({ cwd: FIXTURE_DIR, overrideConfigFile: true, overrideConfig: config })
}

export async function ruleIdsFor(config: Linter.Config[], file: string): Promise<string[]> {
  const [result] = await eslintFor(config).lintFiles([file])
  return (result?.messages ?? []).map((message) => message.ruleId ?? '<parse error>')
}

/**
 * Lints `code` as if it were `filePath` inside the fixture project and returns the
 * reported rule ids; a parse error is reported as `<parse error>`, an unused directive
 * as `<unused directive>`. `filePath` must be included by the fixture tsconfig and must
 * not share a basename with another fixture (`a.ts` next to `a.tsx`): TypeScript keeps
 * only one of them in the program, and the project service rejects the other.
 */
export async function lintSnippet(
  config: Linter.Config[],
  code: string,
  filePath: string,
): Promise<string[]> {
  const [result] = await eslintFor(config).lintText(code, { filePath })
  return (result?.messages ?? []).map((message) => {
    if (message.ruleId !== null) return message.ruleId
    return message.fatal ? '<parse error>' : '<unused directive>'
  })
}

/** Config ESLint resolves for `filePath` (relative to the fixture project) under `config`. */
export async function resolvedConfig(
  config: Linter.Config[],
  filePath: string,
): Promise<Linter.Config> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- eslint's types declare calculateConfigForFile as Promise<any>; it resolves to the merged flat config
  return (await eslintFor(config).calculateConfigForFile(filePath)) as Linter.Config
}

/** Rules in effect for `filePath` (relative to the fixture project) under `config`. */
export async function resolvedRules(
  config: Linter.Config[],
  filePath: string,
): Promise<Partial<Linter.RulesRecord>> {
  return (await resolvedConfig(config, filePath)).rules ?? {}
}

/** Normalised severity of a rule entry; `undefined` means the config never mentions the rule. */
export function severity(
  entry: Linter.RuleEntry | undefined,
): 'off' | 'warn' | 'error' | undefined {
  if (entry === undefined) return undefined
  const level = Array.isArray(entry) ? entry[0] : entry
  if (level === 0 || level === 'off') return 'off'
  if (level === 1 || level === 'warn') return 'warn'
  return 'error'
}
