module.exports = function(config) {
  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '49'
    },
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: 'latest'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '42'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'latest'
    },
    sl_edge: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      version: '20'
    }
  };

  config.set({
    sauceLabs: {
      testName: 'js-stellar-sdk',
      recordScreenshots: false,
      recordVideo: false
    },

    browserDisconnectTimeout : 10000,
    browserDisconnectTolerance : 1,
    browserNoActivityTimeout : 4*60*1000,
    captureTimeout : 4*60*1000,

    frameworks: ['mocha', 'chai-as-promised', 'chai', 'sinon'],
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),

    files: [
      'dist/stellar-sdk.js',
      'test/test-helper.js',
      'test/unit/**/*.js'
    ],

    preprocessors: {
      'test/**/*.js': ['webpack']
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    singleRun: true,

    reporters: ['dots', 'saucelabs']
  });
};
