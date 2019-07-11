const webpackConfig = require("./webpack.config.browser.js");

delete webpackConfig.plugins;
delete webpackConfig.output;

module.exports = function(config) {
  var customLaunchers = {
    sl_chrome_49: {
      base: "SauceLabs",
      browserName: "chrome",
      version: "49",
    },
    sl_chrome_latest: {
      base: "SauceLabs",
      browserName: "chrome",
      version: "latest",
    },
    sl_firefox_42: {
      base: "SauceLabs",
      browserName: "firefox",
      version: "42",
    },
    sl_firefox_latest: {
      base: "SauceLabs",
      browserName: "firefox",
      version: "latest",
    },
    sl_edge_17: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      version: "17",
    },
  };

  config.set({
    sauceLabs: {
      testName: "js-stellar-sdk",
      recordScreenshots: false,
      recordVideo: false,
    },

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 4 * 60 * 1000,
    captureTimeout: 4 * 60 * 1000,

    frameworks: ["mocha", "chai-as-promised", "chai", "sinon", "commonjs"],
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),

    files: ["dist/stellar-sdk.js", "test/test-browser.js", "test/unit/**/*.js"],

    preprocessors: {
      "test/**/*.js": ["webpack", "commonjs"],
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true,
    },

    singleRun: true,

    reporters: ["dots", "saucelabs"],
  });
};
