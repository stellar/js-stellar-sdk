module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    browsers : ["Firefox"],

    files: [
      'dist/stellar-lib.js',
      'test/setup/browser.js',
      'test/unit/**/*.js'
    ],

    preprocessors: {
      'test/unit/**/*.js': ['webpack']
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

    reporters: ['dots'],
  });
};
