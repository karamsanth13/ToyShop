import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["client/build/**", "client/dist/**", "node_modules/**", "coverage/**", "prisma/migrations/**"] },
  {
    files: ["client/src/**/*.{js,jsx}", "server/**/*.js", "scripts/**/*.js", "tests/**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } },
    plugins: { "@eslint/js": js },
    rules: { ...js.configs.recommended.rules, "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] },
  },
  { files: ["client/src/**/*.jsx"], rules: { "no-unused-vars": "off" } },
  { files: ["scripts/load-test.js"], languageOptions: { globals: { __ENV: "readonly", __VU: "readonly", __ITER: "readonly", sleep: "readonly", http: "readonly", check: "readonly" } } },
]);
