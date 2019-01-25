module.exports = {
  env: {
    mocha: true
  },
  plugins: ['mocha'],
  globals: {
    StellarSdk: true,
    axios: true,
    chai: true,
    sinon: true,
    expect: true
  },
  rules: {
    'no-unused-vars': 0
  }
};
