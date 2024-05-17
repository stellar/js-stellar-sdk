module.exports = {
  env: {
    es6: true,
  },
  extends: [
    "airbnb-base",
    "prettier",
    "plugin:jsdoc/recommended",
  ],
  plugins: ["@babel", "prettier", "prefer-import"],
  rules: {
    "node/no-unpublished-require": 0,
  },
};
