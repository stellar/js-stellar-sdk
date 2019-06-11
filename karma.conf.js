const webpackConfig = require("./webpack.config.browser.js");

const { output, plugins, ...webpackKarmaConfig } = webpackConfig;

module.exports = function(config) {
  config.set({
    frameworks: ["mocha", "chai-as-promised", "chai", "sinon"],
    browsers: ["Firefox"],

    files: [
      "dist/stellar-sdk.js",
      "test/test-helper.js",
      "test/unit/**/*.js",
      "test/integration/server_test.js",
    ],

    preprocessors: {
      "test/**/*.js": ["webpack"],
    },

    webpack: webpackKarmaConfig,

    webpackMiddleware: {
      noInfo: true,
    },

    singleRun: true,

    reporters: ["dots"],
  });
};
