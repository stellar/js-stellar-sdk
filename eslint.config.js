import path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import { configs } from "eslint-config-airbnb-extended/legacy";
import prettierConfigRules from "eslint-config-prettier/flat";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import tsdoc from "eslint-plugin-tsdoc";
import js from "@eslint/js";
import globals from "globals";

const gitignorePath = path.resolve(".", ".gitignore");

configs.base.typescript[0].languageOptions.parserOptions.projectService = false;
configs.base.typescript[0].languageOptions.parserOptions.project = [
  "./tsconfig.json",
];

const javascriptConfig = [
  js.configs.recommended,
  {
    name: "javascript/node-globals",
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
const typescriptConfig = [
  // Airbnb Base TypeScript Config
  ...configs.base.typescript,
  {
    name: "typescript/custom-rules",
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/require-await": "error",
      // Delegated to TypeScript's `noUnusedLocals` / `noUnusedParameters`
      // (set in tsconfig.json) — TS understands JSDoc `{@link}` references,
      // typescript-eslint's no-unused-vars does not.
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-fallthrough": "off",
    },
  },
];
const prettierConfig = [
  // Prettier Plugin and Config
  {
    name: "prettier/config",
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfigRules.rules,
      "prettier/prettier": ["error"],
    },
  },
];

const tsdocConfig = [
  {
    name: "tsdoc/syntax",
    files: ["**/*.ts"],
    plugins: { tsdoc },
    rules: { "tsdoc/syntax": "warn" },
  },
];

const testConfig = [
  {
    name: "test/typescript",
    files: ["test/**/*.ts", "test/**/*.tsx", "test/**/*.js"],
    languageOptions: {
      parserOptions: {
        project: "./test/tsconfig.json",
      },
    },
    rules: {
      "no-unused-vars": 0,
      radix: 0,
      "@typescript-eslint/no-throw-literal": 0,
    },
  },
];

const scriptsConfig = [
  {
    name: "scripts/typescript",
    files: ["scripts/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./scripts/tsconfig.json",
      },
    },
  },
];

// The base XDR/SDK module preserves a public API shape (namespace+const merging,
// XDR-string-literal type aliases, snake_case helpers like `best_r`, leading-_
// internals) and uses a "public API at top, helpers below" file layout. Loosen
// rules that would otherwise force breaking renames or large reorders.
const baseSdkConfig = [
  {
    name: "base/sdk-public-api",
    files: ["src/base/**/*.ts"],
    rules: {
      "@typescript-eslint/no-redeclare": "off",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false },
      ],
      "@typescript-eslint/naming-convention": "off",
    },
  },
];

// scripts/build-docs.ts dispatches a discriminated-union renderer through
// mutually recursive helpers; function-declaration hoisting handles the
// runtime ordering. Match baseSdkConfig's `functions: false` loosening.
const scriptsRulesConfig = [
  {
    name: "scripts/mutual-recursion",
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false },
      ],
    },
  },
];

const importConfig = [
  {
    name: "import/plugin/config",
    plugins: {
      import: importPlugin,
    },
  },
];
const ignoreFiles = includeIgnoreFile(gitignorePath);
ignoreFiles.ignores.push(
  ...[
    "eslint.config.js",
    "rollup.config.mjs",
    "config/**/*",
    "src/base/generated/**",
    // Astro build-time configs — excluded from tsconfig.json (they
    // import the virtual `astro:content` module), so the typescript-
    // eslint parser can't resolve them via the SDK project. Lint
    // coverage from prettier is sufficient for these small configs.
    "src/content.config.ts",
    "astro.config.mjs",
  ],
);
export default [
  // Ignore .gitignore files/folder in eslint
  ignoreFiles,
  // Import Plugin Config
  ...importConfig,
  // JavaScript Config
  ...javascriptConfig,
  // TypeScript Config
  ...typescriptConfig,
  // TSDoc Config
  ...tsdocConfig,
  // Test Config
  ...testConfig,
  // Scripts Config (uses scripts/tsconfig.json for type-aware lint)
  ...scriptsConfig,
  // Base SDK overrides (must come after typescriptConfig/tsdocConfig)
  ...baseSdkConfig,
  // Scripts overrides (must come after typescriptConfig/scriptsConfig)
  ...scriptsRulesConfig,
  // Prettier Config
  ...prettierConfig,
];
