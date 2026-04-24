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
  "./config/tsconfig.json",
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
  ...["eslint.config.js", "rollup.config.mjs", "config/**/*"],
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
  // Prettier Config
  ...prettierConfig,
];
