module.exports = {
  env: {
    mocha: true,
  },
  parser: "@babel/eslint-parser",
  plugins: ["@babel"],
  globals: {
    StellarSdk: true,
    axios: true,
    chai: true,
    sinon: true,
    expect: true,
    HorizonAxiosClient: true,
  },
  rules: {
    "no-unused-vars": 0,
  },
};
