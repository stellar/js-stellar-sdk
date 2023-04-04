module.exports = {
  env: {
    es6: true
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['@babel', 'prettier', 'prefer-import'],
  parser: '@babel/eslint-parser',
  rules: {
    'node/no-unpublished-require': 0
  }
};
