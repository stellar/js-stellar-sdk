module.exports = {
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    // OFF
    'class-methods-use-this': 0,
    'linebreak-style': 0,
    'no-underscore-dangle': 0,
    'prefer-destructuring': 0,
    'lines-between-class-members': 0,

    // WARN
    'no-console': ['warn', { allow: ['assert'] }],
    'no-debugger': 1,
    'no-unused-vars': 1,
    'arrow-body-style': 1,
    'valid-jsdoc': [1],
    'prefer-const': 1,
    'object-shorthand': 1,
    'require-await': 1,

    // ERROR
    'no-unused-expressions': [2, { allowTaggedTemplates: true }],
  },
  parser: 'babel-eslint',
};
