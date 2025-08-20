const webpackConfig = require('./webpack.config.browser.js');
const buildConfig = require('./build.config');

delete webpackConfig.output;
delete webpackConfig.entry; // karma fills these in
webpackConfig.plugins.shift(); // drop eslinter plugin

function getStellarSdkFileName() {
  let name = 'stellar-sdk';
  if (!buildConfig.useAxios) name += '-no-axios';
  if (!buildConfig.useEventSource) name += '-no-eventsource';
  return name + '.js';
}

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    browsers: ['FirefoxHeadless', 'ChromeHeadless'],

    files: [
      '../dist/' + getStellarSdkFileName(), 
      '../test/test-browser.js',
      '../test/unit/**/*.js'
    ],

    preprocessors: {
      '../test/**/*.js': ['webpack']
    },

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },

    colors: true,
    singleRun: true,

    reporters: ['dots', 'coverage'],
    coverageReporter: {
      type: 'text-summary',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    }
  });
};
