import { baseline } from "@real-acrm/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...baseline({
    tsconfigRootDir: import.meta.dirname,
    react: true,
    tests: "vitest",
    storybook: true,
  }),
]);
