import path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import { configs } from "eslint-config-airbnb-extended/legacy";
import prettierConfigRules from "eslint-config-prettier/flat";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
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
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
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

const jsDocConfig = [
  // configuration included in plugin
  jsdoc.configs["flat/recommended-typescript"],
  // other configuration objects...
  {
    files: ["**/*.ts"],
    // `plugins` here is not necessary if including the above config
    plugins: {
      jsdoc,
    },
    rules: {
      "jsdoc/check-tag-names": [
        "error",
        { definedTags: ["warning", "category"] },
      ],
      "jsdoc/require-description": "warn",
      "jsdoc/no-undefined-types": "warn",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "jsdoc/no-blank-blocks": "off",
      "jsdoc/no-multi-asterisks": "off",
      "jsdoc/tag-lines": "off",
      "jsdoc/require-jsdoc": "off",
      "jsdoc/no-defaults": "off",
      "jsdoc/no-types": "off",
      "jsdoc/reject-function-type": "off",
      "jsdoc/reject-any-type": "off",
      "jsdoc/require-description": "off",
    },
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
      "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
      "@typescript-eslint/naming-convention": "off",
      "jsdoc/no-undefined-types": "off",
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
  // JSDoc Config
  ...jsDocConfig,
  // Test Config
  ...testConfig,
  // Base SDK overrides (must come after typescriptConfig/jsDocConfig)
  ...baseSdkConfig,
  // Prettier Config
  ...prettierConfig,
];
