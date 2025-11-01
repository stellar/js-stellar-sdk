module.exports = {
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./test/tsconfig.json",
  },
  rules: {
    "no-unused-vars": 0,
    radix: 0,
    "@typescript-eslint/no-throw-literal": 0,
  },
};
