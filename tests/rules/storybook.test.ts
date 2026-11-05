import { ESLint } from 'eslint'
import type { Linter } from 'eslint'
import storybookPlugin from 'eslint-plugin-storybook'
import { describe, expect, it } from 'vitest'

import { FIXTURE_DIR, STORYBOOK_MAIN_FILES, STORY_FILES, scoped } from '../../scripts/eslint-for.ts'
import base from '../../src/index.ts'
import storybook, { storybookMain } from '../../src/storybook.ts'
import test from '../../src/test.ts'

import { describeRules } from './cases.ts'

const config = [...base, ...scoped(STORY_FILES, test, storybook)]
const mainConfig = [...base, ...scoped(STORYBOOK_MAIN_FILES, storybookMain)]

const FILE = 'src/lint-text.stories.tsx'
const MAIN_FILE = '.storybook/main.ts'

const HEAD =
  'import type { Meta } from "@storybook/react-vite"\n\nimport { Button } from "./button"\n\n'
const META = '{ component: Button }'
const PRIMARY = 'export const Primary = { args: { label: "Save" } }'

/** A story file whose meta is `meta`, followed by `body`; `head` replaces the default imports. */
function stories(body: string, meta = META, head = HEAD): string {
  return `${head}const meta = ${meta} satisfies Meta<typeof Button>\n\nexport default meta\n\n${body}\n`
}

/** `.storybook/main.ts` registering `addons`. */
function main(addons: string): string {
  return `import type { StorybookConfig } from "@storybook/react-vite"\n\nconst config: StorybookConfig = {\n  framework: "@storybook/react-vite",\n  stories: ["../src/**/*.stories.tsx"],\n  addons: [${addons}],\n}\n\nexport default config\n`
}

const CLICK = 'userEvent.click(within(canvasElement).getByRole("button"))'

/** A `play` that clicks the button, its last import from `source`. */
function interaction(source: string, call: string): string {
  return `import { Button } from "./button"\nimport { userEvent, within } from "${source}"\n\nconst meta = ${META}\n\nexport default meta\n\nexport const Primary = {\n  async play({ canvasElement }) {\n    ${call}\n  },\n}\n`
}

describeRules(config, FILE, [
  {
    rule: 'storybook/await-interactions',
    // The rule recognises only the legacy `@storybook/test` source.
    invalid: [interaction('@storybook/test', CLICK)],
    valid: [interaction('@storybook/test', `await ${CLICK}`)],
  },
  {
    rule: 'storybook/context-in-play-function',
    invalid: [],
    valid: [
      stories(
        `${PRIMARY}\n\nexport const Clicked = {\n  async play(context) {\n    await Primary.play?.(context)\n  },\n}`,
      ),
    ],
  },
  {
    rule: 'storybook/csf-component',
    invalid: [stories(PRIMARY, '{ args: { label: "Save" } }')],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/default-exports',
    invalid: [
      `import { Button } from "./button"\n\nexport const Primary = { args: { label: "Save" } }\n`,
    ],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/hierarchy-separator',
    invalid: [stories(PRIMARY, '{ component: Button, title: "Forms|Button" }')],
    valid: [stories(PRIMARY, '{ component: Button, title: "Forms/Button" }')],
  },
  {
    rule: 'storybook/meta-inline-properties',
    invalid: [
      stories(
        PRIMARY,
        '{ component: Button, args: ARGS }',
        `${HEAD}const ARGS = { label: "Save" }\n\n`,
      ),
    ],
    valid: [stories(PRIMARY, '{ component: Button, args: { label: "Save" } }')],
  },
  {
    rule: 'storybook/meta-satisfies-type',
    invalid: [
      `${HEAD}const meta: Meta<typeof Button> = ${META}\n\nexport default meta\n\n${PRIMARY}\n`,
    ],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/no-redundant-story-name',
    invalid: [stories('export const Primary = { name: "Primary" }')],
    valid: [stories('export const Primary = { name: "Primary button" }')],
  },
  {
    rule: 'storybook/no-renderer-packages',
    invalid: [stories(PRIMARY, META, HEAD.replace('@storybook/react-vite', '@storybook/react'))],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/no-stories-of',
    invalid: [
      `import { storiesOf } from "@storybook/react-vite"\n\nimport { Button } from "./button"\n\nstoriesOf("Button", module).add("primary", () => Button)\n`,
    ],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/no-title-property-in-meta',
    invalid: [stories(PRIMARY, '{ component: Button, title: "Forms/Button" }')],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/no-uninstalled-addons',
    invalid: [],
    valid: [stories(PRIMARY, '{ component: Button, addons: ["@storybook/addon-missing"] }')],
  },
  {
    rule: 'storybook/prefer-pascal-case',
    invalid: [stories('export const primary = { args: { label: "Save" } }')],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/story-exports',
    invalid: [stories('')],
    valid: [stories(PRIMARY)],
  },
  {
    rule: 'storybook/use-storybook-expect',
    invalid: [
      stories(
        'export const Primary = {\n  play() {\n    expect(1).toBe(1)\n  },\n}',
        META,
        `import { expect } from "vitest"\n\n${HEAD}`,
      ),
    ],
    valid: [
      stories(
        'export const Primary = {\n  async play() {\n    await expect(1).toBe(1)\n  },\n}',
        META,
        `import { expect } from "storybook/test"\n\n${HEAD}`,
      ),
    ],
  },
  {
    rule: 'storybook/use-storybook-testing-library',
    invalid: [],
    valid: [stories(PRIMARY, META, `import { screen } from "@testing-library/react"\n\n${HEAD}`)],
  },
  {
    rule: 'konceptware-storybook/use-storybook-testing-library',
    invalid: [stories(PRIMARY, META, `import { screen } from "@testing-library/react"\n\n${HEAD}`)],
    valid: [stories(PRIMARY, META, `import { screen } from "storybook/test"\n\n${HEAD}`)],
  },
  {
    // Both meta forms pass: the base rule doesn't treat `{…} satisfies Meta` as anonymous.
    rule: 'import-x/no-anonymous-default-export',
    invalid: [],
    valid: [
      stories(PRIMARY),
      `${HEAD}export default ${META} satisfies Meta<typeof Button>\n\n${PRIMARY}\n`,
    ],
  },
])

describeRules(mainConfig, MAIN_FILE, [
  {
    rule: 'storybook/no-uninstalled-addons',
    invalid: [main('"@storybook/addon-missing"')],
    // `package.json` resolves against the process cwd: this repository's, which has the plugin.
    valid: [main('"./local-addon"'), main('"eslint-plugin-storybook"')],
  },
])

describe('konceptware-storybook/use-storybook-testing-library', () => {
  // `render` is used, or `no-unused-vars` would remove the import under --fix.
  const code = stories(
    'export const Primary = {\n  play() {\n    render(Button)\n  },\n}',
    META,
    `import { render } from "@testing-library/react"\n\n${HEAD}`,
  )

  it('reports without rewriting the import under --fix', async () => {
    const fixer = new ESLint({
      cwd: FIXTURE_DIR,
      overrideConfigFile: true,
      overrideConfig: config,
      fix: true,
    })
    const [result] = await fixer.lintText(code, { filePath: FILE })

    // Other base rules may fix the snippet, so only the import is checked.
    expect(result?.output ?? code).toContain('from "@testing-library/react"')
    expect(result?.messages.map((message) => message.ruleId)).toContain(
      'konceptware-storybook/use-storybook-testing-library',
    )
  })

  it('keeps the suggestion to import from storybook/test', async () => {
    const [result] = await new ESLint({
      cwd: FIXTURE_DIR,
      overrideConfigFile: true,
      overrideConfig: config,
    }).lintText(code, { filePath: FILE })
    const message = result?.messages.find(
      ({ ruleId }) => ruleId === 'konceptware-storybook/use-storybook-testing-library',
    )

    expect(message?.suggestions?.map((suggestion) => suggestion.fix.text)).toContain(
      'storybook/test',
    )
  })

  it('coexists with a consumer registering eslint-plugin-storybook', async () => {
    const consumer: Linter.Config[] = [
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the same cast a consumer needs; the plugin's `configs` don't fit ESLint's `Plugin` type
      { files: STORY_FILES, plugins: { storybook: storybookPlugin as unknown as ESLint.Plugin } },
    ]
    const [result] = await new ESLint({
      cwd: FIXTURE_DIR,
      overrideConfigFile: true,
      overrideConfig: consumer,
    }).lintText(code, { filePath: FILE })

    expect(result?.messages.map((message) => message.ruleId)).toContain(
      'konceptware-storybook/use-storybook-testing-library',
    )
  })
})
