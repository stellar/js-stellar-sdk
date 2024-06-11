module.exports = {
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "prettier",
    "plugin:jsdoc/recommended",
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: "./config/tsconfig.json",
  },
  rules: {
    // OFF
    "import/prefer-default-export": 0,
    "node/no-unsupported-features/es-syntax": 0,
    "node/no-unsupported-features/es-builtins": 0,
    camelcase: 0,
    "class-methods-use-this": 0,
    "linebreak-style": 0,
    "jsdoc/require-returns": 0,
    "jsdoc/require-param": 0,
    "jsdoc/require-param-type": 0,
    "jsdoc/require-returns-type": 0,
    "jsdoc/no-blank-blocks": 0, 
    "jsdoc/no-multi-asterisks": 0,
    "jsdoc/tag-lines": "off",
    "jsdoc/require-jsdoc": "off",
    "valid-jsdoc": "off",
    "import/extensions": 0,
    "new-cap": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": 0,
    "prefer-destructuring": 0,
    "lines-between-class-members": 0,
    "spaced-comment": 0,

    // WARN
    "arrow-body-style": 1,
    "no-console": ["warn", { allow: ["assert"] }],
    "no-debugger": 1,
    "object-shorthand": 1,
    "prefer-const": 1,
    "prefer-import/prefer-import-over-require": [1],
    "require-await": 1,

    // ERROR
    "no-unused-expressions": [2, { allowTaggedTemplates: true }],
  },
};
