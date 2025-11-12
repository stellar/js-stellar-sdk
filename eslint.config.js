const path = require("node:path");

const { includeIgnoreFile } = require("@eslint/compat");
const { configs } = require("eslint-config-airbnb-extended/legacy");
const prettierConfigRules = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const importPlugin = require("eslint-plugin-import");
const jsdoc = require("eslint-plugin-jsdoc");
const gitignorePath = path.resolve(".", ".gitignore");

configs.base.typescript[0].languageOptions.parserOptions.projectService = false;
configs.base.typescript[0].languageOptions.parserOptions.project = [
  "./config/tsconfig.json",
];
const typescriptConfig = [
  // Airbnb Base TypeScript Config
  ...configs.base.typescript,
  {
    name: "typescript/custom-rules",
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/require-await": "error",
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
// console.log(ignoreFiles);
ignoreFiles.ignores.push(...["eslint.config.js", "config/**/*"]);
module.exports = [
  // Ignore .gitignore files/folder in eslint
  ignoreFiles,
  // Import Plugin Config
  ...importConfig,
  // TypeScript Config
  ...typescriptConfig,
  // JSDoc Config
  ...jsDocConfig,
  // Test Config
  ...testConfig,
  // Prettier Config
  ...prettierConfig,
];
