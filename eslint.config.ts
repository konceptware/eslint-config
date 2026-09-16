import { defineConfig } from "eslint/config";
import { baseline } from "./src/index";

export default defineConfig([
  ...baseline({
    tsconfigRootDir: __dirname,
    // The smoke consumer's fixtures contain deliberate violations (that is
    // what they test); it lints under its own config, from inside `.smoke/`.
    ignores: [".smoke/**"],
  }),
]);
