const webpackConfig = require("./webpack.config.browser.js");

delete webpackConfig.plugins;
delete webpackConfig.output;

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

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true,
    },

    singleRun: true,

    reporters: ["dots"],
  });
};
