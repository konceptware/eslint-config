import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/test.ts',
    'src/vitest.ts',
    'src/jest.ts',
    'src/playwright.ts',
    'src/react.ts',
    'src/storybook.ts',
    'src/stylelint.ts',
  ],
  format: 'esm',
  platform: 'node',
  dts: true,
  clean: true,
})
